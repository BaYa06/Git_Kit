// pages/profile/edit.js
import jwt from 'jsonwebtoken'
import { Pool } from 'pg'
import Link from 'next/link'
import { useState } from 'react'

export async function getServerSideProps({ req }) {
  const cookie = req.headers.cookie || ''
  const pair = cookie.split('; ').find(c => c.startsWith('gidkit_token='))
  if (!pair) return { redirect: { destination: '/login', permanent: false } }

  try {
    const token = decodeURIComponent(pair.split('=')[1])
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_me')

    const pool = new Pool({ connectionString: process.env.DATABASE_URL })
    const { rows } = await pool.query(
      'SELECT first_name, last_name, email, phone FROM users WHERE id=$1 LIMIT 1',
      [payload.sub]
    )
    await pool.end()

    if (!rows[0]) return { redirect: { destination: '/login', permanent: false } }

    return { props: { user: rows[0] } }
  } catch {
    return { redirect: { destination: '/login', permanent: false } }
  }
}

export default function EditProfile({ user }) {
  const [form, setForm] = useState({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    email: user.email || '',
    phone: user.phone || '',
  })
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    try {
      const res = await fetch('/api/v1/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Ошибка')
      window.location.href = '/cabinet'
    } catch (err) {
      setMsg(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <h1 className="text-xl font-semibold text-slate-900 text-center">Изменить данные</h1>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm text-slate-600 mb-1">Имя</label>
            <input
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">Фамилия</label>
            <input
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
              value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">Почта</label>
            <input
              type="email"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">Телефон</label>
            <input
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          {msg && <div className="text-sm text-red-600">{msg}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 text-white py-2.5 hover:opacity-95 active:scale-[.99] transition"
          >
            {loading ? 'Сохраняем…' : 'Сохранить'}
          </button>

          <Link
            href="/cabinet"
            className="block text-center text-sm text-slate-600 hover:text-slate-900 mt-2"
          >
            Отмена
          </Link>
        </form>
      </div>
    </div>
  )
}
