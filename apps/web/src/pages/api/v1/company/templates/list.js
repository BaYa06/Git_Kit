// apps/web/src/pages/api/v1/company/templates/list.js
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

  const { company_id } = req.query;
  if (!company_id) {
    return res.status(400).json({ message: "company_id обязателен" });
  }

  const client = await pool.connect();
  try {
    // проверяем права: owner/admin в этой компании
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
        .json({ message: "Нет прав смотреть шаблоны этой компании" });
    }

    // сами шаблоны
    const tmplRes = await client.query(
      `
      SELECT id, company_id, name, status, start_date, end_date, created_at
      FROM tour_templates
      WHERE company_id = $1
      ORDER BY created_at DESC
    `,
      [company_id]
    );

    const templates = tmplRes.rows;

    // считаем количество компонентов на каждый шаблон
    let segmentsByTemplate = {};
    if (templates.length > 0) {
      const ids = templates.map((t) => t.id);
      const compRes = await client.query(
        `
        SELECT template_id, COUNT(*)::int AS count
        FROM tour_template_components
        WHERE template_id = ANY($1::uuid[])
        GROUP BY template_id
      `,
        [ids]
      );
      for (const row of compRes.rows) {
        segmentsByTemplate[row.template_id] = row.count;
      }
    }

    // считаем дни/ночи
    const result = templates.map((t) => {
      let days = 0;
      let nights = 0;

      if (t.start_date && t.end_date) {
        const start = new Date(t.start_date);
        const end = new Date(t.end_date);
        const diffMs = end.getTime() - start.getTime();
        if (!Number.isNaN(diffMs) && diffMs >= 0) {
          const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
          days = diffDays + 1;
          nights = diffDays;
        }
      }

      const segments = segmentsByTemplate[t.id] || 0; // если нет данных — 0

      return {
        id: t.id,
        company_id: t.company_id,
        name: t.name,
        status: t.status,
        start_date: t.start_date,
        end_date: t.end_date,
        days,
        nights,
        segments,
      };
    });

    return res.status(200).json({ templates: result });
  } catch (e) {
    if (isDev) console.error("templates list error:", e);
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
