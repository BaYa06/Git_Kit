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
      'SELECT id, first_name, last_name, email, phone, must_change_password FROM users WHERE id=$1 LIMIT 1',
      [payload.sub]
    )

    if (!rows[0]) {
      await pool.end()
      return { redirect: { destination: '/login', permanent: false } }
    }
    const u = rows[0]

    // если нужно обязательно сменить пароль — отправляем на страницу смены
    if (u.must_change_password === true) {
      return { redirect: { destination: '/profile/password?force=1', permanent: false } }
    }

    const name =
      [u.first_name, u.last_name].filter(Boolean).join(' ') ||
      u.email ||
      'Пользователь'

    // Компании пользователя + роль в компании
    const cres = await pool.query(
      `SELECT c.id,
              c.name,
              c.logo_url,
              ucr.role
         FROM companies c
         JOIN user_company_roles ucr ON ucr.company_id = c.id
        WHERE ucr.user_id = $1
        ORDER BY c.created_at DESC NULLS LAST, c.name ASC`,
      [u.id]
    )

    await pool.end()

    return {
      props: {
        user: {
          id: u.id,
          name,
          first_name: u.first_name || '',
          last_name: u.last_name || '',
          email: u.email || '',
          phone: u.phone || ''
        },
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
  const [mode, setMode] = useState('create') // 'create' | 'find'
  const [inviteLogin, setInviteLogin] = useState('')
  const [invitePassword, setInvitePassword] = useState('')

  function renderRole(role) {
    switch (role) {
      case 'owner':
        return 'Владелец'
      case 'admin':
        return 'Админ'
      case 'coordinator':
        return 'Координатор'
      case 'guide':
        return 'Гид'
      case 'readonly':
        return 'Только просмотр'
      default:
        return role
    }
  }



  async function handleLogout() {
    await fetch('/api/v1/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

    async function createCompany() {
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
      setList((prev) => [data.company, ...(prev || [])])
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

  async function joinCompany() {
    if (!inviteLogin.trim() || !invitePassword.trim()) return

    setSaving(true)
    try {
      const res = await fetch('/api/v1/companies/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login: inviteLogin.trim(),
          password: invitePassword,
        }),
      })
      let data = {}
      try {
        data = await res.json()
      } catch {
        data = {}
      }
      if (!res.ok) {
        throw new Error(data.message || 'Такой пользователь не найден')
      }
      if (Array.isArray(data.companies)) {
        // API вернул полный список компаний пользователя
        setList(data.companies)
      } else if (data.company) {
        // запасной вариант — если вернётся одна компания
        setList((prev) => [data.company, ...(prev || [])])
      }
      setOpen(false)
      setInviteLogin('')
      setInvitePassword('')
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleModalSubmit(e) {
    e.preventDefault()
    if (mode === 'create') {
      await createCompany()
    } else {
      await joinCompany()
    }
  }


  return (
        <div className={s.container}>
          {/* HEADER */}
          <header className={s.header}>
            <div className={s.headerInner}>
              <div className={s.headerCaption}>Кабинет</div>
              <div className={s.headerTitle}>
                {user?.name || 'Пользователь'}
              </div>
              <button
                onClick={handleLogout}
                className={s.logoutBtn}
                type="button"
                title="Выйти"
              >
                <LogOut className="w-4 h-4" />
                Выйти
              </button>
            </div>
          </header>

          {/* MAIN */}
          <main className={s.main}>
            <div className={s.mainInner}>
          {tab === 'companies' ? (
            <>
              {/* СПИСОК КОМПАНИЙ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {list.map((c) => (
                  <Link
                    href={`/company/${c.id}`}
                    key={c.id}
                    className={`flex items-center gap-3 ${s.companyCard}`}
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-700 bg-slate-800/80 shrink-0">
                      {c.logo_url ? (
                        <img src={c.logo_url} alt={c.name} className="w-10 h-10 object-cover" />
                      ) : (
                        <div className="w-10 h-10 grid place-items-center text-slate-400 text-[10px]">
                          LOGO
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-slate-50">{c.name}</div>
                      {c.role && (
                        <div className="mt-0.5 text-xs text-slate-400">
                          {renderRole(c.role)}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
                {list.length === 0 && (
                  <div className="text-center text-sm text-slate-500">Пока нет компаний</div>
                )}
              </div>

              {/* КНОПКА ДОБАВИТЬ КОМПАНИЮ — НИЖЕ СПИСКА */}
              <button
                type="button"
                onClick={() => {
                  setMode('create')
                  setName('')
                  setFile(null)
                  setInviteLogin('')
                  setInvitePassword('')
                  setOpen(true)
                }}
                className="w-full group active:scale-[.99] transition-transform"
              >
                <div className={`${s.addCard} ${s.fadeInUp}`}>
                  <div className="flex items-center justify-center gap-3">
                    <div className={s.addCardIcon}>
                      <Plus className="w-6 h-6" />
                    </div>
                    <span className={s.addCardTitle}>Добавить компанию</span>
                  </div>
                  <p className="text-center text-sm text-slate-400 mt-3">
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
                  <div className={`user-icon p-2 rounded-xl border border-slate-200 ${s.background_icon}`}>
                    <UserIcon className="user-icon w-5 h-5" />
                  </div>
                  <div className="font-medium text-slate-50">Профиль</div>
                </div>
                <div className="space-y-2 text-sm">
                  {user?.first_name && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Имя</span>
                      <span className="text-slate-400 font-medium truncate max-w-[60%] text-right">
                        {user.first_name}
                      </span>
                    </div>
                  )}
                  {user?.last_name && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Фамилия</span>
                      <span className="text-slate-400 truncate max-w-[60%] text-right">
                        {user.last_name}
                      </span>
                    </div>
                  )}
                  {user?.email && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Email</span>
                      <span className="text-slate-400 truncate max-w-[60%] text-right">
                        {user.email}
                      </span>
                    </div>
                  )}
                  {user?.phone && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Телефон</span>
                      <span className="text-slate-400 truncate max-w-[60%] text-right">
                        {user.phone}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2 justify-end">
                  <Link href="/profile/edit" className={s.btnGhost}>
                    <Pencil className="w-4 h-4" />
                    <span className="text-sm font-medium text-slate-300">
                      Изменить данные
                    </span>
                  </Link>
                  <Link href="/profile/password" className={s.btnGhost}>
                    <KeyRound className="w-4 h-4" />
                    <span className="text-sm font-medium text-slate-300">
                      Изменить пароль
                    </span>
                  </Link>
                </div>
              </div>


              {/* (Опционально) */}
              <div className={s.card}>
                <div className="text-sm text-slate-300">
                  Здесь позже появятся настройки уведомлений, смена пароля и т.д.
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* МОДАЛЬНОЕ ОКНО — Добавить компанию */}
      {open && (
        <div className={s.modalOverlay}>
          <div className={s.modal}>
            <div className={s.modalTitle}>Добавить компанию</div>
            {/* Табы: Создать / Найти */}
              <div className={s.modalTabs}>
              <button
                type="button"
                onClick={() => setMode('create')}
                className={`${s.modalTab} ${mode === 'create' ? s.modalTabActive : ''}`}
              >
                Создать
              </button>
              <button
                type="button"
                onClick={() => setMode('find')}
                className={`${s.modalTab} ${mode === 'find' ? s.modalTabActive : ''}`}
              >
                Найти
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="mt-4 space-y-4">
              {mode === 'create' ? (
                <>
                  <div>
                    <label className="block text-sm text-slate-300 mb-1">Логотип (опционально)</label>
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
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Логин</label>
                    <input
                      value={inviteLogin}
                      onChange={(e) => setInviteLogin(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2"
                      placeholder="Логин из доступа"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Пароль</label>
                    <input
                      type="password"
                      value={invitePassword}
                      onChange={(e) => setInvitePassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2"
                      placeholder="Пароль из доступа"
                      required
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Введите логин и пароль, которые вам выдал владелец компании. Если данные верны, компания добавится в список.
                  </p>
                </>
              )}

              <div className={s.modalActions}>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className={s.btnSecondary}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={s.btnPrimary}
                >
                  {saving
                    ? mode === 'create'
                      ? 'Сохраняем…'
                      : 'Подключаем…'
                    : mode === 'create'
                    ? 'Сохранить'
                    : 'Подключить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}
      <nav className={s.bottomNav}>
        <div className={s.bottomNavInner}>
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
