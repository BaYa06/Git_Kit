// apps/web/src/pages/api/v1/company/templates/copy.js
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
        .json({ message: "Нет прав копировать шаблоны в этой компании" });
    }

    // оригинал
    const srcRes = await client.query(
      `
      SELECT id, company_id, name, status, start_date, end_date
      FROM tour_templates
      WHERE id = $1 AND company_id = $2
    `,
      [template_id, company_id]
    );

    if (srcRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Шаблон не найден" });
    }

    const src = srcRes.rows[0];

    const copyName =
      src.name.length > 80 ? src.name.slice(0, 80) + " (копия)" : src.name + " (копия)";

    // создаём копию
    const newRes = await client.query(
      `
      INSERT INTO tour_templates (company_id, name, status, start_date, end_date, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, company_id, name, status, start_date, end_date, created_at
    `,
      [
        src.company_id,
        copyName,
        src.status,
        src.start_date,
        src.end_date,
        auth.sub,
      ]
    );

    const copy = newRes.rows[0];

    // копируем компоненты
    const compRes = await client.query(
      `
      SELECT type, comment, position
      FROM tour_template_components
      WHERE template_id = $1
      ORDER BY position ASC
    `,
      [template_id]
    );

    for (const c of compRes.rows) {
      await client.query(
        `
        INSERT INTO tour_template_components (template_id, type, comment, position)
        VALUES ($1, $2, $3, $4)
      `,
        [copy.id, c.type, c.comment, c.position]
      );
    }

    await client.query("COMMIT");

    // посчитаем дни/ночи/сегменты для карточки
    let days = 0;
    let nights = 0;
    if (copy.start_date && copy.end_date) {
      const s = new Date(copy.start_date);
      const e = new Date(copy.end_date);
      const diffMs = e.getTime() - s.getTime();
      if (!Number.isNaN(diffMs) && diffMs >= 0) {
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        days = diffDays + 1;
        nights = diffDays;
      }
    }

    const segments = compRes.rows.length || 0;

    return res.status(201).json({
      template: {
        id: copy.id,
        company_id: copy.company_id,
        name: copy.name,
        status: copy.status,
        start_date: copy.start_date,
        end_date: copy.end_date,
        days,
        nights,
        segments,
      },
    });
  } catch (e) {
    await client.query("ROLLBACK");
    if (isDev) console.error("copy template error:", e);
    return res.status(500).json({ message: "DB error" });
  } finally {
    client.release();
  }
}
