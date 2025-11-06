import { Client } from 'pg';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    const q = await client.query('SELECT id, password_hash FROM users WHERE email=$1 LIMIT 1', [email]);
    if (!q.rowCount) return res.status(401).json({ error: 'Неверный логин или пароль' });

    const ok = await bcrypt.compare(password, q.rows[0].password_hash || '');
    if (!ok) return res.status(401).json({ error: 'Неверный логин или пароль' });

    return res.status(200).json({ message: 'Успешный вход' });
  } catch (e) {
    console.error('login error:', e);
    return res.status(500).json({ error: 'Server error' });
  } finally {
    await client.end();
  }
}
