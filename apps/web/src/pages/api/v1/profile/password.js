// pages/api/v1/profile/password.js
import { Pool } from 'pg'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me'
const isDev = process.env.NODE_ENV !== 'production'

function tokenFromCookie(req) {
  const cookie = req.headers.cookie || ''
  const p = cookie.split('; ').find(c => c.startsWith('gidkit_token='))
  return p ? decodeURIComponent(p.split('=')[1]) : null
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const token = tokenFromCookie(req)
  if (!token) return res.status(401).json({ message: 'Unauthenticated' })

  let auth
  try { auth = jwt.verify(token, JWT_SECRET) }
  catch { return res.status(401).json({ message: 'Unauthenticated' }) }

  const { currentPassword, newPassword, confirmPassword } = req.body || {}
  if (!newPassword || !confirmPassword) {
    return res.status(400).json({ message: 'Укажите новый пароль и подтверждение' })
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ message: 'Пароль должен быть не короче 8 символов' })
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: 'Пароли не совпадают' })
  }

  const client = await pool.connect()
  try {
    const q = await client.query(
      'SELECT password_hash, must_change_password FROM users WHERE id=$1 LIMIT 1',
      [auth.sub]
    )
    if (q.rowCount === 0) return res.status(401).json({ message: 'Unauthenticated' })

    const row = q.rows[0]

    // Требуем ввод текущего пароля (в т.ч. временного)
    if (!currentPassword) {
      return res.status(400).json({ message: 'Введите текущий пароль' })
    }
    if (row.password_hash) {
      const ok = await bcrypt.compare(currentPassword, row.password_hash)
      if (!ok) return res.status(400).json({ message: 'Неверный текущий пароль' })
    }

    const hash = await bcrypt.hash(newPassword, 10)
    await client.query(
      `UPDATE users
         SET password_hash=$1,
             must_change_password=false,
             password_changed_at=NOW()
       WHERE id=$2`,
      [hash, auth.sub]
    )

    return res.status(200).json({ ok: true })
  } catch (e) {
    if (isDev) console.error('change password error:', e)
    return res.status(500).json({ message: 'Server error' })
  } finally {
    client.release()
  }
}
