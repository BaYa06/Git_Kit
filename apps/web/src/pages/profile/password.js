// pages/profile/password.js
import Link from 'next/link'
import jwt from 'jsonwebtoken'

export async function getServerSideProps({ req }) {
  const cookie = req.headers.cookie || ''
  const pair = cookie.split('; ').find(c => c.startsWith('gidkit_token='))
  if (!pair) return { redirect: { destination: '/login', permanent: false } }

  try {
    const token = decodeURIComponent(pair.split('=')[1])
    jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_me') // только проверка
    return { props: {} }
  } catch {
    return { redirect: { destination: '/login', permanent: false } }
  }
}

import { useState } from 'react'

export default function ChangePassword() {
  const [form, setForm] = useState({
    current_password: '',
    new_password: '',
    confirm: '',
  })
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setMsg(null)
    if (form.new_password !== form.confirm) {
      setMsg('Пароли не совпадают')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/v1/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_password: form.current_password, new_password: form.new_password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Ошибка')
      // Успех — возвращаем в кабинет
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
        <h1 className="text-xl font-semibold text-slate-900 text-center">Изменить пароль</h1>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm text-slate-600 mb-1">Текущий пароль</label>
            <input
              type="password"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
              value={form.current_password}
              onChange={(e) => setForm({ ...form, current_password: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">Новый пароль</label>
            <input
              type="password"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
              value={form.new_password}
              onChange={(e) => setForm({ ...form, new_password: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">Повторите новый пароль</label>
            <input
              type="password"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            />
          </div>

          {msg && <div className="text-sm text-red-600">{msg}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 text-white py-2.5 hover:opacity-95 active:scale-[.99] transition"
          >
            {loading ? 'Обновляем…' : 'Сменить пароль'}
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
