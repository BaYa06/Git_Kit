import { Client } from 'pg';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { first_name, last_name, email, phone, password } = req.body || {};
  if (!first_name || !last_name || !email || !phone || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  if (!/^\+996\d{9}$/.test(phone)) {
    return res.status(400).json({ error: 'Неверный формат телефона (+996XXXXXXXXX)' });
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Neon/Vercel Postgres
  });

  try {
    await client.connect();

    const dup = await client.query('SELECT id FROM users WHERE email=$1 LIMIT 1', [email]);
    if (dup.rowCount) return res.status(409).json({ error: 'Email уже зарегистрирован' });

    const hash = await bcrypt.hash(password, 10);
    const id = crypto.randomUUID();
    await client.query(
      `INSERT INTO users (id,email,first_name,last_name,phone,password_hash,created_at)
       VALUES ($1,$2,$3,$4,$5,$6,now())`,
      [id, email, first_name, last_name, phone, hash]
    );

    return res.status(200).json({ message: 'Успешная регистрация' });
  } catch (e) {
    console.error('register error:', e);
    // Подсказываем, если нет таблиц
    if (String(e.message || '').includes('relation "users" does not exist')) {
      return res.status(500).json({ error: 'Нет таблиц. Сначала запусти schema.sql в базе.' });
    }
    return res.status(500).json({ error: 'Server error' });
  } finally {
    await client.end();
  }
}
