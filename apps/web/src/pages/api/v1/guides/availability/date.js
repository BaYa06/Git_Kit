import { Pool } from "pg";
import jwt from "jsonwebtoken";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const isDev = process.env.NODE_ENV !== "production";

function tokenFromCookie(req) {
  const cookie = req.headers.cookie || "";
  const pair = cookie.split("; ").find((c) => c.startsWith("gidkit_token="));
  return pair ? decodeURIComponent(pair.split("=")[1]) : null;
}

function normalizeDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const token = tokenFromCookie(req);
  if (!token) return res.status(401).json({ message: "Unauthenticated" });

  let auth;
  try {
    auth = jwt.verify(token, JWT_SECRET);
  } catch (e) {
    if (isDev) console.error("availability by date jwt error:", e);
    return res.status(401).json({ message: "Unauthenticated" });
  }

  const { company_id, date } = req.query || {};
  if (!company_id || !date) {
    return res.status(400).json({ message: "company_id и date обязательны" });
  }

  const normalizedDate = normalizeDate(date);
  if (!normalizedDate) {
    return res.status(400).json({ message: "Некорректная дата" });
  }

  const client = await pool.connect();
  try {
    const perm = await client.query(
      `
        SELECT role FROM user_company_roles
        WHERE user_id = $1 AND company_id = $2 AND role IN ('owner','admin','manager','coordinator','guide')
        LIMIT 1
      `,
      [auth.sub, company_id]
    );
    if (perm.rowCount === 0) {
      return res.status(403).json({ message: "Нет доступа" });
    }

    const rows = await client.query(
      `
        SELECT guide_id, status
        FROM guide_availability
        WHERE company_id = $1
          AND date = $2::date
      `,
      [company_id, normalizedDate]
    );

    const statuses = {};
    rows.rows.forEach((r) => {
      if (!r.guide_id || !r.status) return;
      statuses[r.guide_id] = r.status;
    });

    return res.status(200).json({ statuses, date: normalizedDate });
  } catch (e) {
    if (isDev) console.error("availability by date error:", e);
    return res.status(500).json({ message: "DB error" });
  } finally {
    client.release();
  }
}
