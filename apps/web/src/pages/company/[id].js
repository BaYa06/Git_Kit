// pages/company/[id].js
import { useEffect, useState } from 'react'
import jwt from 'jsonwebtoken'
import { Pool } from 'pg'
import Link from 'next/link'

export async function getServerSideProps({ req, params }) {
  const cookie = req.headers.cookie || ''
  const p = cookie.split('; ').find(c => c.startsWith('gidkit_token='))
  if (!p) return { redirect: { destination: '/login', permanent: false } }

  try {
    const token = decodeURIComponent(p.split('=')[1])
    jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_me')

    const pool = new Pool({ connectionString: process.env.DATABASE_URL })
    const c = await pool.query(`SELECT id, name, logo_url FROM companies WHERE id = $1`, [params.id])
    await pool.end()

    if (!c.rows[0]) return { notFound: true }

    return { props: { company: c.rows[0] } }
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
          full_name: fullName,
          email: email || undefined,
          phone: phone || undefined
        })
      })
      let data = {}
        try { data = await res.json() } catch {}
        if (!res.ok) {
        const extra = [data.code, data.column, data.table].filter(Boolean).join(' • ')
        throw new Error(data.message ? `${data.message}${extra ? ` (${extra})` : ''}` : `Ошибка ${res.status}`)
      }

      // перечитать списки
      const r = await fetch(`/api/v1/company/users/list?company_id=${company.id}`)
      const l = await r.json()
      setLists(l)

      // показать листок выдачи, если user новый
      if (data.credentials) {
        setIssued(data.credentials) // { username, tempPassword }
      } else {
        setOpen(false)
      }

      // сброс формы
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
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex flex-col">
      {/* HEADER */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/cabinet" className="text-sm text-slate-500 hover:text-slate-900">← Назад</Link>
          <div className="text-lg font-semibold text-slate-900 truncate">{company.name}</div>
          <div className="w-6" />
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
            <div className="space-y-4">
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
            {!issued ? (
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

                  <div>
                    <label className="block text-sm text-slate-600 mb-1">ФИО</label>
                    <input
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2"
                      placeholder="Имя Фамилия"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Email (опц.)</label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2"
                        placeholder="user@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">Телефон (опц.)</label>
                      <input
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2"
                        placeholder="+996 ..."
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200">
                      Отмена
                    </button>
                    <button type="submit" disabled={saving} className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:opacity-95 active:scale-[.99]">
                      {saving ? 'Создаём…' : 'Сохранить'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              // Листок выдачи доступа — показываем 1 раз
              <div>
                <div className="text-lg font-semibold text-slate-900 text-center">Доступ создан</div>
                <div className="mt-4 space-y-3 text-sm">
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
          <button type="button" onClick={() => setTab('info')}
            className={`flex flex-col items-center py-2.5 ${tab === 'info' ? 'text-slate-900' : 'text-slate-600'}`}>
            <span className="text-xs mt-1">Инфо</span>
          </button>
          <button type="button" onClick={() => setTab('staff')}
            className={`flex flex-col items-center py-2.5 ${tab === 'staff' ? 'text-slate-900' : 'text-slate-600'}`}>
            <span className="text-xs mt-1">Сотрудники</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
