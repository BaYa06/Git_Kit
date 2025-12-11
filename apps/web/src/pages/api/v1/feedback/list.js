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
  if (req.method !== "GET") return res.status(405).end();

  const { tour_id } = req.query || {};
  if (!tour_id) {
    return res.status(400).json({ message: "tour_id обязателен" });
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
    const tourRes = await client.query(
      `SELECT id, company_id, main_guide_id FROM tours WHERE id = $1 LIMIT 1`,
      [tour_id]
    );
    const tourRow = tourRes.rows[0];
    if (!tourRow) return res.status(404).json({ message: "Тур не найден" });

    const roleRes = await client.query(
      `
        SELECT role
        FROM user_company_roles
        WHERE user_id = $1 AND company_id = $2 AND role IN ('guide','admin','owner','manager','coordinator')
        LIMIT 1
      `,
      [auth.sub, tourRow.company_id]
    );
    if (roleRes.rowCount === 0) {
      return res.status(403).json({ message: "Нет доступа" });
    }

    const guideId = await findGuideForUser(client, auth.sub, tourRow.company_id);
    if (roleRes.rows[0].role === "guide") {
      const bindRes = await client.query(
        `
          SELECT 1
          FROM tours t
          LEFT JOIN tour_components tc
            ON tc.tour_id = t.id AND tc.type = 'guide' AND tc.guide_id IS NOT NULL
          WHERE t.id = $1 AND (t.main_guide_id = $2 OR tc.guide_id = $2)
          LIMIT 1
        `,
        [tour_id, guideId || null]
      );
      if (bindRes.rowCount === 0) {
        return res.status(403).json({ message: "Вы не привязаны к этому туру" });
      }
    }

    const rows = await client.query(
      `
        SELECT
          f.id,
          f.tourist_name,
          f.rating_guide,
          f.rating_transport,
          f.rating_tour,
          f.guide_comment,
          f.driver_comment,
          f.tour_comment,
          f.created_at
        FROM tour_feedbacks f
        JOIN tour_feedback_links l ON l.id = f.feedback_link_id
        WHERE l.tour_id = $1
        ORDER BY f.created_at DESC
      `,
      [tour_id]
    );

    return res.status(200).json({ items: rows.rows || [] });
  } catch (e) {
    if (isDev) console.error("feedback list error:", e);
    return res.status(500).json({ message: "DB error" });
  } finally {
    client.release();
  }
}
