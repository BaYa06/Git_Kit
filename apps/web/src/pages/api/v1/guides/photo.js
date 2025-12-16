import { Pool } from "pg";
import jwt from "jsonwebtoken";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import { put, del } from "@vercel/blob";

export const config = {
  api: { bodyParser: false },
};

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const isDev = process.env.NODE_ENV !== "production";
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

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
      SELECT id, logo_url
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

  if (!guideRes.rows[0]) return null;
  return {
    id: guideRes.rows[0].id,
    logo_url: guideRes.rows[0].logo_url || null,
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const token = tokenFromCookie(req);
  if (!token) return res.status(401).json({ message: "Unauthenticated" });

  let auth;
  try {
    auth = jwt.verify(token, JWT_SECRET);
  } catch (e) {
    if (isDev) console.error("guide photo jwt error:", e);
    return res.status(401).json({ message: "Unauthenticated" });
  }

  const form = formidable({
    multiples: false,
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024,
    filter: (part) => {
      if (!part.mimetype) return true;
      return part.mimetype.startsWith("image/") || part.name === "action" || part.name === "company_id";
    },
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      if (isDev) console.error("guide photo parse error:", err);
      return res.status(400).json({ message: "Неверные данные формы" });
    }

    const companyId = (fields.company_id || "").toString();
    if (!companyId) {
      return res.status(400).json({ message: "company_id обязателен" });
    }

    const action = (fields.action || "").toString();

    const client = await pool.connect();
    try {
      const perm = await client.query(
        `
          SELECT role FROM user_company_roles
          WHERE user_id = $1 AND company_id = $2 AND role = 'guide'
          LIMIT 1
        `,
        [auth.sub, companyId]
      );
      if (perm.rowCount === 0) {
        return res.status(403).json({ message: "Нет доступа" });
      }

      const guide = await findGuideForUser(client, auth.sub, companyId);
      if (!guide?.id) {
        return res.status(404).json({ message: "Гид не найден" });
      }

      // удалить фото
      if (action === "remove") {
        try {
          await client.query(
            `UPDATE guides SET logo_url = NULL WHERE id = $1 AND company_id = $2`,
            [guide.id, companyId]
          );
          if (guide.logo_url && BLOB_TOKEN) {
            try {
              await del(guide.logo_url, { token: BLOB_TOKEN });
            } catch (e) {
              if (isDev) console.warn("blob delete skipped:", e?.message || e);
            }
          }
          return res.status(200).json({ ok: true, logo_url: null });
        } catch (e) {
          if (isDev) console.error("guide photo delete error:", e);
          return res.status(500).json({ message: "Не удалось удалить фото" });
        }
      }

      // загрузить новое фото
      let file = files.photo || files.file || files.logo;
      if (Array.isArray(file)) file = file[0];
      if (!file) {
        return res.status(400).json({ message: "Прикрепите файл" });
      }
      if (!BLOB_TOKEN) {
        return res
          .status(500)
          .json({ message: "BLOB_READ_WRITE_TOKEN не настроен" });
      }

      try {
        const tmpPath = file.filepath || file.path;
        const orig = file.originalFilename || file.newFilename || "avatar.png";
        const ext = path.extname(orig) || ".png";
        const filename = `guide-avatar-${guide.id}-${Date.now()}${ext}`;

        const blob = await put(filename, fs.createReadStream(tmpPath), {
          access: "public",
          token: BLOB_TOKEN,
          contentType: file.mimetype || undefined,
        });

        const logoUrl = blob?.url || null;
        await client.query(
          `UPDATE guides SET logo_url = $1 WHERE id = $2 AND company_id = $3`,
          [logoUrl, guide.id, companyId]
        );

        if (guide.logo_url && BLOB_TOKEN) {
          try {
            await del(guide.logo_url, { token: BLOB_TOKEN });
          } catch (e) {
            if (isDev) console.warn("old guide photo delete skipped:", e?.message || e);
          }
        }

        try {
          await fs.promises.unlink(tmpPath);
        } catch (_) {
          /* ignore */
        }

        return res.status(200).json({ ok: true, logo_url: logoUrl });
      } catch (e) {
        if (isDev) console.error("guide photo upload error:", e);
        return res.status(500).json({ message: "Не удалось сохранить фото" });
      }
    } finally {
      client.release();
    }
  });
}
