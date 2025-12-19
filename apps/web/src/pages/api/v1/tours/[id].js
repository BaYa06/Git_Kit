import { Pool } from "pg";
import jwt from "jsonwebtoken";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const isDev = process.env.NODE_ENV !== "production";

const formatDate = (value) => {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

function tokenFromCookie(req) {
  const cookie = req.headers.cookie || "";
  const pair = cookie.split("; ").find((c) => c.startsWith("gidkit_token="));
  return pair ? decodeURIComponent(pair.split("=")[1]) : null;
}

export default async function handler(req, res) {
  const token = tokenFromCookie(req);
  if (!token) return res.status(401).json({ message: "Unauthenticated" });

  let auth;
  try {
    auth = jwt.verify(token, JWT_SECRET);
  } catch (e) {
    if (isDev) console.error("JWT verify error:", e);
    return res.status(401).json({ message: "Unauthenticated" });
  }

  const tourId = req.query.id;
  if (!tourId) return res.status(400).json({ message: "id обязателен" });

  if (req.method === "GET") {
    return handleGet(req, res, auth, tourId);
  } else if (req.method === "PUT") {
    return handlePut(req, res, auth, tourId);
  } else if (req.method === "DELETE") {
    return handleDelete(req, res, auth, tourId);
  } else {
    return res.status(405).end();
  }
}

async function handleGet(req, res, auth, tourId) {
  const client = await pool.connect();

  try {
    const tourRes = await client.query(
      `
      SELECT
        t.id,
        t.company_id,
        t.template_id,
        t.name,
        t.status,
        t.start_date,
        t.end_date,
        t.tourists_count,
        COALESCE(tg.total_guests, 0) AS tourists_signed,
        t.coordinator_id,
        t.main_guide_id,
        t.created_at
      FROM tours t
      LEFT JOIN LATERAL (
        SELECT COUNT(*) AS total_guests
        FROM tour_guests tg
        WHERE tg.tour_id = t.id
      ) tg ON TRUE
      WHERE t.id = $1
      LIMIT 1
    `,
      [tourId]
    );

    if (tourRes.rowCount === 0) {
      return res.status(404).json({ message: "Тур не найден" });
    }

    const tourRow = tourRes.rows[0];

    // проверяем, что юзер связан с компанией этого тура
    const perm = await client.query(
      `
      SELECT role
      FROM user_company_roles
      WHERE user_id = $1 AND company_id = $2
      LIMIT 1
    `,
      [auth.sub, tourRow.company_id]
    );

    if (perm.rowCount === 0) {
      return res.status(403).json({ message: "Нет доступа к этому туру" });
    }

    const componentsRes = await client.query(
      `
      SELECT id, type, mode, comment, guide_id, hotel_id, driver_id, custom
      FROM tour_components
      WHERE tour_id = $1
      ORDER BY created_at ASC, id ASC
    `,
      [tourId]
    );

    const tour = {
      ...tourRow,
      start_date: formatDate(tourRow.start_date),
      end_date: formatDate(tourRow.end_date),
      components: (componentsRes.rows || []).map((c) => ({
        id: c.id,
        type: c.type,
        mode: c.mode,
        comment: c.comment || "",
        selectedId:
          c.type === "guide"
            ? c.guide_id || ""
            : c.type === "hotel"
            ? c.hotel_id || ""
            : c.driver_id || "",
        custom: c.custom || {},
      })),
      tourists_signed: Number(tourRow.tourists_signed) || 0,
    };

    return res.status(200).json({ tour });
  } catch (e) {
    if (isDev) console.error("get tour error:", e);
    return res.status(500).json({ message: "DB error" });
  } finally {
    client.release();
  }
}

async function handleDelete(req, res, auth, tourId) {
  const client = await pool.connect();

  try {
    // Получаем информацию о туре
    const tourRes = await client.query(
      `SELECT company_id FROM tours WHERE id = $1 LIMIT 1`,
      [tourId]
    );

    if (tourRes.rowCount === 0) {
      return res.status(404).json({ message: "Тур не найден" });
    }

    const tourRow = tourRes.rows[0];

    // Проверяем права доступа
    const perm = await client.query(
      `SELECT role FROM user_company_roles WHERE user_id = $1 AND company_id = $2 LIMIT 1`,
      [auth.sub, tourRow.company_id]
    );

    if (perm.rowCount === 0) {
      return res.status(403).json({ message: "Нет доступа к этому туру" });
    }

    // Проверяем, что пользователь - админ или владелец
    const userRole = perm.rows[0].role;
    if (userRole !== 'admin' && userRole !== 'owner') {
      return res.status(403).json({ message: "Недостаточно прав для удаления тура" });
    }

    // Удаляем тур (каскадное удаление настроено в БД для связанных записей)
    await client.query(`DELETE FROM tours WHERE id = $1`, [tourId]);

    return res.status(200).json({ message: "Тур успешно удалён" });
  } catch (e) {
    if (isDev) console.error("delete tour error:", e);
    return res.status(500).json({ message: "DB error" });
  } finally {
    client.release();
  }
}
