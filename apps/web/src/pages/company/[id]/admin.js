// pages/company/[id]/admin.js

import Link from 'next/link'
import s from '../../../styles/company.module.css'

export async function getServerSideProps({ req, params }) {
  const jwt = require('jsonwebtoken');
  const { Pool } = require('pg');

  const cookie = req.headers.cookie || ''
  const pair = cookie.split('; ').find(c => c.startsWith('gidkit_token='))
  if (!pair) return { redirect: { destination: '/login', permanent: false } }

  try {
    const token = decodeURIComponent(pair.split('=')[1])
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_me')

    const pool = new Pool({ connectionString: process.env.DATABASE_URL })
    const [cRes, rRes] = await Promise.all([
      pool.query('SELECT id, name FROM companies WHERE id=$1', [params.id]),
      pool.query(
        'SELECT role FROM user_company_roles WHERE user_id=$1 AND company_id=$2 LIMIT 1',
        [payload.sub, params.id]
      )
    ])
    await pool.end()

    if (!cRes.rows[0]) return { notFound: true }
    const company = cRes.rows[0]
    const role = rRes.rows[0]?.role || null

    // доступ сюда: admin / owner
    if (!(role === 'admin' || role === 'owner')) {
      return { redirect: { destination: `/company/${params.id}/manager`, permanent: false } }
    }

    return { props: { company, role } }
  } catch {
    return { redirect: { destination: '/login', permanent: false } }
  }
}

const roleLabel = (r) => {
  if (!r) return null;
  if (r === 'org_department' || r === 'manager') return 'manager';
  return r; // owner, admin, guide
};

export default function CompanyAdminPage({ company, role }) {
  const label = role === 'owner' ? 'owner' : 'admin'
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex flex-col">
      {/* тот же хедер */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/cabinet" className="text-sm text-slate-500 hover:text-slate-900">← Назад</Link>
          <div className="text-lg font-semibold text-slate-900 truncate">{company.name}</div>
          <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 border border-slate-200 text-slate-700 ${s.role}`}>
            {roleLabel(role)}
          </span>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-md mx-auto px-4 py-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-center">
            <div className="text-sm text-slate-500">Тестовый экран</div>
            <div className="text-2xl font-semibold mt-1">Ты {label}</div>
            <div className="text-slate-600 mt-2">Компания: {company.name}</div>
          </div>
        </div>
      </main>
    </div>
  )
}
