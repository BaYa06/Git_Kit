// pages/company/[id].js
import { useEffect, useState } from 'react'
import Link from 'next/link'
import s from '../../styles/company.module.css'
import o from '../../styles/owner.module.css'
import { Info, Users2 } from 'lucide-react';

export async function getServerSideProps({ req, params }) {
  const jwt = require('jsonwebtoken')
  const { Pool } = require('pg')

  const cookie = req.headers.cookie || ''
  const pair = cookie.split('; ').find(c => c.startsWith('gidkit_token='))
  if (!pair) return { redirect: { destination: '/login', permanent: false } }

  try {
    const token = decodeURIComponent(pair.split('=')[1])
    const payload = require('jsonwebtoken').verify(
      token,
      process.env.JWT_SECRET || 'dev_secret_change_me'
    )

    const { Pool } = require('pg')
    const pool = new Pool({ connectionString: process.env.DATABASE_URL })

    const [cRes, rRes] = await Promise.all([
      pool.query('SELECT id, name, logo_url FROM companies WHERE id=$1', [params.id]),
      pool.query(
        'SELECT role FROM user_company_roles WHERE user_id=$1 AND company_id=$2 LIMIT 1',
        [payload.sub, params.id]
      )
    ])
    await pool.end()

    if (!cRes.rows[0]) return { notFound: true }
    const company = cRes.rows[0]
    const role = rRes.rows[0]?.role || null

    // owner — остаётся на этой странице (ничего не меняем)
    if (role && role !== 'owner') {
      const dest =
        role === 'admin'
          ? `/company/${params.id}/admin`
          : (role === 'manager' || role === 'org_department')
          ? `/company/${params.id}/manager`
          : role === 'guide'
          ? `/company/${params.id}/guide`
          : `/company/${params.id}/manager`
      return { redirect: { destination: dest, permanent: false } }
    }

    return { props: { company } }
  } catch {
    return { redirect: { destination: '/login', permanent: false } }
  }
}

export default function CompanyPage({ company }) {
  const [tab, setTab] = useState('info') // 'info' | 'staff'
  const [lists, setLists] = useState({ admins: [], managers: [], guides: [] })
  const [open, setOpen] = useState(false)
  const [role, setRole] = useState('admin')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [issued, setIssued] = useState(null) // { username, tempPassword } | null

  const roleLabel = (r) => {
    if (!r) return null;
    if (r === 'org_department' || r === 'manager') return 'manager';
    return r; // owner, admin, guide
  };


  useEffect(() => {
    if (tab === 'staff') {
      fetch(`/api/v1/company/users/list?company_id=${company.id}`)
        .then(r => r.json())
        .then(data => setLists(data))
        .catch(() => setLists({ admins: [], managers: [], guides: [] }))
    }
  }, [tab, company.id])

  async function createEmployee(e) {
    e.preventDefault()
    setSaving(true)
    setIssued(null)
    try {
      const res = await fetch('../api/v1/company/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: company.id,
          role: role === 'admin' ? 'admin' : role === 'manager' ? 'manager' : 'guide',
        }),
      })
      let data = {}
      try { data = await res.json() } catch {}
      if (!res.ok) {
        const extra = [data.code, data.column, data.table].filter(Boolean).join(' • ')
        throw new Error(
          data.message
            ? `${data.message}${extra ? ` (${extra})` : ''}`
            : `Ошибка ${res.status}`,
        )
      }

      // перечитать списки сотрудников
      const r = await fetch(`/api/v1/company/users/list?company_id=${company.id}`)
      const l = await r.json()
      setLists(l)

      // показать листок выдачи (логин/пароль одноразового доступа)
      if (data.credentials) {
        setIssued(data.credentials) // { username, tempPassword }
      } else {
        setOpen(false)
      }

      // сброс локального состояния (пусть остаётся, даже если поля уберём)
      setFullName('')
      setEmail('')
      setPhone('')
      setRole('manager')
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }


  return (
    <div className={`min-h-screen bg-gradient-to-b from-white to-slate-50 flex flex-col ${s.companyPage}`}>
      {/* HEADER */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/cabinet" className="text-sm text-slate-500 hover:text-slate-900">← Назад</Link>

          <div className="text-lg font-semibold text-slate-900 truncate">{company.name}</div>
           <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 border border-slate-200 text-slate-700 ${s.role}`}>
                owner
              </span>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1">
        <div className="max-w-md mx-auto px-4 py-6">
          {tab === 'info' ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm text-slate-600">Инфо — пока пусто. Добавим позже.</div>
            </div>
          ) : (
           <div className={`space-y-4 ${s['company-page']}`}>
              {/* Кнопка "Добавить сотрудника" (как у "Добавить компанию") */}
              <button type="button" onClick={() => setOpen(true)} className="w-full group active:scale-[.99] transition-transform">
                <div className="rounded-2xl border-2 border-dashed border-slate-300 p-6 bg-white shadow-sm group-hover:shadow-md duration-200">
                  <div className="flex items-center justify-center gap-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xl">＋</span>
                    <span className="text-lg font-medium text-slate-900">Добавить сотрудника</span>
                  </div>
                  <p className="text-center text-sm text-slate-500 mt-3">Выберите роль и заполните данные</p>
                </div>
              </button>

              {/* Админы */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="font-medium text-slate-900 mb-3">Админы</div>
                <ul className="space-y-2">
                  {lists.admins.map(p => (
                    <li key={p.id} className="flex items-center justify-between text-sm">
                      <span className="truncate">{p.name}</span>
                      <span className="text-slate-500 truncate max-w-[50%] text-right">{p.email || p.username}</span>
                    </li>
                  ))}
                  {lists.admins.length === 0 && <li className="text-sm text-slate-500">Пока нет</li>}
                </ul>
              </div>

              {/* Менеджеры */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="font-medium text-slate-900 mb-3">Менеджеры</div>
                <ul className="space-y-2">
                  {lists.managers.map(p => (
                    <li key={p.id} className="flex items-center justify-between text-sm">
                      <span className="truncate">{p.name}</span>
                      <span className="text-slate-500 truncate max-w-[50%] text-right">{p.email || p.username}</span>
                    </li>
                  ))}
                  {lists.managers.length === 0 && <li className="text-sm text-slate-500">Пока нет</li>}
                </ul>
              </div>

              {/* Гиды */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="font-medium text-slate-900 mb-3">Гиды</div>
                <ul className="space-y-2">
                  {lists.guides.map(p => (
                    <li key={p.id} className="flex items-center justify-between text-sm">
                      <span className="truncate">{p.name}</span>
                      <span className="text-slate-500 truncate max-w-[50%] text-right">{p.email || p.username}</span>
                    </li>
                  ))}
                  {lists.guides.length === 0 && <li className="text-sm text-slate-500">Пока нет</li>}
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* МОДАЛКА: Добавить сотрудника */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center px-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-xl p-5">
            {issued === null ? (
              <>
                <div className="text-lg font-semibold text-slate-900 text-center">Новый сотрудник</div>
                <form onSubmit={createEmployee} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Роль</label>
                    <select
                      value={role}
                      onChange={e => setRole(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2"
                    >
                      <option value="admin">Админ</option>
                      <option value="manager">Менеджер</option>
                      <option value="guide">Гид</option>
                    </select>
                  </div>

                  <p className="text-xs text-slate-500">
                    После нажатия <span className="font-medium">«Сохранить»</span> будет сгенерирован
                    одноразовый логин и пароль. Передайте их сотруднику. Он должен:
                    сначала зарегистрироваться на сайте, затем в кабинете нажать
                    «Добавить компанию» → «Найти» и ввести этот логин и пароль.
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false)
                        setIssued(null)
                        setRole('manager')
                      }}
                      className="px-4 py-2 rounded-xl border border-slate-200"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:opacity-95 active:scale-[.99]"
                    >
                      {saving ? 'Создаём…' : 'Сохранить'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              // Листок выдачи доступа — показываем 1 раз
              <div>
                <div className="text-lg font-semibold text-slate-900 text-center">Доступ создан</div>
                <div className={`mt-4 space-y-3 text-sm ${s['company-page']}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Логин</span>
                    <span className="font-mono">{issued.username}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Временный пароль</span>
                    <span className="font-mono">{issued.tempPassword}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Перешлите эти данные сотруднику. При первом входе он изменит пароль.
                  </div>
                </div>
                <div className="mt-5 flex justify-end">
                  <button onClick={() => { setIssued(null); setOpen(false); }} className="px-4 py-2 rounded-xl bg-slate-900 text-white">
                    Готово
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}
      <nav className="sticky bottom-0 bg-white border-t border-slate-200">
        <div className="max-w-md mx-auto grid grid-cols-2">
          <button
            type="button"
            onClick={() => setTab('info')}
            className={`flex flex-col items-center py-2 ${s?.navItem || ''} ${tab === 'info' ? (s?.navItemActive || '') : ''}`}
          >
            <Info className="h-6 w-6" />
            <span className="text-xs mt-1">Инфо</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('staff')}
            className={`flex flex-col items-center py-2 ${s?.navItem || ''} ${tab === 'staff' ? (s?.navItemActive || '') : ''}`}
          >
            <Users2 className="h-6 w-6" />
            <span className="text-xs mt-1">Сотрудники</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
