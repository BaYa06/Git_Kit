// pages/api/v1/company/users/create.js
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const isDev = process.env.NODE_ENV !== 'production';

function tokenFromCookie(req) {
  const cookie = req.headers.cookie || '';
  const p = cookie.split('; ').find(c => c.startsWith('gidkit_token='));
  return p ? decodeURIComponent(p.split('=')[1]) : null;
}

// генерация читаемого логина приглашения
function genInviteLogin(role = 'user') {
  const prefix =
    role === 'admin' ? 'adm' :
    role === 'manager' || role === 'org_department' ? 'mgr' :
    role === 'guide' ? 'gde' :
    'usr';

  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const suffix = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${prefix}-${suffix}`;
}

function genTempPassword(len = 14) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@$%^&*?';
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // auth
  const token = tokenFromCookie(req);
  if (!token) return res.status(401).json({ message: 'Unauthenticated' });

  let auth;
  try {
    auth = jwt.verify(token, JWT_SECRET);
  } catch (e) {
    if (isDev) console.error('JWT verify error:', e);
    return res.status(401).json({ message: 'Unauthenticated' });
  }

  const { company_id, role } = req.body || {};
  if (!company_id || !role) {
    return res.status(400).json({ message: 'company_id и role обязательны' });
  }

  const client = await pool.connect();
  try {
    // проверяем, что текущий юзер — owner/admin этой компании
    const perm = await client.query(
      `SELECT 1
       FROM user_company_roles
       WHERE user_id = $1
         AND company_id = $2
         AND role IN ('owner','admin')`,
      [auth.sub, company_id],
    );

    if (perm.rowCount === 0) {
      return res.status(403).json({ message: 'Нет прав добавлять сотрудников' });
    }

    await client.query('BEGIN');

    // генерируем логин, который ещё не использовался
    let login;
    while (true) {
      const candidate = genInviteLogin(role);
      const ex = await client.query(
        `SELECT 1 FROM company_invites WHERE login = $1`,
        [candidate],
      );
      if (ex.rowCount === 0) {
        login = candidate;
        break;
      }
    }

    const tempPassword = genTempPassword();
    const hash = await bcrypt.hash(tempPassword, 10);

    const { rows } = await client.query(
      `INSERT INTO company_invites (company_id, role, login, password_hash, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [company_id, role, login, hash, auth.sub || null],
    );

    await client.query('COMMIT');

    return res.status(200).json({
      ok: true,
      invite: { id: rows[0].id, company_id, role, login },
      // для фронта (листок выдачи доступа)
      credentials: {
        username: login,
        tempPassword,
      },
    });
  } catch (e) {
    await client.query('ROLLBACK');
    if (isDev) console.error('create employee (invite) error:', e);
    return res.status(500).json({
      message: 'DB error',
      code: e.code || null,
      detail: e.detail || null,
      constraint: e.constraint || null,
      table: e.table || null,
      column: e.column || null,
    });
  } finally {
    client.release();
  }
}
