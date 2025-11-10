// pages/api/v1/auth/login.js
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'email и password обязательны' });

  try {
    const { rows } = await pool.query(
      'SELECT id, password_hash, first_name, last_name FROM users WHERE email=$1 LIMIT 1',
      [email]
    );
    if (!rows[0]) return res.status(401).json({ message: 'Неверные данные' });

    const ok = await bcrypt.compare(password, rows[0].password_hash);
    if (!ok) return res.status(401).json({ message: 'Неверные данные' });

    const token = jwt.sign({ sub: rows[0].id }, JWT_SECRET, { expiresIn: '7d' });

    res.setHeader('Set-Cookie', serialize('gidkit_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    }));

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
}
