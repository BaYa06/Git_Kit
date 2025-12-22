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

  const {
    template_id,
    company_id,
    name,
    status,
    start_date,
    end_date,
    components,
    timing,
  } = req.body || {};

  if (!template_id || !company_id || !name) {
    return res
      .status(400)
      .json({ message: "template_id, company_id и name обязательны" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // права
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
        .json({ message: "Нет прав редактировать шаблон в этой компании" });
    }

    // обновляем заголовок
    await client.query(
      `
      UPDATE tour_templates
      SET name = $1,
          status = $2,
          start_date = $3,
          end_date = $4,
          timing = $5,
          updated_at = now()
      WHERE id = $6 AND company_id = $7
    `,
      [
        name.trim(),
        status || "active",
        start_date || null,
        end_date || null,
        JSON.stringify(timing || []),
        template_id,
        company_id,
      ]
    );

    // перезаписываем компоненты
    await client.query(
      `DELETE FROM tour_template_components WHERE template_id = $1`,
      [template_id]
    );

    if (Array.isArray(components) && components.length > 0) {
      for (let i = 0; i < components.length; i++) {
        const c = components[i];
        await client.query(
          `
          INSERT INTO tour_template_components (template_id, type, comment, position)
          VALUES ($1, $2, $3, $4)
        `,
          [
            template_id,
            c.type || "other",
            c.comment || "",
            c.position || i + 1,
          ]
        );
      }
    }

    await client.query("COMMIT");
    return res.status(200).json({ ok: true });
  } catch (e) {
    await client.query("ROLLBACK");
    if (isDev) console.error("update template error:", e);
    return res.status(500).json({ message: "DB error" });
  } finally {
    client.release();
  }
}
