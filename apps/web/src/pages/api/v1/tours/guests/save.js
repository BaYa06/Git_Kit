import { Pool } from "pg";
import jwt from "jsonwebtoken";
import eventHub, { EVENT_TYPES } from "../../../../../lib/eventHub";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const isDev = process.env.NODE_ENV !== "production";

function tokenFromCookie(req) {
  const cookie = req.headers.cookie || "";
  const pair = cookie.split("; ").find((c) => c.startsWith("gidkit_token="));
  return pair ? decodeURIComponent(pair.split("=")[1]) : null;
}

const normalizeMoney = (v) => {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : 0;
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const token = tokenFromCookie(req);
  if (!token) return res.status(401).json({ message: "Unauthenticated" });

  let auth;
  try {
    auth = jwt.verify(token, JWT_SECRET);
  } catch (e) {
    if (isDev) console.error("JWT verify error:", e);
    return res.status(401).json({ message: "Unauthenticated" });
  }

  const { tour_id, guests } = req.body || {};
  if (!tour_id || !Array.isArray(guests)) {
    return res
      .status(400)
      .json({ message: "tour_id и guests обязательны (guests — массив)" });
  }

  const client = await pool.connect();
  try {
    const tourRes = await client.query(
      `SELECT company_id FROM tours WHERE id = $1 LIMIT 1`,
      [tour_id]
    );
    if (tourRes.rowCount === 0) {
      return res.status(404).json({ message: "Тур не найден" });
    }
    const { company_id } = tourRes.rows[0];

    const perm = await client.query(
      `
      SELECT 1
      FROM user_company_roles
      WHERE user_id = $1
        AND company_id = $2
        AND role IN ('owner','admin')
      LIMIT 1
    `,
      [auth.sub, company_id]
    );

    if (perm.rowCount === 0) {
      return res
        .status(403)
        .json({ message: "Нет прав редактировать туристов этого тура" });
    }

    await client.query("BEGIN");

    // Чтобы один тур мог содержать туристов от разных админов:
    // - если у главного гостя уже есть admin_id, не перезаписываем его
    // - если admin_id ещё NULL (старые данные), проставляем текущего пользователя
    // - сохраняем стабильные id для существующих главных гостей (чтобы повторное сохранение
    //   в рамках одной формы не "перепривязывало" данные к другому админу)
    const existingAdminsRes = await client.query(
      `
      SELECT id, admin_id
      FROM tour_guests
      WHERE tour_id = $1 AND is_primary = true
    `,
      [tour_id]
    );
    const existingAdminByPrimaryId = new Map(
      (existingAdminsRes.rows || []).map((row) => [String(row.id), row.admin_id])
    );

    await client.query(`DELETE FROM tour_guests WHERE tour_id = $1`, [tour_id]);

    // guests приходит как массив: { temp_id, base_temp_id, is_extra, full_name, phone, cost_cents, prepayment_cents, is_paid }
    const mains = guests.filter((g) => !g?.is_extra);
    const extras = guests.filter((g) => g?.is_extra);

    const idMap = new Map(); // temp_id -> inserted id

    for (const g of mains) {
      if (!g || !g.full_name) continue;
      const cost = normalizeMoney(g.cost_cents);
      const prepay = normalizeMoney(g.prepayment_cents);
      const isPaid = !!g.is_paid;
      const incomingPrimaryKey = String(g.temp_id || g.id || "");
      const existingAdminId = incomingPrimaryKey
        ? existingAdminByPrimaryId.get(incomingPrimaryKey)
        : undefined;
      const adminIdToSave = existingAdminId ?? auth.sub;
      const idToPreserve =
        incomingPrimaryKey && existingAdminByPrimaryId.has(incomingPrimaryKey)
          ? incomingPrimaryKey
          : null;

      const mainRes = await client.query(
        `
        INSERT INTO tour_guests (
          id, tour_id, primary_id, is_primary, group_label, full_name, phone,
          cost_cents, prepayment_cents, is_paid, paid_at, admin_id
        )
        VALUES (COALESCE($1, gen_random_uuid()), $2, NULL, true, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id
      `,
        [
          idToPreserve,
          tour_id,
          g.group_label || null,
          g.full_name,
          g.phone || null,
          cost,
          prepay,
          isPaid,
          isPaid ? new Date() : null,
          adminIdToSave,
        ]
      );

      const primaryId = mainRes.rows[0].id;
      idMap.set(g.temp_id || g.id || primaryId, primaryId);
    }

    for (const ex of extras) {
      const baseTempId = ex.base_temp_id || ex.base_id || ex.primary_id;
      const primaryId = idMap.get(baseTempId);
      if (!primaryId) continue;

      const cost = normalizeMoney(ex.cost_cents);
      const prepay = normalizeMoney(ex.prepayment_cents);
      const isPaid = !!ex.is_paid;

      await client.query(
        `
        INSERT INTO tour_guests (
          tour_id, primary_id, is_primary, group_label, full_name, phone,
          cost_cents, prepayment_cents, is_paid, paid_at
        )
        VALUES ($1, $2, false, $3, $4, $5, $6, $7, $8, $9)
      `,
        [
          tour_id,
          primaryId,
          ex.group_label || null,
          ex.full_name || "",
          ex.phone || null,
          cost,
          prepay,
          isPaid,
          isPaid ? new Date() : null,
        ]
      );
    }

    await client.query("COMMIT");

    // Публикуем событие для real-time обновления у других клиентов
    eventHub.publishToTour(tour_id, EVENT_TYPES.GUESTS_UPDATED, {
      tour_id,
      guests_count: mains.length + extras.length,
      action: 'bulk_save',
    }, auth.sub); // исключаем автора изменений

    // Проверяем риски после изменения туристов (финансовые, неполные данные и т.д.)
    try {
      const { checkTourRisks } = await import("../../../../../lib/riskEngine");
      await checkTourRisks(tour_id);
    } catch (riskErr) {
      console.error("Risk check after guests save failed:", riskErr);
      // Не блокируем ответ - риски проверятся позже
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    await client.query("ROLLBACK");
    if (isDev) console.error("tour guests save error:", e);
    return res.status(500).json({
      message: "DB error",
      code: e.code || null,
      detail: e.detail || null,
      table: e.table || null,
      column: e.column || null,
    });
  } finally {
    client.release();
  }
}
