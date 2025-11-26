// apps/web/src/pages/api/v1/company/templates/create.js
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
  if (!token) {
    return res.status(401).json({ message: "Unauthenticated" });
  }

  let auth;
  try {
    auth = jwt.verify(token, JWT_SECRET);
  } catch (e) {
    if (isDev) console.error("JWT verify error:", e);
    return res.status(401).json({ message: "Unauthenticated" });
  }

  const {
    company_id,
    name,
    status,
    start_date,
    end_date,
    components,
  } = req.body || {};

  if (!company_id || !name) {
    return res
      .status(400)
      .json({ message: "company_id и name обязательны" });
  }

  const client = await pool.connect();

  try {
    // 1) проверка, что юзер owner/admin в этой компании
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
      return res
        .status(403)
        .json({ message: "Нет прав создавать шаблоны в этой компании" });
    }

    // 2) создаём запись в tour_templates — ПОД ТВОЮ СХЕМУ
    const tmplRes = await client.query(
      `
      INSERT INTO tour_templates (company_id, name, status, start_date, end_date, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, company_id, name, status, start_date, end_date
    `,
      [
        company_id,
        name.trim(),
        status || "active",
        start_date || null,
        end_date || null,
        auth.sub,
      ]
    );

    const template = tmplRes.rows[0];

    // 3) сохраняем компоненты в tour_template_components
    if (Array.isArray(components) && components.length > 0) {
      for (let i = 0; i < components.length; i++) {
        const c = components[i];
        if (!c) continue;

        await client.query(
          `
          INSERT INTO tour_template_components (template_id, type, comment, position)
          VALUES ($1, $2, $3, $4)
        `,
          [
            template.id,
            c.type || "other",          // 'transport' / 'hotel' / 'guide'
            c.comment || "",
            c.position || i + 1,
          ]
        );
      }
    }

    return res.status(201).json({ template });
  } catch (e) {
    if (isDev) console.error("create template error:", e);
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
