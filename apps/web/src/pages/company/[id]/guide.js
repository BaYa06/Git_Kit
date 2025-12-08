// pages/company/[id]/guide.js

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Map, CalendarDays, User2 } from 'lucide-react'
import GuideTours from '../../../components/company/guide/Tours'
import GuideTable from '../../../components/company/guide/Table'
import GuideProfile from '../../../components/company/guide/Profile'
import { NewTourFromTemplateScreen } from '../../../components/company/admin/ToursTab'
import s from '../../../styles/guide.module.css'

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
    const formatDate = (value) => {
      if (!value) return null
      const d = value instanceof Date ? value : new Date(value)
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, "0")
      const day = String(d.getDate()).padStart(2, "0")
      return `${y}-${m}-${day}`
    }

    const [cRes, rRes, userRes] = await Promise.all([
      pool.query('SELECT id, name FROM companies WHERE id=$1', [params.id]),
      pool.query(
        'SELECT role FROM user_company_roles WHERE user_id=$1 AND company_id=$2 LIMIT 1',
        [payload.sub, params.id]
      ),
      pool.query(
        'SELECT id, email, phone, first_name, last_name FROM users WHERE id=$1 LIMIT 1',
        [payload.sub]
      )
    ])

    if (!cRes.rows[0]) return { notFound: true }
    const company = cRes.rows[0]
    const role = rRes.rows[0]?.role || null

    if (role !== 'guide') {
      return { redirect: { destination: `/company/${params.id}/manager`, permanent: false } }
    }

    const user = userRes.rows[0] || {}
    const guidesRes = await pool.query(
      `SELECT id
       FROM guides
       WHERE company_id = $1
         AND (
           (email IS NOT NULL AND email = $2)
           OR (phone IS NOT NULL AND phone = $3)
         )
       LIMIT 1`,
      [params.id, user.email || null, user.phone || null]
    )
    const guideId = guidesRes.rows[0]?.id || null

    let toursRows = []
    if (guideId) {
      const toursRes = await pool.query(
        `
        SELECT
          t.id,
          t.name,
          t.status,
          t.start_date,
          t.end_date,
          t.tourists_count,
          COALESCE(tg.total_guests, 0) AS tourists_signed,
          t.created_at,
          g.full_name AS main_guide_name,
          gc.guide_names,
          CASE
            WHEN COALESCE(tc_meta.total_components, 0) = 0 THEN 'planned'
            WHEN COALESCE(tc_meta.filled_components, 0) = COALESCE(tc_meta.total_components, 0)
              THEN 'confirmed'
            ELSE 'planned'
          END AS computed_status
        FROM tours t
        LEFT JOIN guides g ON g.id = t.main_guide_id
        LEFT JOIN LATERAL (
          SELECT array_agg(g2.full_name ORDER BY g2.full_name) AS guide_names
          FROM tour_components tc
          JOIN guides g2 ON g2.id = tc.guide_id
          WHERE tc.tour_id = t.id
            AND tc.type = 'guide'
            AND tc.guide_id IS NOT NULL
        ) gc ON TRUE
        LEFT JOIN LATERAL (
          SELECT COUNT(*) AS total_guests
          FROM tour_guests tg
          WHERE tg.tour_id = t.id
        ) tg ON TRUE
        LEFT JOIN LATERAL (
          SELECT
            COUNT(*) AS total_components,
            COUNT(*) FILTER (
              WHERE tc.guide_id IS NOT NULL
                 OR tc.hotel_id IS NOT NULL
                 OR tc.driver_id IS NOT NULL
                 OR tc.custom IS NOT NULL
            ) AS filled_components
          FROM tour_components tc
          WHERE tc.tour_id = t.id
        ) tc_meta ON TRUE
        WHERE t.company_id = $1
          AND (
            t.main_guide_id = $2
            OR EXISTS (
              SELECT 1 FROM tour_components tc2
              WHERE tc2.tour_id = t.id
                AND tc2.type = 'guide'
                AND tc2.guide_id = $2
            )
          )
        ORDER BY t.start_date DESC NULLS LAST, t.created_at DESC
        `,
        [params.id, guideId]
      )
      toursRows = toursRes.rows || []
    }

    const [guidesListRes, hotelsRes, driversRes] = await Promise.all([
      pool.query(
        `
        SELECT
          id,
          full_name,
          phone,
          email,
          languages,
          notes
        FROM guides
        WHERE company_id = $1
        ORDER BY full_name NULLS LAST
        `,
        [params.id]
      ),
      pool.query(
        `
        SELECT
          id,
          name,
          stars,
          phone,
          meal_plan,
          address,
          checkin_from,
          checkout_until
        FROM hotels
        WHERE company_id = $1
        ORDER BY name
        `,
        [params.id]
      ),
      pool.query(
        `
        SELECT
          id,
          company_id,
          full_name,
          phone,
          car_name,
          plate_number,
          seats,
          is_active,
          notes
        FROM drivers
        WHERE company_id = $1
        ORDER BY full_name
        `,
        [params.id]
      ),
    ])

    const tours = (toursRows || []).map((row) => ({
      id: row.id,
      name: row.name,
      start_date: formatDate(row.start_date),
      end_date: formatDate(row.end_date),
      tourists_count: row.tourists_count,
      tourists_signed: Number(row.tourists_signed) || 0,
      guide_names: Array.isArray(row.guide_names) ? row.guide_names : [],
      main_guide_name: row.main_guide_name || "",
      status:
        row.computed_status ||
        (row.status === "confirmed" || row.status === "active"
          ? "confirmed"
          : "planned"),
    }))

    const guides = (guidesListRes.rows || []).map((row) => ({
      id: row.id,
      full_name: row.full_name || "Без имени",
      phone: row.phone || "",
      email: row.email || "",
      languages: Array.isArray(row.languages) ? row.languages : null,
      notes: row.notes || "",
    }))

    const hotels = (hotelsRes.rows || []).map((row) => ({
      id: row.id,
      name: row.name,
      stars: row.stars || 0,
      phone: row.phone || "",
      meal_plan: row.meal_plan || "",
      address: row.address || "",
      checkin_from: row.checkin_from || null,
      checkout_until: row.checkout_until || null,
    }))

    const drivers = (driversRes.rows || []).map((row) => ({
      id: row.id,
      full_name: row.full_name,
      phone: row.phone,
      car_name: row.car_name,
      plate_number: row.plate_number,
      seats: row.seats,
      notes: row.notes || "",
    }))

    await pool.end()
    return { props: { company, tours, guides, hotels, drivers } }
  } catch {
    return { redirect: { destination: '/login', permanent: false } }
  }
}

export default function CompanyGuidePage({ company, tours = [], guides = [], hotels = [], drivers = [] }) {
  const [tab, setTab] = useState('tours')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingTourId, setEditingTourId] = useState(null)
  const [editingTourName, setEditingTourName] = useState('')

  const handleOpenTour = (tour) => {
    if (!tour || !tour.id) return
    setEditingTourId(tour.id)
    setEditingTourName(tour.name || 'Тур')
    setEditorOpen(true)
  }

  return (
    <div className={s.container}>
      <header className={s.header}>
        <div className={s.headerInner}>
          <Link href="/cabinet" className={s.back}>
            <ArrowLeft className="w-4 h-4" />
            Назад
          </Link>
          <div className={s.title}>{company.name}</div>
          <span className={s.badge}>guide</span>
        </div>
      </header>

      <main className={s.main}>
        <div className={s.mainInner}>
          {tab === 'tours' && <GuideTours tours={tours} onOpenTour={handleOpenTour} />}
          {tab === 'schedule' && <GuideTable />}
          {tab === 'profile' && <GuideProfile company={company} />}
        </div>
      </main>

      <nav className={s.bottomNav}>
        <div className={s.bottomNavInner}>
          <button
            type="button"
            onClick={() => setTab('tours')}
            className={`${s.navItem} ${tab === 'tours' ? s.navItemActive : ''}`}
          >
            <Map className={s.navIcon} />
            <span>Мои туры</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('schedule')}
            className={`${s.navItem} ${tab === 'schedule' ? s.navItemActive : ''}`}
          >
            <CalendarDays className={s.navIcon} />
            <span>Расписание</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('profile')}
            className={`${s.navItem} ${tab === 'profile' ? s.navItemActive : ''}`}
          >
            <User2 className={s.navIcon} />
            <span>Профиль</span>
          </button>
        </div>
      </nav>

      <NewTourFromTemplateScreen
        open={editorOpen}
        templateId={null}
        companyId={company.id}
        guides={guides}
        hotels={hotels}
        drivers={drivers}
        mode="edit"
        tourId={editingTourId}
        editTitleOverride={editingTourName}
        guideView
        onCreated={() => window.location.reload()}
        onClose={() => {
          setEditorOpen(false)
          setEditingTourId(null)
          setEditingTourName('')
        }}
      />
    </div>
  )
}
