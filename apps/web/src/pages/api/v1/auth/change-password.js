// pages/api/v1/auth/change-password.js
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me'

function getTokenFromCookie(req) {
  const cookie = req.headers.cookie || ''
  const pair = cookie.split('; ').find(c => c.startsWith('gidkit_token='))
  if (!pair) return null
  return decodeURIComponent(pair.split('=')[1])
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const token = getTokenFromCookie(req)
  if (!token) return res.status(401).json({ message: 'Unauthenticated' })

  let payload
  try {
    payload = jwt.verify(token, JWT_SECRET)
  } catch {
    return res.status(401).json({ message: 'Unauthenticated' })
  }

  const { current_password, new_password } = req.body || {}
  if (!current_password || !new_password) {
    return res.status(400).json({ message: 'Укажите текущий и новый пароль' })
  }
  if (new_password.length < 8) {
    return res.status(400).json({ message: 'Новый пароль должен быть не меньше 8 символов' })
  }

  try {
    const { rows } = await pool.query(
      'SELECT id, password_hash FROM users WHERE id=$1 LIMIT 1',
      [payload.sub]
    )
    if (!rows[0]) return res.status(401).json({ message: 'Unauthenticated' })

    const ok = await bcrypt.compare(current_password, rows[0].password_hash)
    if (!ok) return res.status(400).json({ message: 'Неверный текущий пароль' })

    const newHash = await bcrypt.hash(new_password, 10)
    await pool.query('UPDATE users SET password_hash=$1, password_changed_at=NOW() WHERE id=$2', [newHash, payload.sub])

    return res.status(200).json({ ok: true, message: 'Пароль обновлён' })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ message: 'Server error' })
  }
}
