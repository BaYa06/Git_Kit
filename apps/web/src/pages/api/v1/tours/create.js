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

  const {
    company_id,
    template_id,
    name,
    start_date,
    end_date,
    tourists_count,
    components,
  } = req.body || {};

  if (!company_id || !name) {
    return res.status(400).json({ message: "company_id и name обязательны" });
  }

  const client = await pool.connect();

  try {
    // проверка прав: только owner/admin могут создавать туры
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
        .json({ message: "Нет прав создавать туры в этой компании" });
    }

    // создаём тур
    const tourRes = await client.query(
      `
      INSERT INTO tours (company_id, template_id, name, status, start_date, end_date, tourists_count, coordinator_id, main_guide_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, company_id, template_id, name, status, start_date, end_date, tourists_count, created_at
    `,
      [
        company_id,
        template_id || null,
        name.trim(),
        "planned",
        start_date || null,
        end_date || null,
        Number.isFinite(parseInt(tourists_count, 10))
          ? parseInt(tourists_count, 10)
          : null,
        auth.sub,
        null,
      ]
    );

    const tour = tourRes.rows[0];

    // сохраняем компоненты (транспорт/отели/гиды)
    if (Array.isArray(components) && components.length > 0) {
      for (let i = 0; i < components.length; i++) {
        const c = components[i];
        if (!c || !c.type) continue;

        let mode = c.mode === "custom" ? "custom" : "base";
        let guideId =
          c.type === "guide" && c.selectedId ? c.selectedId : null;
        const hotelId =
          c.type === "hotel" && c.selectedId ? c.selectedId : null;
        const driverId =
          c.type === "transport" && c.selectedId ? c.selectedId : null;
        let custom = mode === "custom" ? c.custom || {} : null;

        // 🔹 проверяем, что выбранный гид реально в таблице guides этой компании
        if (c.type === "guide" && guideId) {
          const gRes = await client.query(
            `SELECT 1 FROM guides WHERE id = $1 AND company_id = $2 LIMIT 1`,
            [guideId, company_id]
          );
          if (gRes.rowCount === 0) {
            return res
              .status(400)
              .json({ message: "Гид не найден в базе компании", detail: `guide_id=${guideId}` });
          }
        }

        await client.query(
          `
          INSERT INTO tour_components (tour_id, type, mode, comment, guide_id, hotel_id, driver_id, custom)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `,
          [
            tour.id,
            c.type,
            mode,
            c.comment || "",
            guideId,
            hotelId,
            driverId,
            custom ? JSON.stringify(custom) : null,
          ]
        );
      }
    }

    return res.status(201).json({
      tour: {
        ...tour,
        start_date: formatDate(tour.start_date),
        end_date: formatDate(tour.end_date),
      },
    });
  } catch (e) {
    if (isDev) console.error("create tour error:", e);

    // если не хватает таблицы/колонки после обновления схемы — отдаём понятное сообщение
    if (e.code === "42P01") {
      return res.status(500).json({
        message:
          "Нужно обновить схему БД (нет таблицы или представления). Примените database/schema.sql.",
        code: e.code,
        detail: e.detail || null,
        table: e.table || null,
      });
    }

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
