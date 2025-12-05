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
  if (req.method !== "GET") return res.status(405).end();

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

  const client = await pool.connect();

  try {
    const tourRes = await client.query(
      `
      SELECT
        id,
        company_id,
        template_id,
        name,
        status,
        start_date,
        end_date,
        tourists_count,
        coordinator_id,
        main_guide_id,
        created_at
      FROM tours
      WHERE id = $1
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
    };

    return res.status(200).json({ tour });
  } catch (e) {
    if (isDev) console.error("get tour error:", e);
    return res.status(500).json({ message: "DB error" });
  } finally {
    client.release();
  }
}
