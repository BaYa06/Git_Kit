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

function slugifyName(fullName) {
  const base = fullName.toLowerCase().trim()
    .replace(/[^\p{L}\p{N}]+/gu, '.')
    .replace(/(^\.|\.$)/g, '');
  return base || `user${Math.floor(Math.random() * 10000)}`;
}
function genTempPassword(len = 14) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@$%^&*?';
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

async function columnExists(client, table, column) {
  const q = `
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = $1 AND column_name = $2
    LIMIT 1`;
  const r = await client.query(q, [table, column]);
  return r.rowCount > 0;
}
async function hasUniqueUCR(client) {
  const q = `
    SELECT 1
    FROM pg_indexes
    WHERE tablename = 'user_company_roles'
      AND indexdef ILIKE '%UNIQUE%'
      AND indexdef ILIKE '%(user_id, company_id)%'
    LIMIT 1`;
  const r = await client.query(q);
  return r.rowCount > 0;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // auth
  const token = tokenFromCookie(req);
  if (!token) return res.status(401).json({ message: 'Unauthenticated' });

  let auth;
  try { auth = jwt.verify(token, JWT_SECRET); }
  catch (e) {
    if (isDev) console.error('JWT verify error:', e);
    return res.status(401).json({ message: 'Unauthenticated' });
  }

  const { company_id, role, full_name, email, phone } = req.body || {};
  if (!company_id || !role || !full_name) {
    return res.status(400).json({ message: 'company_id, role, full_name required' });
  }

  const client = await pool.connect();
  try {
    // право добавлять (owner/admin)
    const perm = await client.query(
      `SELECT 1 FROM user_company_roles
       WHERE user_id=$1 AND company_id=$2 AND role IN ('owner','admin')`,
      [auth.sub, company_id]
    );
    if (perm.rowCount === 0) {
      return res.status(403).json({ message: 'Нет прав добавлять сотрудников' });
    }

    // подготовим «какие поля реально есть» в users
    const usersCols = {
      username: await columnExists(client, 'users', 'username'),
      first_name: await columnExists(client, 'users', 'first_name'),
      last_name: await columnExists(client, 'users', 'last_name'),
      email: await columnExists(client, 'users', 'email'),
      phone: await columnExists(client, 'users', 'phone'),
      password_hash: await columnExists(client, 'users', 'password_hash'),
      must_change_password: await columnExists(client, 'users', 'must_change_password'),
      status: await columnExists(client, 'users', 'status'),
      password_changed_at: await columnExists(client, 'users', 'password_changed_at'),
    };
    const ucrHasRole = await columnExists(client, 'user_company_roles', 'role');
    const ucrHasUnique = await hasUniqueUCR(client);

    await client.query('BEGIN');

    // найти уже существующего по email/phone (если такие столбцы есть)
    let user = null;
    if (email && usersCols.email) {
      const q = await client.query(`SELECT id, username FROM users WHERE email=$1 LIMIT 1`, [email]);
      user = q.rows[0] || null;
    }
    if (!user && phone && usersCols.phone) {
      const q = await client.query(`SELECT id, username FROM users WHERE phone=$1 LIMIT 1`, [phone]);
      user = q.rows[0] || null;
    }

    let tempPassword = null;
    if (!user) {
      // создаём нового пользователя, но вставляем ТОЛЬКО существующие колонки
      const parts = full_name.trim().split(/\s+/);
      const first = parts[0] || null;
      const last  = parts.slice(1).join(' ') || null;

      // username (если нет колонки username — пропустим)
      let username = null;
      if (usersCols.username) {
        let base = slugifyName(full_name).slice(0, 24) || `user${Date.now()}`;
        let candidate = base, n = 0;
        while (true) {
          const chk = await client.query(`SELECT 1 FROM users WHERE username=$1`, [candidate]);
          if (chk.rowCount === 0) break;
          n += 1; candidate = `${base}${n}`;
        }
        username = candidate;
      }

      // пароль
      let hash = null;
      if (usersCols.password_hash) {
        tempPassword = genTempPassword();
        hash = await bcrypt.hash(tempPassword, 10);
      }

      const cols = [];
      const placeholders = [];
      const values = [];
      let i = 1;

      if (usersCols.username && username !== null) { cols.push('username'); placeholders.push(`$${i++}`); values.push(username); }
      if (usersCols.first_name) { cols.push('first_name'); placeholders.push(`$${i++}`); values.push(first); }
      if (usersCols.last_name)  { cols.push('last_name');  placeholders.push(`$${i++}`); values.push(last); }
      if (usersCols.email)      { cols.push('email');      placeholders.push(`$${i++}`); values.push(email || null); }
      if (usersCols.phone)      { cols.push('phone');      placeholders.push(`$${i++}`); values.push(phone || null); }
      if (usersCols.password_hash) { cols.push('password_hash'); placeholders.push(`$${i++}`); values.push(hash); }
      if (usersCols.must_change_password) { cols.push('must_change_password'); placeholders.push(`$${i++}`); values.push(true); }
      if (usersCols.status) { cols.push('status'); placeholders.push(`$${i++}`); values.push('active'); }
      if (usersCols.password_changed_at) { cols.push('password_changed_at'); placeholders.push(`$${i++}`); values.push(null); }

      if (cols.length === 0) {
        throw new Error('В таблице users нет ожидаемых колонок для вставки нового пользователя');
      }

      const sql = `INSERT INTO users (${cols.join(',')}) VALUES (${placeholders.join(',')}) RETURNING id${usersCols.username ? ', username' : ''}`;
      const ins = await client.query(sql, values);
      user = ins.rows[0];
    }

    // выдаём роль в компании
    if (ucrHasUnique) {
      // upsert
      const cols = ucrHasRole ? '(user_id, company_id, role)' : '(user_id, company_id)';
      const vals = ucrHasRole ? [user.id, company_id, role] : [user.id, company_id];
      const sql = ucrHasRole
        ? `INSERT INTO user_company_roles (user_id, company_id, role)
           VALUES ($1,$2,$3)
           ON CONFLICT (user_id, company_id) DO UPDATE SET role=EXCLUDED.role`
        : `INSERT INTO user_company_roles (user_id, company_id)
           VALUES ($1,$2)
           ON CONFLICT (user_id, company_id) DO NOTHING`;
      await client.query(sql, vals);
    } else {
      // fallback без ON CONFLICT
      const ex = await client.query(
        `SELECT 1 FROM user_company_roles WHERE user_id=$1 AND company_id=$2`,
        [user.id, company_id]
      );
      if (ex.rowCount === 0) {
        if (ucrHasRole) {
          await client.query(
            `INSERT INTO user_company_roles (user_id, company_id, role) VALUES ($1,$2,$3)`,
            [user.id, company_id, role]
          );
        } else {
          await client.query(
            `INSERT INTO user_company_roles (user_id, company_id) VALUES ($1,$2)`,
            [user.id, company_id]
          );
        }
      } else if (ucrHasRole) {
        await client.query(
          `UPDATE user_company_roles SET role=$3 WHERE user_id=$1 AND company_id=$2`,
          [user.id, company_id, role]
        );
      }
    }

    await client.query('COMMIT');

    return res.status(200).json({
      ok: true,
      user: { id: user.id, username: user.username || null },
      credentials: isDev && user.username && (/** был новый пароль? */ true) && (/** если мы его генерили */ !!user.username) && (/** tempPassword задан? */ !!tempPassword)
        ? { username: user.username, tempPassword }
        : (tempPassword ? { username: user.username || email || phone || null, tempPassword } : null)
    });
  } catch (e) {
    await client.query('ROLLBACK');
    if (isDev) console.error('create employee error:', e);
    return res.status(500).json({
      message: 'DB error',
      code: e.code || null,
      detail: e.detail || null,
      constraint: e.constraint || null,
      table: e.table || null,
      column: e.column || null
    });
  } finally {
    client.release();
  }
}
