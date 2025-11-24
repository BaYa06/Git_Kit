import { Pool } from "pg";
import jwt from "jsonwebtoken";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

function tokenFromCookie(req) {
  const cookie = req.headers.cookie || "";
  const part = cookie.split("; ").find((c) => c.startsWith("gidkit_token="));
  return part ? decodeURIComponent(part.split("=")[1]) : null;
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
    id,
    company_id,
    full_name,
    phone,
    car_name,
    plate_number,
    seats,
    notes,
  } = req.body || {};

  if (!id || !company_id || !full_name || !phone || !car_name || !plate_number || !seats) {
    return res.status(400).json({
      message: "id, company_id, full_name, phone, car_name, plate_number, seats обязательны",
    });
  }

  const client = await pool.connect();
  try {
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
        .json({ message: "Нет прав редактировать транспорт этой компании" });
    }

    const s = parseInt(seats, 10);
    const safeSeats = Number.isFinite(s) && s > 0 ? s : 1;

    const result = await client.query(
      `
      UPDATE drivers
      SET
        full_name   = $3,
        phone       = $4,
        car_name    = $5,
        plate_number= $6,
        seats       = $7,
        notes       = $8,
        updated_at  = now()
      WHERE id = $1
        AND company_id = $2
      RETURNING
        id,
        company_id,
        full_name,
        phone,
        car_name,
        plate_number,
        seats,
        is_active,
        notes,
        created_at,
        updated_at
    `,
      [id, company_id, full_name, phone, car_name, plate_number, safeSeats, notes || null]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Транспорт не найден" });
    }

    const driver = result.rows[0];
    return res.status(200).json({ driver });
  } catch (e) {
    console.error("update driver error:", e);
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
