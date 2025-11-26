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

  const { template_id, company_id } = req.body || {};
  if (!template_id || !company_id) {
    return res
      .status(400)
      .json({ message: "template_id и company_id обязательны" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // проверяем права
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
      await client.query("ROLLBACK");
      return res
        .status(403)
        .json({ message: "Нет прав удалять шаблоны в этой компании" });
    }

    // проверяем, что шаблон реально принадлежит этой компании
    const checkRes = await client.query(
      `
      SELECT id
      FROM tour_templates
      WHERE id = $1 AND company_id = $2
    `,
      [template_id, company_id]
    );

    if (checkRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Шаблон не найден" });
    }

    // удаляем — компоненты удалятся через ON DELETE CASCADE, если стоит,
    // если нет — всё равно можно сначала удалить компоненты руками
    await client.query(
      `DELETE FROM tour_templates WHERE id = $1 AND company_id = $2`,
      [template_id, company_id]
    );

    await client.query("COMMIT");
    return res.status(200).json({ ok: true });
  } catch (e) {
    await client.query("ROLLBACK");
    if (isDev) console.error("delete template error:", e);
    return res.status(500).json({ message: "DB error" });
  } finally {
    client.release();
  }
}
