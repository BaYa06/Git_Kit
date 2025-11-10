// pages/api/v1/companies/create.js
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: { bodyParser: false }, // обязательно для formidable
};

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const isDev = process.env.NODE_ENV !== 'production';

function getTokenFromCookie(req) {
  const cookie = req.headers.cookie || '';
  const pair = cookie.split('; ').find((c) => c.startsWith('gidkit_token='));
  if (!pair) return null;
  return decodeURIComponent(pair.split('=')[1]);
}

async function columnExists(table, column) {
  const q = `
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = $1 AND column_name = $2
    LIMIT 1
  `;
  const { rowCount } = await pool.query(q, [table, column]);
  return rowCount > 0;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // 1) Аутентификация
  const token = getTokenFromCookie(req);
  if (!token) return res.status(401).json({ message: 'Unauthenticated' });

  let userId;
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    userId = payload.sub;
  } catch (e) {
    if (isDev) console.error('JWT verify error:', e);
    return res.status(401).json({ message: 'Unauthenticated' });
  }

  // 2) Парсим multipart
  const form = formidable({
    multiples: false,
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024,
    filter: (part) => {
      if (!part.mimetype) return true;
      return part.mimetype.startsWith('image/') || part.name === 'name';
    },
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      if (isDev) console.error('formidable parse error:', err);
      return res.status(400).json({ message: 'Неверные данные формы' });
    }

    const name = (fields.name || '').toString().trim();
    if (!name) return res.status(400).json({ message: 'Введите название компании' });

    // 3) Сохраняем логотип (если есть)
    let logoUrl = null;
    try {
      let file = files.logo;
      if (Array.isArray(file)) file = file[0];
      if (file && (file.size > 0 || file.filepath || file.path)) {
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'companies');
        await fs.promises.mkdir(uploadsDir, { recursive: true });

        const orig = file.originalFilename || file.newFilename || 'logo.png';
        const ext = path.extname(orig) || '.png';
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
        const dest = path.join(uploadsDir, filename);

        // v3: file.filepath; v2: file.path
        const tmpPath = file.filepath || file.path;
        if (!tmpPath) throw new Error('No temp filepath provided by formidable');

        // безопаснее: copyFile + unlink
        await fs.promises.copyFile(tmpPath, dest);
        try { await fs.promises.unlink(tmpPath); } catch (_) {}

        logoUrl = `/uploads/companies/${filename}`;
      }
    } catch (e) {
      if (isDev) console.error('file save error:', e);
      // не фаталим — создадим без лого
      logoUrl = null;
    }

    // 4) Пишем в БД
    try {
      // Проверим, есть ли колонка created_by
      const hasCreatedBy = await columnExists('companies', 'created_by');

      let company;
      if (hasCreatedBy) {
        // сначала пробуем с created_by (тип должен совпадать с users.id — int/uuid)
        try {
          const ins = await pool.query(
            `INSERT INTO companies (name, logo_url, created_by)
             VALUES ($1, $2, $3)
             RETURNING id, name, logo_url, created_by`,
            [name, logoUrl, userId]
          );
          company = ins.rows[0];
        } catch (e) {
          // если тип не совпал/column mismatch — fallback без created_by
          if (isDev) console.warn('insert with created_by failed, fallback without it:', e.message);
          const ins2 = await pool.query(
            `INSERT INTO companies (name, logo_url)
             VALUES ($1, $2)
             RETURNING id, name, logo_url`,
            [name, logoUrl]
          );
          company = ins2.rows[0];
        }
      } else {
        // колонки created_by нет — вставляем без неё
        const ins = await pool.query(
          `INSERT INTO companies (name, logo_url)
           VALUES ($1, $2)
           RETURNING id, name, logo_url`,
          [name, logoUrl]
        );
        company = ins.rows[0];
      }

      // добавляем создателя как owner (защитимся от отсутствия индекса/constraint через перехват 23505)
      try {
        await pool.query(
          `INSERT INTO user_company_roles (user_id, company_id, role)
           VALUES ($1, $2, $3)`,
          [userId, company.id, 'owner']
        );
      } catch (e) {
        // 23505 — unique violation (значит связь уже есть) — игнорируем
        if (e.code !== '23505') {
          if (isDev) console.error('user_company_roles insert error:', e);
          // не валим создание компании из-за этой ошибки
        }
      }

      return res.status(200).json({ company });
    } catch (e) {
      if (isDev) console.error('create company error:', e);
      // Помогаем в DEV понять причину
      return res
        .status(500)
        .json({ message: isDev ? `DB error: ${e.message}` : 'Server error' });
    }
  });
}
