import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const isDev = process.env.NODE_ENV !== "production";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const {
    token,
    tourist_name,
    rating_guide,
    rating_transport,
    rating_tour,
    guide_comment,
    driver_comment,
    tour_comment,
  } = req.body || {};

  if (!token) {
    return res.status(400).json({ message: "token обязателен" });
  }

  const client = await pool.connect();
  try {
    const linkRes = await client.query(
      `
        SELECT id, is_active, expires_at
        FROM tour_feedback_links
        WHERE token = $1
        LIMIT 1
      `,
      [token]
    );
    if (linkRes.rowCount === 0) {
      return res.status(404).json({ message: "Ссылка не найдена" });
    }
    const link = linkRes.rows[0];
    const expired = link.expires_at && new Date(link.expires_at) < new Date();
    if (!link.is_active || expired) {
      return res.status(410).json({ message: "Ссылка неактивна" });
    }

    await client.query(
      `
        INSERT INTO tour_feedbacks (
          feedback_link_id,
          tourist_name,
          rating_guide,
          rating_transport,
          rating_tour,
          guide_comment,
          driver_comment,
          tour_comment
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      `,
      [
        link.id,
        tourist_name || null,
        rating_guide || null,
        rating_transport || null,
        rating_tour || null,
        guide_comment || null,
        driver_comment || null,
        tour_comment || null,
      ]
    );

    return res.status(200).json({ success: true });
  } catch (e) {
    if (isDev) console.error("feedback submit error:", e);
    return res.status(500).json({ message: "DB error" });
  } finally {
    client.release();
  }
}
