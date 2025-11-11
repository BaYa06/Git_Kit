// pages/profile/password.js
import { useState } from 'react'
import jwt from 'jsonwebtoken'
import { Pool } from 'pg'
import Link from 'next/link'

export async function getServerSideProps({ req, query }) {
  const cookie = req.headers.cookie || ''
  const pair = cookie.split('; ').find(c => c.startsWith('gidkit_token='))
  if (!pair) return { redirect: { destination: '/login', permanent: false } }

  try {
    const token = decodeURIComponent(pair.split('=')[1])
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_me')

    const pool = new Pool({ connectionString: process.env.DATABASE_URL })
    const { rows } = await pool.query(
      'SELECT first_name, last_name, email, must_change_password FROM users WHERE id=$1 LIMIT 1',
      [payload.sub]
    )
    await pool.end()

    if (!rows[0]) return { redirect: { destination: '/login', permanent: false } }

    const u = rows[0]
    const name = [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email || 'Пользователь'

    return { props: { user: { name }, force: u.must_change_password || !!query.force } }
  } catch {
    return { redirect: { destination: '/login', permanent: false } }
  }
}

export default function PasswordPage({ user, force }) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/v1/profile/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: current, newPassword: next, confirmPassword: confirm })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Ошибка')

      // успех — назад в кабинет
      window.location.href = '/cabinet'
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-xl p-6">
        <div className="text-center">
          <div className="text-sm text-slate-500">Смена пароля</div>
          <div className="text-lg font-semibold text-slate-900 mt-1 truncate">{user?.name || 'Пользователь'}</div>
        </div>

        {force && (
          <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Для продолжения работы необходимо сменить пароль.
          </div>
        )}

        <form onSubmit={submit} className="mt-5 space-y-4">
          <div>
            <label className="block text-sm text-slate-600 mb-1">Текущий пароль</label>
            <input
              type="password"
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="Временный/текущий пароль"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">Новый пароль</label>
            <input
              type="password"
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              placeholder="Не менее 8 символов"
              required
              minLength={8}
            />
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">Повторите новый пароль</label>
            <input
              type="password"
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <Link href="/cabinet" className="text-sm text-slate-600 hover:text-slate-900">← В кабинет</Link>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:opacity-95 active:scale-[.99]"
            >
              {saving ? 'Сохраняем…' : 'Сменить пароль'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
