// API: /api/v1/company/users/create
// Генерация логина/пароля приглашения для подключения компании в кабинете (см. /api/v1/companies/join).

import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const isDev = process.env.NODE_ENV !== 'production';

function tokenFromCookie(req) {
  const cookie = req.headers.cookie || '';
  const p = cookie.split('; ').find((c) => c.startsWith('gidkit_token='));
  return p ? decodeURIComponent(p.split('=')[1]) : null;
}

const generatePassword = () => {
  // 10–12 символов, удобно копировать
  const raw = crypto.randomBytes(9).toString('base64url');
  return raw.slice(0, 12);
};

const generateInviteLogin = (role) => {
  const suffix = crypto.randomBytes(4).toString('hex');
  const safeRole = String(role || 'user').replace(/[^a-z0-9_-]/gi, '').slice(0, 12) || 'user';
  return `${safeRole}-${suffix}`;
};

async function getColumnSet(client, tableName) {
  const { rows } = await client.query(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_name = $1`,
    [tableName]
  );
  return new Set((rows || []).map((r) => r.column_name));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const token = tokenFromCookie(req);
  if (!token) return res.status(401).json({ message: 'Unauthenticated' });

  let auth;
  try {
    auth = jwt.verify(token, JWT_SECRET);
  } catch (e) {
    if (isDev) console.error('users/create: jwt error', e);
    return res.status(401).json({ message: 'Unauthenticated' });
  }

  const { company_id: companyId, role } = req.body || {};
  if (!companyId) return res.status(400).json({ message: 'company_id is required' });
  if (!role) return res.status(400).json({ message: 'role is required' });

  const allowedRoles = new Set(['admin', 'manager', 'guide', 'coordinator', 'readonly']);
  const normalizedRole = String(role).trim();
  if (!allowedRoles.has(normalizedRole)) {
    return res.status(400).json({ message: 'Недопустимая роль' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const roleRes = await client.query(
      `SELECT role FROM user_company_roles WHERE user_id = $1 AND company_id = $2 LIMIT 1`,
      [auth.sub, companyId]
    );
    const requesterRole = roleRes.rows[0]?.role || null;
    if (!(requesterRole === 'owner' || requesterRole === 'admin')) {
      await client.query('ROLLBACK');
      return res.status(403).json({ message: 'Access denied' });
    }

    const invitesCols = await getColumnSet(client, 'company_invites');
    // /api/v1/companies/join ожидает эти колонки (см. SELECT + фильтр is_used + сортировка по created_at)
    const required = ['id', 'company_id', 'role', 'login', 'password_hash', 'is_used', 'created_at'];
    const missing = required.filter((col) => !invitesCols.has(col));
    if (missing.length > 0) {
      await client.query('ROLLBACK');
      return res.status(500).json({
        message: `Таблица company_invites не поддерживает колонки: ${missing.join(', ')}`,
      });
    }

    const tempPassword = generatePassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    let createdInviteId = null;
    let createdLogin = null;

    for (let attempt = 0; attempt < 6; attempt += 1) {
      const login = generateInviteLogin(normalizedRole);
      try {
        const cols = ['company_id', 'role', 'login', 'password_hash'];
        const values = [companyId, normalizedRole, login, passwordHash];

        if (invitesCols.has('created_by')) {
          cols.push('created_by');
          values.push(auth.sub);
        }
        if (invitesCols.has('created_at')) {
          cols.push('created_at');
          values.push(new Date());
        }
        if (invitesCols.has('is_used')) {
          cols.push('is_used');
          values.push(false);
        }

        const placeholders = values.map((_, idx) => `$${idx + 1}`);
        const inviteRes = await client.query(
          `INSERT INTO company_invites (${cols.join(', ')})
           VALUES (${placeholders.join(', ')})
           RETURNING id`,
          values
        );

        createdInviteId = inviteRes.rows[0]?.id || null;
        createdLogin = login;
        break;
      } catch (e) {
        // 23505 — unique violation (скорее всего email)
        if (e?.code === '23505') continue;
        throw e;
      }
    }

    if (!createdLogin) {
      throw new Error('Не удалось сгенерировать уникальный логин');
    }

    await client.query('COMMIT');

    return res.status(200).json({
      ok: true,
      credentials: {
        username: createdLogin,
        tempPassword,
      },
      invite: { id: createdInviteId, role: normalizedRole, company_id: companyId },
    });
  } catch (e) {
    await client.query('ROLLBACK');
    if (isDev) console.error('users/create error:', e);
    return res.status(500).json({
      message: isDev ? `Ошибка сервера: ${e.message}` : 'Ошибка сервера',
      code: e.code || null,
    });
  } finally {
    client.release();
  }
}
