import { Pool } from "pg";
import jwt from "jsonwebtoken";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const isDev = process.env.NODE_ENV !== "production";

const formatDate = (value) => {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

function tokenFromCookie(req) {
  const cookie = req.headers.cookie || "";
  const pair = cookie.split("; ").find((c) => c.startsWith("gidkit_token="));
  return pair ? decodeURIComponent(pair.split("=")[1]) : null;
}

const isComponentFilled = (c) => {
  if (!c || !c.type) return false;
  const hasId = !!c.selectedId;
  const hasCustom =
    c.mode === "custom" && c.custom && Object.keys(c.custom || {}).length > 0;
  return hasId || hasCustom;
};

const calcStatus = (components = []) => {
  const normalized = (components || []).filter((c) => c && c.type);
  if (normalized.length === 0) return "planned";
  const allFilled = normalized.every(isComponentFilled);
  return allFilled ? "confirmed" : "planned";
};

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
    tour_id,
    name,
    start_date,
    end_date,
    tourists_count,
    components,
  } = req.body || {};

  if (!tour_id || !name) {
    return res.status(400).json({ message: "tour_id и name обязательны" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const tourRes = await client.query(
      `SELECT id, company_id FROM tours WHERE id = $1 LIMIT 1`,
      [tour_id]
    );

    if (tourRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Тур не найден" });
    }

    const companyId = tourRes.rows[0].company_id;

    const perm = await client.query(
      `
      SELECT 1
      FROM user_company_roles
      WHERE user_id = $1
        AND company_id = $2
        AND role IN ('owner','admin')
      LIMIT 1
    `,
      [auth.sub, companyId]
    );

    if (perm.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(403).json({ message: "Нет прав редактировать тур" });
    }

    const touristsParsed = Number.isFinite(parseInt(tourists_count, 10))
      ? parseInt(tourists_count, 10)
      : null;

    const status = calcStatus(components);

    const updateRes = await client.query(
      `
      UPDATE tours
      SET
        name = $2,
        start_date = $3,
        end_date = $4,
        tourists_count = $5,
        status = $6
      WHERE id = $1
      RETURNING id, company_id, template_id, name, status, start_date, end_date, tourists_count, created_at
    `,
      [tour_id, name.trim(), start_date || null, end_date || null, touristsParsed, status]
    );

    // пересобираем компоненты заново
    await client.query(`DELETE FROM tour_components WHERE tour_id = $1`, [tour_id]);

    if (Array.isArray(components) && components.length > 0) {
      for (let i = 0; i < components.length; i++) {
        const c = components[i];
        if (!c || !c.type) continue;

        const mode = c.mode === "custom" ? "custom" : "base";
        const guideId = c.type === "guide" && c.selectedId ? c.selectedId : null;
        const hotelId = c.type === "hotel" && c.selectedId ? c.selectedId : null;
        const driverId = c.type === "transport" && c.selectedId ? c.selectedId : null;
        const custom = mode === "custom" ? c.custom || {} : null;

        if (c.type === "guide" && guideId) {
          const gRes = await client.query(
            `SELECT 1 FROM guides WHERE id = $1 AND company_id = $2 LIMIT 1`,
            [guideId, companyId]
          );
          if (gRes.rowCount === 0) {
            await client.query("ROLLBACK");
            return res
              .status(400)
              .json({ message: "Гид не найден в базе компании", detail: `guide_id=${guideId}` });
          }
        }

        await client.query(
          `
          INSERT INTO tour_components (tour_id, type, mode, comment, guide_id, hotel_id, driver_id, custom)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `,
          [
            tour_id,
            c.type,
            mode,
            c.comment || "",
            guideId,
            hotelId,
            driverId,
            custom ? JSON.stringify(custom) : null,
          ]
        );
      }
    }

    await client.query("COMMIT");

    const tour = updateRes.rows[0];

    return res.status(200).json({
      tour: {
        ...tour,
        start_date: formatDate(tour.start_date),
        end_date: formatDate(tour.end_date),
      },
    });
  } catch (e) {
    await client.query("ROLLBACK");
    if (isDev) console.error("update tour error:", e);
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
