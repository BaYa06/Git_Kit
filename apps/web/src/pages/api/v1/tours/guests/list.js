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

  const { tour_id } = req.query || {};
  if (!tour_id) {
    return res.status(400).json({ message: "tour_id обязателен" });
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
      WHERE user_id = $1 AND company_id = $2
      LIMIT 1
    `,
      [auth.sub, company_id]
    );

    if (perm.rowCount === 0) {
      return res.status(403).json({ message: "Нет доступа к этому туру" });
    }

    const guestsRes = await client.query(
      `
      SELECT
        id,
        primary_id,
        is_primary,
        group_label,
        full_name,
        phone,
        cost_cents,
        prepayment_cents,
        is_paid,
        paid_at
      FROM tour_guests
      WHERE tour_id = $1
      ORDER BY is_primary DESC, created_at ASC
    `,
      [tour_id]
    );

    const guests = (guestsRes.rows || []).map((row) => ({
      id: row.id,
      primary_id: row.primary_id,
      is_primary: row.is_primary,
      group_label: row.group_label || null,
      full_name: row.full_name || "",
      phone: row.phone || "",
      cost_cents: Number.isFinite(row.cost_cents) ? row.cost_cents : 0,
      prepayment_cents: Number.isFinite(row.prepayment_cents)
        ? row.prepayment_cents
        : 0,
      is_paid: !!row.is_paid,
      paid_at: row.paid_at || null,
    }));

    return res.status(200).json({ guests });
  } catch (e) {
    if (isDev) console.error("tour guests list error:", e);
    return res.status(500).json({ message: "DB error" });
  } finally {
    client.release();
  }
}
