// pages/api/v1/auth/me.js
import { Pool } from 'pg'
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
  const token = getTokenFromCookie(req)
  if (!token) return res.status(401).json({ message: 'Unauthenticated' })

  let payload
  try {
    payload = jwt.verify(token, JWT_SECRET)
  } catch {
    return res.status(401).json({ message: 'Unauthenticated' })
  }

  if (req.method === 'GET') {
    try {
      const { rows } = await pool.query(
        'SELECT id, first_name, last_name, email, phone FROM users WHERE id=$1 LIMIT 1',
        [payload.sub]
      )
      if (!rows[0]) return res.status(401).json({ message: 'Unauthenticated' })
      return res.status(200).json({ user: rows[0] })
    } catch (e) {
      console.error(e)
      return res.status(500).json({ message: 'Server error' })
    }
  }

  if (req.method === 'PATCH') {
    const { first_name, last_name, email, phone } = req.body || {}
    try {
      // Простейшая валидация
      if (email && typeof email !== 'string') return res.status(400).json({ message: 'Некорректный email' })
      if (phone && typeof phone !== 'string') return res.status(400).json({ message: 'Некорректный телефон' })

      // (опционально) проверка уникальности email
      if (email) {
        const dupe = await pool.query('SELECT 1 FROM users WHERE email=$1 AND id<>$2', [email, payload.sub])
        if (dupe.rowCount > 0) return res.status(409).json({ message: 'Этот email уже занят' })
      }

      const { rows } = await pool.query(
        `UPDATE users
           SET first_name = COALESCE($1, first_name),
               last_name  = COALESCE($2, last_name),
               email      = COALESCE($3, email),
               phone      = COALESCE($4, phone)
         WHERE id=$5
         RETURNING id, first_name, last_name, email, phone`,
        [first_name ?? null, last_name ?? null, email ?? null, phone ?? null, payload.sub]
      )
      return res.status(200).json({ user: rows[0] })
    } catch (e) {
      console.error(e)
      return res.status(500).json({ message: 'Server error' })
    }
  }

  return res.status(405).end()
}
