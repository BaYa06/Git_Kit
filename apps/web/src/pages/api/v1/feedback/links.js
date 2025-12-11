import { Pool } from "pg";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const isDev = process.env.NODE_ENV !== "production";

function tokenFromCookie(req) {
  const cookie = req.headers.cookie || "";
  const pair = cookie.split("; ").find((c) => c.startsWith("gidkit_token="));
  return pair ? decodeURIComponent(pair.split("=")[1]) : null;
}

const baseOrigin = (req) => {
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers.host || "";
  return `${proto}://${host}`;
};

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
  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).end();
  }

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
      const { token: linkToken } = req.query || {};
      if (!linkToken) return res.status(400).json({ message: "token обязателен" });

      const linkRes = await client.query(
        `
          SELECT id, tour_id, company_id, guide_id, driver_id, hotel_id, token, is_active, expires_at
          FROM tour_feedback_links
          WHERE token = $1
          LIMIT 1
        `,
        [linkToken]
      );
      if (linkRes.rowCount === 0) {
        return res.status(404).json({ message: "Ссылка не найдена" });
      }
      const row = linkRes.rows[0];
      const expired = row.expires_at && new Date(row.expires_at) < new Date();
      if (!row.is_active || expired) {
        return res.status(410).json({ message: "Ссылка неактивна" });
      }
      const origin = baseOrigin(req);
      const url = `${origin}/feedback/${row.token}`;
      return res.status(200).json({ link: { ...row, url } });
    }

    const { tour_id } = req.body || {};
    if (!tour_id) {
      return res.status(400).json({ message: "tour_id обязателен" });
    }

    // Проверяем роль guide в компании тура
    const tourRes = await client.query(
      `SELECT company_id, main_guide_id FROM tours WHERE id = $1 LIMIT 1`,
      [tour_id]
    );
    const tourRow = tourRes.rows[0];
    if (!tourRow) {
      return res.status(404).json({ message: "Тур не найден" });
    }
    const companyId = tourRow.company_id;

    const roleRes = await client.query(
      `
        SELECT role FROM user_company_roles
        WHERE user_id = $1 AND company_id = $2 AND role = 'guide'
        LIMIT 1
      `,
      [auth.sub, companyId]
    );
    if (roleRes.rowCount === 0) {
      return res.status(403).json({ message: "Нет доступа" });
    }

    const guideId = await findGuideForUser(client, auth.sub, companyId);
    if (!guideId) {
      return res.status(403).json({ message: "Вы не назначены гидом" });
    }

    // Проверяем, что гид привязан к туру
    const bindRes = await client.query(
      `
        SELECT 1
        FROM tours t
        LEFT JOIN tour_components tc
          ON tc.tour_id = t.id AND tc.type = 'guide' AND tc.guide_id IS NOT NULL
        WHERE t.id = $1 AND (
          t.main_guide_id = $2 OR tc.guide_id = $2
        )
        LIMIT 1
      `,
      [tour_id, guideId]
    );
    if (bindRes.rowCount === 0) {
      return res.status(403).json({ message: "Вы не привязаны к этому туру" });
    }

    // Ищем активную ссылку
    const existing = await client.query(
      `
        SELECT id, token
        FROM tour_feedback_links
        WHERE tour_id = $1 AND is_active = true
        ORDER BY created_at DESC
        LIMIT 1
      `,
      [tour_id]
    );

    let linkToken = existing.rows[0]?.token || null;

    if (!linkToken) {
      linkToken = randomUUID();
      await client.query(
        `
          INSERT INTO tour_feedback_links (tour_id, company_id, guide_id, token, is_active, created_at)
          VALUES ($1, $2, $3, $4, true, now())
        `,
        [tour_id, companyId, guideId, linkToken]
      );
    }

    const origin = baseOrigin(req);
    const url = `${origin}/feedback/${linkToken}`;
    return res.status(200).json({ token: linkToken, url });
  } catch (e) {
    if (isDev) console.error("feedback link error:", e);
    return res.status(500).json({ message: "DB error" });
  } finally {
    client.release();
  }
}
