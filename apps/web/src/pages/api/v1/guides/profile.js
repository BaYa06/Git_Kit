import { Pool } from "pg";
import jwt from "jsonwebtoken";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const isDev = process.env.NODE_ENV !== "production";

const allowedLanguages = ["Кыргызский", "Русский", "Английский"];

function tokenFromCookie(req) {
  const cookie = req.headers.cookie || "";
  const pair = cookie.split("; ").find((c) => c.startsWith("gidkit_token="));
  return pair ? decodeURIComponent(pair.split("=")[1]) : null;
}

function normalizeLanguages(langs) {
  if (!Array.isArray(langs)) return [];
  const uniq = [];
  langs.forEach((l) => {
    if (!l || typeof l !== "string") return;
    const clean = l.trim();
    if (!allowedLanguages.includes(clean)) return;
    if (uniq.includes(clean)) return;
    if (uniq.length >= 3) return;
    uniq.push(clean);
  });
  return uniq;
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
  if (req.method !== "PUT") return res.status(405).end();

  const token = tokenFromCookie(req);
  if (!token) return res.status(401).json({ message: "Unauthenticated" });

  let auth;
  try {
    auth = jwt.verify(token, JWT_SECRET);
  } catch (e) {
    if (isDev) console.error("guide profile jwt error:", e);
    return res.status(401).json({ message: "Unauthenticated" });
  }

  const { company_id, first_name, last_name, email, phone, languages } =
    req.body || {};
  if (!company_id) {
    return res.status(400).json({ message: "company_id обязателен" });
  }

  const normalizedLangs = normalizeLanguages(languages);
  if (languages && normalizedLangs.length === 0) {
    return res
      .status(400)
      .json({ message: "Выберите до трёх языков из списка" });
  }

  const client = await pool.connect();
  try {
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

    if (email) {
      const dupe = await client.query(
        `SELECT 1 FROM users WHERE email = $1 AND id <> $2 LIMIT 1`,
        [email, auth.sub]
      );
      if (dupe.rowCount > 0) {
        return res.status(409).json({ message: "Этот email уже занят" });
      }
    }

    await client.query("BEGIN");

    await client.query(
      `
        UPDATE users
           SET first_name = COALESCE($1, first_name),
               last_name  = COALESCE($2, last_name),
               email      = COALESCE($3, email),
               phone      = COALESCE($4, phone)
         WHERE id = $5
      `,
      [first_name ?? null, last_name ?? null, email ?? null, phone ?? null, auth.sub]
    );

    const fullName = [first_name, last_name].filter(Boolean).join(" ").trim();
    await client.query(
      `
        UPDATE guides
           SET full_name = COALESCE($1, full_name),
               email     = COALESCE($2, email),
               phone     = COALESCE($3, phone),
               languages = CASE WHEN $4::text[] IS NOT NULL THEN $4 ELSE languages END
         WHERE id = $5 AND company_id = $6
      `,
      [
        fullName || null,
        email ?? null,
        phone ?? null,
        normalizedLangs.length ? normalizedLangs : null,
        guideId,
        company_id,
      ]
    );

    await client.query("COMMIT");

    return res.status(200).json({
      ok: true,
      guide: {
        id: guideId,
        full_name: fullName || null,
        email: email || null,
        phone: phone || null,
        languages: normalizedLangs.length ? normalizedLangs : null,
      },
    });
  } catch (e) {
    await client.query("ROLLBACK").catch(() => {});
    if (isDev) console.error("guide profile update error:", e);
    return res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
}
