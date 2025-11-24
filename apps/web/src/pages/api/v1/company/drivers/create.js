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

  const { company_id, full_name, phone, car_name, plate_number, seats, notes } =
    req.body || {};

  if (!company_id || !full_name || !phone || !car_name || !plate_number || !seats) {
    return res.status(400).json({
      message: "company_id, full_name, phone, car_name, plate_number, seats обязательны",
    });
  }

  const client = await pool.connect();
  try {
    // проверяем права (owner/admin)
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
        .json({ message: "Нет прав добавлять транспорт в эту компанию" });
    }

    const s = parseInt(seats, 10);
    const safeSeats = Number.isFinite(s) && s > 0 ? s : 1;

    const result = await client.query(
      `
      INSERT INTO drivers (
        company_id,
        full_name,
        phone,
        car_name,
        plate_number,
        seats,
        notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
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
      [company_id, full_name, phone, car_name, plate_number, safeSeats, notes || null]
    );

    const driver = result.rows[0];
    return res.status(201).json({ driver });
  } catch (e) {
    console.error("create driver error:", e);
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
