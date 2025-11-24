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

  const { company_id, user_id } = req.body || {};

  if (!company_id || !user_id) {
    return res
      .status(400)
      .json({ message: "company_id и user_id обязательны" });
  }

  const client = await pool.connect();
  try {
    // проверяем, что текущий пользователь — owner/admin этой компании
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
        .json({ message: "Нет прав удалять гидов этой компании" });
    }

    const result = await client.query(
      `
      DELETE FROM user_company_roles
      WHERE user_id = $1
        AND company_id = $2
        AND role = 'guide'
    `,
      [user_id, company_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Гид не найден" });
    }

    return res.status(200).json({ success: true, user_id });
  } catch (e) {
    console.error("delete guide error:", e);
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
