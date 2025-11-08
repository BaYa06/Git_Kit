// pages/cabinet.js
import jwt from 'jsonwebtoken'
import { Pool } from 'pg'
import { useState } from 'react'
import Link from 'next/link'
import { Building2, User as UserIcon, Plus, Pencil, LogOut, KeyRound } from 'lucide-react'
import s from '../styles/cabinet.module.css'

// SSR: берём имя пользователя из JWT-cookie и БД
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
    const { rows } = await pool.query(
      'SELECT id, first_name, last_name, email FROM users WHERE id=$1 LIMIT 1',
      [payload.sub]
    )
    await pool.end()

    if (!rows[0]) {
      return { redirect: { destination: '/login', permanent: false } }
    }

    const u = rows[0]
    const name = [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email || 'Пользователь'

    return { props: { user: { name, email: u.email || '' } } }
  } catch (_e) {
    return { redirect: { destination: '/login', permanent: false } }
  }
}

export default function Cabinet({ user }) {
  const [tab, setTab] = useState('companies') // 'companies' | 'profile'
    async function handleLogout() {
        await fetch('/api/v1/auth/logout', { method: 'POST' })
        window.location.href = '/login'
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
            <button type="button" className="w-full group active:scale-[.99] transition-transform">
              <div className={`rounded-2xl border-2 border-slate-300 p-6 bg-white shadow-sm duration-200 ${s.addCard} ${s.fadeInUp}`}>
                <div className="flex items-center justify-center gap-3">
                  <div className={s.addCardIcon}>
                    <Plus className="w-6 h-6" />
                  </div>
                  <span className={`text-lg text-slate-900 ${s.addCardTitle}`}>Добавить компанию</span>
                </div>
                <p className="text-center text-sm text-slate-500 mt-3">
                  Создайте свою первую компанию и начните работать.
                </p>
              </div>
            </button>
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

              {/* (Опционально) ещё одна карточка под будущие настройки */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-sm text-slate-600">
                  Здесь позже появятся настройки уведомлений, смена пароля и т.д.
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* BOTTOM NAV */}
      <nav className="sticky bottom-0 bg-white border-t border-slate-200">
        <div className="max-w-md mx-auto grid grid-cols-2">
          <button type="button" onClick={() => setTab('companies')} className={`flex flex-col items-center ${s.navItem} ${tab === 'companies' ? s.navItemActive : ''}`}>
            <Building2 className="h-6 w-6" />
            <span className="text-xs mt-1">Компании</span>
          </button>

          <button type="button" onClick={() => setTab('profile')} className={`flex flex-col items-center ${s.navItem} ${tab === 'profile' ? s.navItemActive : ''}`}>
            <UserIcon className="h-6 w-6" />
            <span className="text-xs mt-1">Личный кабинет</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
