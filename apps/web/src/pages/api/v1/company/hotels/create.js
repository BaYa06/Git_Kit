// pages/api/v1/company/hotels/create.js
import { Pool } from "pg";
import jwt from "jsonwebtoken";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

function tokenFromCookie(req) {
  const cookie = req.headers.cookie || "";
  const p = cookie.split("; ").find((c) => c.startsWith("gidkit_token="));
  return p ? decodeURIComponent(p.split("=")[1]) : null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const token = tokenFromCookie(req);
  if (!token) return res.status(401).json({ message: "Unauthenticated" });

  let auth;
  try {
    auth = jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return res.status(401).json({ message: "Unauthenticated" });
  }

  const {
    company_id,
    name,
    stars,
    phone,
    meal_plan,
    address,
    checkin_from,
    checkout_until,
  } = req.body || {};

  if (!company_id || !name) {
    return res
      .status(400)
      .json({ message: "company_id и name обязательны" });
  }

  const client = await pool.connect();
  try {
    // проверяем, что юзер — owner/admin этой компании
    const perm = await client.query(
      `
      SELECT 1
      FROM user_company_roles
      WHERE user_id = $1
        AND company_id = $2
        AND role IN ('owner','admin')
    `,
      [auth.sub, company_id]
    );

    if (perm.rowCount === 0) {
      return res
        .status(403)
        .json({ message: "Нет прав добавлять отели в эту компанию" });
    }

    const s = parseInt(stars, 10);
    const safeStars =
      Number.isFinite(s) && s > 0 ? Math.min(Math.max(s, 1), 5) : 3;

    const ci = checkin_from || "14:00";
    const co = checkout_until || "12:00";

    const result = await client.query(
      `
      INSERT INTO hotels (
        company_id,
        name,
        stars,
        phone,
        meal_plan,
        address,
        checkin_from,
        checkout_until
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7::time, $8::time)
      RETURNING
        id,
        company_id,
        name,
        stars,
        phone,
        meal_plan,
        address,
        checkin_from,
        checkout_until
    `,
      [company_id, name, safeStars, phone || null, meal_plan || null, address || null, ci, co]
    );

    const hotel = result.rows[0];
    return res.status(201).json({ hotel });
  } catch (e) {
    console.error("create hotel error:", e);
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
