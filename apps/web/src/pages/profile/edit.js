// pages/profile/edit.js
import jwt from 'jsonwebtoken'
import { Pool } from 'pg'
import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, Save, User as UserIcon } from 'lucide-react'
import s from '../../styles/profile.module.css'

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
    <div className={s.page}>
      <div className={s.shell}>
        <div className={s.header}>
          <Link href="/cabinet" className={s.backBtn}>
            <ArrowLeft className="w-4 h-4" />
            В кабинет
          </Link>
          <span className={s.badge}>Изменить данные</span>
        </div>

        <div className={s.card}>
          <div className={s.cardHead}>
            <div className={s.titleBlock}>
              <div className={s.cardCaption}>Профиль</div>
              <div className={s.cardTitle}>Контакты и имя</div>
              <div className={s.cardHint}>
                Обновите свои данные, чтобы коллеги видели актуальные контакты.
              </div>
            </div>
            <div className={s.status}>
              <UserIcon className="w-4 h-4" />
              Аккаунт
            </div>
          </div>

          <form onSubmit={onSubmit} className={s.form}>
            <div className={s.field}>
              <div className={s.labelRow}>
                <label className={s.label} htmlFor="firstName">
                  Имя
                </label>
                <span className={s.hint}>Отображается в карточках</span>
              </div>
              <input
                id="firstName"
                className={s.input}
                value={form.first_name}
                placeholder="Иван"
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              />
            </div>

            <div className={s.field}>
              <div className={s.labelRow}>
                <label className={s.label} htmlFor="lastName">
                  Фамилия
                </label>
              </div>
              <input
                id="lastName"
                className={s.input}
                value={form.last_name}
                placeholder="Иванов"
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              />
            </div>

            <div className={s.field}>
              <div className={s.labelRow}>
                <label className={s.label} htmlFor="email">
                  Почта
                </label>
                <span className={s.hint}>Для уведомлений и входа</span>
              </div>
              <input
                id="email"
                type="email"
                className={s.input}
                value={form.email}
                placeholder="you@example.com"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className={s.field}>
              <div className={s.labelRow}>
                <label className={s.label} htmlFor="phone">
                  Телефон
                </label>
                <span className={s.hint}>+7 900 000-00-00</span>
              </div>
              <input
                id="phone"
                className={s.input}
                value={form.phone}
                placeholder="+7 ___ ___-__-__"
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            {msg && <div className={s.message}>{msg}</div>}

            <hr className={s.divider} />

            <div className={s.actions}>
              <Link href="/cabinet" className={s.ghostBtn}>
                Отмена
              </Link>
              <button type="submit" disabled={loading} className={s.primaryBtn}>
                <Save className="w-4 h-4" />
                {loading ? 'Сохраняем…' : 'Сохранить'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
