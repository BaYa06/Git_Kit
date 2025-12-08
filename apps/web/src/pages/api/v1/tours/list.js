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

  const { company_id } = req.query || {};
  if (!company_id) {
    return res.status(400).json({ message: "company_id обязателен" });
  }

  const client = await pool.connect();
  try {
    // проверяем, что юзер связан с компанией
    const perm = await client.query(
      `
      SELECT role
      FROM user_company_roles
      WHERE user_id = $1 AND company_id = $2
      LIMIT 1
    `,
      [auth.sub, company_id]
    );

    if (perm.rowCount === 0) {
      return res.status(403).json({ message: "Нет доступа к этой компании" });
    }

    const toursRes = await client.query(
      `
      SELECT
        t.id,
        t.name,
        t.status,
        t.start_date,
        t.end_date,
        t.tourists_count,
        COALESCE(tg.total_guests, 0) AS tourists_signed,
        t.created_at,
        g.full_name AS main_guide_name,
        gc.guide_names,
        COALESCE(tc_meta.total_components, 0) AS total_components,
        COALESCE(tc_meta.filled_components, 0) AS filled_components,
        CASE
          WHEN COALESCE(tc_meta.total_components, 0) = 0 THEN 'planned'
          WHEN COALESCE(tc_meta.filled_components, 0) = COALESCE(tc_meta.total_components, 0)
            THEN 'confirmed'
          ELSE 'planned'
        END AS computed_status
      FROM tours t
      LEFT JOIN guides g ON g.id = t.main_guide_id
      LEFT JOIN LATERAL (
        SELECT array_agg(g2.full_name ORDER BY g2.full_name) AS guide_names
        FROM tour_components tc
        JOIN guides g2 ON g2.id = tc.guide_id
        WHERE tc.tour_id = t.id
          AND tc.type = 'guide'
          AND tc.guide_id IS NOT NULL
      ) gc ON TRUE
      LEFT JOIN LATERAL (
        SELECT COUNT(*) AS total_guests
        FROM tour_guests tg
        WHERE tg.tour_id = t.id
      ) tg ON TRUE
      LEFT JOIN LATERAL (
        SELECT
          COUNT(*) AS total_components,
          COUNT(*) FILTER (
            WHERE tc.guide_id IS NOT NULL
               OR tc.hotel_id IS NOT NULL
               OR tc.driver_id IS NOT NULL
               OR tc.custom IS NOT NULL
          ) AS filled_components
        FROM tour_components tc
        WHERE tc.tour_id = t.id
      ) tc_meta ON TRUE
      WHERE t.company_id = $1
      ORDER BY t.start_date DESC NULLS LAST, t.created_at DESC
    `,
      [company_id]
    );

    const tours =
      (toursRes.rows || []).map((row) => ({
        ...row,
        start_date: formatDate(row.start_date),
        end_date: formatDate(row.end_date),
        tourists_count: row.tourists_count,
        tourists_signed: Number(row.tourists_signed) || 0,
        guide_names: Array.isArray(row.guide_names) ? row.guide_names : [],
        status:
          row.computed_status ||
          (row.status === "confirmed" || row.status === "active"
            ? "confirmed"
            : "planned"),
      })) || [];

    return res.status(200).json({ tours });
  } catch (e) {
    if (isDev) console.error("list tours error:", e);
    return res.status(500).json({ message: "DB error" });
  } finally {
    client.release();
  }
}
