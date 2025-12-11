import { Pool } from "pg";
import jwt from "jsonwebtoken";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const isDev = process.env.NODE_ENV !== "production";

const allowedStatuses = new Set(["free", "busy", "none"]);

function tokenFromCookie(req) {
  const cookie = req.headers.cookie || "";
  const pair = cookie.split("; ").find((c) => c.startsWith("gidkit_token="));
  return pair ? decodeURIComponent(pair.split("=")[1]) : null;
}

function normalizeDateString(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

async function findGuideForUser(client, userId, companyId) {
  const userRes = await client.query(
    `SELECT email, phone FROM users WHERE id = $1 LIMIT 1`,
    [userId]
  );
  const user = userRes.rows[0];
  if (!user) return null;

  const guideRes = await client.query(
    `
      SELECT id
      FROM guides
      WHERE company_id = $1
        AND (
          (email IS NOT NULL AND email = $2)
          OR (phone IS NOT NULL AND phone = $3)
        )
      LIMIT 1
    `,
    [companyId, user.email || null, user.phone || null]
  );

  return guideRes.rows[0]?.id || null;
}

export default async function handler(req, res) {
  const token = tokenFromCookie(req);
  if (!token) return res.status(401).json({ message: "Unauthenticated" });

  let auth;
  try {
    auth = jwt.verify(token, JWT_SECRET);
  } catch (e) {
    if (isDev) console.error("JWT verify error:", e);
    return res.status(401).json({ message: "Unauthenticated" });
  }

  const client = await pool.connect();
  try {
    if (req.method === "GET") {
      const { company_id, from, to } = req.query || {};
      if (!company_id || !from || !to) {
        return res
          .status(400)
          .json({ message: "company_id, from, to обязательны" });
      }

      const fromDate = normalizeDateString(from);
      const toDate = normalizeDateString(to);
      if (!fromDate || !toDate) {
        return res.status(400).json({ message: "Некорректные даты" });
      }

      const perm = await client.query(
        `
          SELECT role FROM user_company_roles
          WHERE user_id = $1 AND company_id = $2 AND role = 'guide'
          LIMIT 1
        `,
        [auth.sub, company_id]
      );
      if (perm.rowCount === 0) {
        return res.status(403).json({ message: "Нет доступа" });
      }

      const guideId = await findGuideForUser(client, auth.sub, company_id);
      if (!guideId) {
        return res.status(404).json({ message: "Гид не найден" });
      }

      const rows = await client.query(
        `
          SELECT date, status
          FROM guide_availability
          WHERE company_id = $1
            AND guide_id = $2
            AND date BETWEEN $3 AND $4
          ORDER BY date
        `,
        [company_id, guideId, fromDate, toDate]
      );

      return res.status(200).json({
        items: rows.rows.map((r) => ({
          date: r.date.toISOString().slice(0, 10),
          status: r.status,
        })),
      });
    }

    if (req.method === "PUT") {
      const { company_id, items } = req.body || {};
      if (!company_id || !Array.isArray(items)) {
        return res
          .status(400)
          .json({ message: "company_id и items обязательны" });
      }

      if (items.length > 200) {
        return res.status(400).json({ message: "Слишком много записей за раз" });
      }

      const perm = await client.query(
        `
          SELECT role FROM user_company_roles
          WHERE user_id = $1 AND company_id = $2 AND role = 'guide'
          LIMIT 1
        `,
        [auth.sub, company_id]
      );
      if (perm.rowCount === 0) {
        return res.status(403).json({ message: "Нет доступа" });
      }

      const guideId = await findGuideForUser(client, auth.sub, company_id);
      if (!guideId) {
        return res.status(404).json({ message: "Гид не найден" });
      }

      const normalized = [];
      for (const it of items) {
        if (!it || !it.date || !allowedStatuses.has(it.status)) continue;
        const d = normalizeDateString(it.date);
        if (!d) continue;
        normalized.push({ date: d, status: it.status });
      }

      if (normalized.length === 0) {
        return res.status(400).json({ message: "Нет валидных записей" });
      }

      await client.query("BEGIN");
      for (const it of normalized) {
        if (it.status === "none") {
          await client.query(
            `
              DELETE FROM guide_availability
              WHERE guide_id = $1 AND company_id = $2 AND date = $3
            `,
            [guideId, company_id, it.date]
          );
        } else {
          await client.query(
            `
              INSERT INTO guide_availability (guide_id, company_id, date, status)
              VALUES ($1, $2, $3, $4)
              ON CONFLICT (guide_id, company_id, date)
              DO UPDATE SET status = EXCLUDED.status, updated_at = now()
            `,
            [guideId, company_id, it.date, it.status]
          );
        }
      }
      await client.query("COMMIT");

      return res.status(200).json({ ok: true, updated: normalized.length });
    }

    return res.status(405).end();
  } catch (e) {
    await client.query("ROLLBACK").catch(() => {});
    if (isDev) console.error("guide availability error:", e);
    return res.status(500).json({ message: "DB error" });
  } finally {
    client.release();
  }
}
