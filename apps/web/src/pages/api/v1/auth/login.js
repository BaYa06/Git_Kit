// pages/api/v1/auth/login.js
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'email и password обязательны' });

  try {
    const { rows } = await pool.query(
      'SELECT id, password_hash FROM users WHERE email=$1 LIMIT 1',
      [email]
    );
    if (!rows[0]) return res.status(401).json({ message: 'Неверные данные' });

    const ok = await bcrypt.compare(password, rows[0].password_hash);
    if (!ok) return res.status(401).json({ message: 'Неверные данные' });

    // TODO: установить cookie/сессию или выдать JWT
    return res.status(200).json({ ok: true, userId: rows[0].id });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
}
