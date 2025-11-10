// pages/cabinet.js
import jwt from 'jsonwebtoken'
import { Pool } from 'pg'
import { useState } from 'react'
import Link from 'next/link'
import { Building2, User as UserIcon, Plus, Pencil, LogOut, KeyRound } from 'lucide-react'
import s from '../styles/cabinet.module.css'

// SSR: берём имя пользователя + его компании из JWT-cookie и БД
export async function getServerSideProps({ req }) {
  const cookie = req.headers.cookie || ''
  const pair = cookie.split('; ').find(c => c.startsWith('gidkit_token='))
  if (!pair) {
    return { redirect: { destination: '/login', permanent: false } }
  }

  try {
    const token = decodeURIComponent(pair.split('=')[1])
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_me')

    const pool = new Pool({ connectionString: process.env.DATABASE_URL })
    // Пользователь
    const { rows } = await pool.query(
      'SELECT id, first_name, last_name, email FROM users WHERE id=$1 LIMIT 1',
      [payload.sub]
    )
    if (!rows[0]) {
      await pool.end()
      return { redirect: { destination: '/login', permanent: false } }
    }
    const u = rows[0]
    const name = [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email || 'Пользователь'

    // Компании пользователя
    const cres = await pool.query(
      `SELECT c.id, c.name, c.logo_url
         FROM companies c
         JOIN user_company_roles ucr ON ucr.company_id = c.id
        WHERE ucr.user_id = $1
        ORDER BY c.created_at DESC NULLS LAST, c.name ASC`,
      [u.id]
    )

    await pool.end()

    return {
      props: {
        user: { name, email: u.email || '' },
        companies: cres.rows || []
      }
    }
  } catch (_e) {
    return { redirect: { destination: '/login', permanent: false } }
  }
}

export default function Cabinet({ user, companies = [] }) {
  const [tab, setTab] = useState('companies') // 'companies' | 'profile'

  // состояние для модалки "Добавить компанию"
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [file, setFile] = useState(null)
  const [list, setList] = useState(companies)

  async function handleLogout() {
    await fetch('/api/v1/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  async function createCompany(e) {
    e.preventDefault()
    if (!name.trim()) return
    const fd = new FormData()
    fd.append('name', name.trim())
    if (file) fd.append('logo', file)

    setSaving(true)
    try {
      // ВАЖНО: используем путь Next API /api/v1/companies/create
      const res = await fetch('/api/v1/companies/create', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Ошибка')
      // добавляем новую компанию в начало списка
      setList([data.company, ...list])
      // сбрасываем форму/закрываем
      setOpen(false)
      setName('')
      setFile(null)
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={`min-h-screen flex flex-col ${s.container}`}>
      {/* HEADER */}
      <header className={`sticky top-0 z-10 bg-white/80 border-b border-slate-200 ${s.header}`}>
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="text-sm text-slate-500">Кабинет</div>
          <div className={`text-lg font-semibold text-slate-900 truncate ${s.headerTitle}`}>{user?.name || 'Пользователь'}</div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
            type="button"
            title="Выйти">
            <LogOut className="w-4 h-4" />
            Выйти
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1">
        <div className="max-w-md mx-auto px-4 py-8">
          {tab === 'companies' ? (
            <>
              {/* СПИСОК КОМПАНИЙ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {list.map((c) => (
                  <div key={c.id} className="companie_name flex items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shrink-0">
                      {c.logo_url ? (
                        <img src={c.logo_url} alt={c.name} className="w-10 h-10 object-cover" />
                      ) : (
                        <div className="w-10 h-10 grid place-items-center text-slate-400 text-[10px]">LOGO</div>
                      )}
                    </div>
                    <div className="truncate font-medium text-slate-900">{c.name}</div>
                  </div>
                ))}
                {list.length === 0 && (
                  <div className="text-center text-sm text-slate-500">Пока нет компаний</div>
                )}
              </div>

              {/* КНОПКА ДОБАВИТЬ КОМПАНИЮ — НИЖЕ СПИСКА */}
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="w-full group active:scale-[.99] transition-transform"
              >
                <div className={`rounded-2xl border-2 border-slate-300 p-6 bg-white shadow-sm duration-200 ${s.addCard} ${s.fadeInUp}`}>
                  <div className="flex items-center justify-center gap-3">
                    <div className={s.addCardIcon}>
                      <Plus className="w-6 h-6" />
                    </div>
                    <span className={`text-lg text-slate-900 ${s.addCardTitle}`}>Добавить компанию</span>
                  </div>
                  <p className="text-center text-sm text-slate-500 mt-3">
                    Загрузите логотип (по желанию) и введите название
                  </p>
                </div>
              </button>
            </>
          ) : (
            <div className="space-y-4">
              {/* Карточка: профиль */}
              <div className={`p-5 rounded-2xl ${s.card}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="user-icon p-2 rounded-xl border border-slate-200 bg-slate-50">
                    <UserIcon className="user-icon w-5 h-5" />
                  </div>
                  <div className="font-medium text-slate-900">Профиль</div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Имя</span>
                    <span className="text-slate-900 font-medium truncate max-w-[60%] text-right">{user?.name}</span>
                  </div>
                  {user?.email ? (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Email</span>
                      <span className="text-slate-900 truncate max-w-[60%] text-right">{user.email}</span>
                    </div>
                  ) : null}
                </div>

                <div className="mt-4 flex flex-wrap gap-2 justify-end">
                  <Link href="/profile/edit" className={s.btnGhost}>
                    <Pencil className="w-4 h-4" />
                    <span className="text-sm font-medium text-slate-800">Изменить данные</span>
                  </Link>
                  <Link href="/profile/password" className={s.btnGhost}>
                    <KeyRound className="w-4 h-4" />
                    <span className="text-sm font-medium text-slate-800">Изменить пароль</span>
                  </Link>
                </div>
              </div>

              {/* (Опционально) */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-sm text-slate-600">
                  Здесь позже появятся настройки уведомлений, смена пароля и т.д.
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* МОДАЛЬНОЕ ОКНО — Добавить компанию */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center px-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-xl p-5">
            <div className="text-lg font-semibold text-slate-900 text-center">Новая компания</div>
            <form onSubmit={createCompany} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Логотип (опционально)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Название компании</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
                  placeholder="Avangard Travel"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200">
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:opacity-95 active:scale-[.99]"
                >
                  {saving ? 'Сохраняем…' : 'Сохранить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}
      <nav className="sticky bottom-0 bg-white border-t border-slate-200">
        <div className="max-w-md mx-auto grid grid-cols-2">
          <button
            type="button"
            onClick={() => setTab('companies')}
            className={`flex flex-col items-center ${s.navItem} ${tab === 'companies' ? s.navItemActive : ''}`}
          >
            <Building2 className="h-6 w-6" />
            <span className="text-xs mt-1">Компании</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('profile')}
            className={`flex flex-col items-center ${s.navItem} ${tab === 'profile' ? s.navItemActive : ''}`}
          >
            <UserIcon className="h-6 w-6" />
            <span className="text-xs mt-1">Личный кабинет</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
