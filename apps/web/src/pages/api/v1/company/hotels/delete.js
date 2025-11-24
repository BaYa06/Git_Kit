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

  const { id, company_id } = req.body || {};
  if (!id || !company_id) {
    return res
      .status(400)
      .json({ message: "id и company_id обязательны" });
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
        .json({ message: "Нет прав удалять отели этой компании" });
    }

    const result = await client.query(
      `DELETE FROM hotels WHERE id = $1 AND company_id = $2`,
      [id, company_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Отель не найден" });
    }

    return res.status(200).json({ success: true, id });
  } catch (e) {
    console.error("delete hotel error:", e);
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
