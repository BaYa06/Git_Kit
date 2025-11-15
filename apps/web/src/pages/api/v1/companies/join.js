// pages/api/v1/companies/join.js
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const token = tokenFromCookie(req);
  if (!token) {
    return res.status(401).json({ message: 'Не авторизован' });
  }

  let auth;
  try {
    auth = jwt.verify(token, JWT_SECRET);
  } catch (e) {
    if (isDev) console.error('join companies: jwt error', e);
    return res.status(401).json({ message: 'Не авторизован' });
  }

  const { login, password } = req.body || {};
  if (!login || !password) {
    return res.status(400).json({ message: 'Нужно указать логин и пароль' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // ищем НЕИСПОЛЬЗОВАННОЕ приглашение
    const { rows: inviteRows } = await client.query(
      `SELECT ci.*, c.name AS company_name, c.logo_url
       FROM company_invites ci
       JOIN companies c ON c.id = ci.company_id
       WHERE ci.login = $1
         AND (ci.is_used IS NOT TRUE)
       ORDER BY ci.created_at DESC
       LIMIT 1`,
      [login],
    );

    if (!inviteRows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Такой пользователь не найден' });
    }

    const invite = inviteRows[0];

    const ok = await bcrypt.compare(password, invite.password_hash);
    if (!ok) {
      await client.query('ROLLBACK');
      return res.status(401).json({ message: 'Такой пользователь не найден' });
    }

    // добавляем роль текущему пользователю
    const { rows: ucrCols } = await client.query(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_name = 'user_company_roles'`,
    );
    const colNames = ucrCols.map(r => r.column_name);
    const hasRole = colNames.includes('role');
    const hasInvitedBy = colNames.includes('invited_by');
    const hasInvitedAt = colNames.includes('invited_at');

    // есть ли уже запись
    const { rows: existing } = await client.query(
      `SELECT id, role
       FROM user_company_roles
       WHERE user_id = $1 AND company_id = $2
       LIMIT 1`,
      [auth.sub, invite.company_id],
    );

    if (!existing[0]) {
      // вставляем новую
      const cols = ['user_id', 'company_id'];
      const vals = [auth.sub, invite.company_id];
      const placeholders = ['$1', '$2'];
      let i = 3;

      if (hasRole) {
        cols.push('role');
        vals.push(invite.role);
        placeholders.push(`$${i++}`);
      }
      if (hasInvitedBy) {
        cols.push('invited_by');
        vals.push(invite.created_by || null);
        placeholders.push(`$${i++}`);
      }
      if (hasInvitedAt) {
        cols.push('invited_at');
        vals.push(new Date());
        placeholders.push(`$${i++}`);
      }

      const sql = `
        INSERT INTO user_company_roles (${cols.join(', ')})
        VALUES (${placeholders.join(', ')})
      `;
      await client.query(sql, vals);
    } else if (hasRole) {
      // обновляем роль, если таблица поддерживает role
      await client.query(
        `UPDATE user_company_roles
         SET role = $3
         WHERE user_id = $1 AND company_id = $2`,
        [auth.sub, invite.company_id, invite.role],
      );
    }

    // помечаем приглашение как ИСПОЛЬЗОВАННОЕ (одноразовое)
    const hasUsed = (await client.query(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_name = 'company_invites' AND column_name = 'is_used'`,
    )).rowCount > 0;
    const hasUsedBy = (await client.query(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_name = 'company_invites' AND column_name = 'used_by'`,
    )).rowCount > 0;
    const hasUsedAt = (await client.query(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_name = 'company_invites' AND column_name = 'used_at'`,
    )).rowCount > 0;

    const updCols = [];
    const updVals = [];
    let j = 1;

    if (hasUsed) {
      updCols.push(`is_used = $${j++}`);
      updVals.push(true);
    }
    if (hasUsedBy) {
      updCols.push(`used_by = $${j++}`);
      updVals.push(auth.sub);
    }
    if (hasUsedAt) {
      updCols.push(`used_at = $${j++}`);
      updVals.push(new Date());
    }

    if (updCols.length > 0) {
      updVals.push(invite.id);
      const sql = `
        UPDATE company_invites
        SET ${updCols.join(', ')}
        WHERE id = $${updVals.length}
      `;
      await client.query(sql, updVals);
    }

    // перечитываем список компаний текущего пользователя
    const { rows: companies } = await client.query(
      `SELECT c.id, c.name, c.logo_url
       FROM companies c
       JOIN user_company_roles ucr ON ucr.company_id = c.id
       WHERE ucr.user_id = $1
       ORDER BY c.name ASC`,
      [auth.sub],
    );

    await client.query('COMMIT');

    return res.status(200).json({
      ok: true,
      companies,
      joined_company_id: invite.company_id,
    });
  } catch (e) {
    await client.query('ROLLBACK');
    if (isDev) console.error('join companies error', e);
    return res.status(500).json({
      message: isDev ? `Ошибка сервера: ${e.message}` : 'Ошибка сервера',
    });
  } finally {
    client.release();
  }
}
