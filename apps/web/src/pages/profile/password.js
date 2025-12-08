// pages/profile/password.js
import { useState } from 'react'
import jwt from 'jsonwebtoken'
import { Pool } from 'pg'
import Link from 'next/link'
import { ArrowLeft, LockKeyhole, Save } from 'lucide-react'
import s from '../../styles/profile.module.css'

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
  const [msg, setMsg] = useState(null)

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    setMsg(null)
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
      setMsg(err.message)
    } finally {
      setSaving(false)
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
          <span className={s.badge}>Смена пароля</span>
        </div>

        <div className={s.card}>
          <div className={s.cardHead}>
            <div className={s.titleBlock}>
              <div className={s.cardCaption}>Безопасность</div>
              <div className={s.cardTitle}>Обновить пароль</div>
              <div className={s.cardHint}>
                Придумайте сложный пароль не короче 8 символов. Мы не храним его в открытом виде.
              </div>
            </div>
            <div className={s.status}>
              <LockKeyhole className="w-4 h-4" />
              Доступ
            </div>
          </div>

          {force && (
            <div className={s.notice}>
              Для продолжения работы нужно сменить пароль. Используйте новые данные — старый перестанет работать.
            </div>
          )}

          <form onSubmit={submit} className={s.form}>
            <div className={s.field}>
              <div className={s.labelRow}>
                <label className={s.label} htmlFor="current">
                  Текущий пароль
                </label>
                <span className={s.hint}>Временный или действующий</span>
              </div>
              <input
                id="current"
                type="password"
                className={s.input}
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                placeholder="Введите текущий пароль"
                required
              />
            </div>

            <div className={s.field}>
              <div className={s.labelRow}>
                <label className={s.label} htmlFor="next">
                  Новый пароль
                </label>
                <span className={s.hint}>Мин. 8 символов</span>
              </div>
              <input
                id="next"
                type="password"
                className={s.input}
                value={next}
                onChange={(e) => setNext(e.target.value)}
                placeholder="Придумайте новый пароль"
                required
                minLength={8}
              />
            </div>

            <div className={s.field}>
              <div className={s.labelRow}>
                <label className={s.label} htmlFor="confirm">
                  Подтверждение
                </label>
              </div>
              <input
                id="confirm"
                type="password"
                className={s.input}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Повторите новый пароль"
                required
                minLength={8}
              />
            </div>

            {msg && <div className={s.message}>{msg}</div>}

            <hr className={s.divider} />

            <div className={s.actions}>
              <Link href="/cabinet" className={s.ghostBtn}>
                Отмена
              </Link>
              <button type="submit" disabled={saving} className={s.primaryBtn}>
                <Save className="w-4 h-4" />
                {saving ? 'Сохраняем…' : 'Сменить пароль'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
