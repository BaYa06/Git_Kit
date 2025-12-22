// apps/web/src/pages/api/v1/company/templates/[id].js
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

  const { id } = req.query;
  if (!id) return res.status(400).json({ message: "id обязателен" });

  const client = await pool.connect();
  try {
    // берём шаблон
    const tmplRes = await client.query(
      `
      SELECT id, company_id, name, status, start_date, end_date, timing
      FROM tour_templates
      WHERE id = $1
    `,
      [id]
    );

    if (tmplRes.rowCount === 0) {
      return res.status(404).json({ message: "Шаблон не найден" });
    }

    const t = tmplRes.rows[0];

    // проверяем права: юзер привязан к этой компании
    const perm = await client.query(
      `
      SELECT 1
      FROM user_company_roles
      WHERE user_id = $1
        AND company_id = $2
      LIMIT 1
    `,
      [auth.sub, t.company_id]
    );

    if (perm.rowCount === 0) {
      return res
        .status(403)
        .json({ message: "Нет доступа к этому шаблону" });
    }

    // компоненты
    const compRes = await client.query(
      `
      SELECT id, type, comment, position
      FROM tour_template_components
      WHERE template_id = $1
      ORDER BY position ASC
    `,
      [id]
    );

    const template = {
      id: t.id,
      company_id: t.company_id,
      name: t.name,
      status: t.status,
      start_date: t.start_date,
      end_date: t.end_date,
      timing: t.timing || [],
      components: compRes.rows,
    };

    return res.status(200).json({ template });
  } catch (e) {
    if (isDev) console.error("get template error:", e);
    return res.status(500).json({ message: "DB error" });
  } finally {
    client.release();
  }
}
