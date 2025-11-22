// pages/company/[id]/admin.js

import { useState } from "react";
import Link from "next/link";
import s from "../../../styles/admin.module.css";
import {
  Flag,
  Hotel,
  Users,
  Orbit,
  CircleCheck,
  CirclePause,
  LayoutDashboard,
  Map,
  Database,
  Files,
  Plus,
  Search,
  MoreVertical,
} from "lucide-react";
import DashboardTab from "../../../components/company/admin/DashboardTab";
import ToursTab from "../../../components/company/admin/ToursTab";
import BaseTab from "../../../components/company/admin/BaseTab";
import TemplatesTab from "../../../components/company/admin/TemplatesTab";



export async function getServerSideProps({ req, params }) {
  const jwt = require("jsonwebtoken");
  const { Pool } = require("pg");

  const cookie = req.headers.cookie || "";
  const pair = cookie.split("; ").find((c) => c.startsWith("gidkit_token="));
  if (!pair) {
    return { redirect: { destination: "/login", permanent: false } };
  }

  try {
    const token = decodeURIComponent(pair.split("=")[1]);
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "dev_secret_change_me"
    );

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    const [companyRes, roleRes, guidesRes] = await Promise.all([
      // сама компания
      pool.query("SELECT id, name FROM companies WHERE id = $1", [params.id]),

      // твоя роль в этой компании
      pool.query(
        "SELECT role FROM user_company_roles WHERE user_id = $1 AND company_id = $2 LIMIT 1",
        [payload.sub, params.id]
      ),

      // все пользователи с ролью guide для этой компании
      pool.query(
        `
        SELECT
          u.id,
          u.first_name,
          u.last_name,
          u.phone,
          u.email
        FROM user_company_roles ucr
        JOIN users u ON u.id = ucr.user_id
        WHERE ucr.company_id = $1
          AND ucr.role = 'guide'
        ORDER BY
          u.first_name NULLS LAST,
          u.last_name NULLS LAST
        `,
        [params.id]
      ),
    ]);

    await pool.end();

    if (!companyRes.rows[0]) {
      return { notFound: true };
    }

    const company = companyRes.rows[0];
    const role = roleRes.rows[0]?.role || null;

    // мапим строки из БД в формат для BaseTab (guides)
    const guides = (guidesRes.rows || []).map((row) => ({
      id: row.id,
      full_name:
        [row.first_name, row.last_name].filter(Boolean).join(" ") ||
        row.email ||
        "Без имени",
      phone: row.phone || "",
      email: row.email || "",
      languages: null, // нет отдельного поля — пусть BaseTab покажет "-"
    }));

    // доступ к этой странице только owner/admin
    if (!(role === "owner" || role === "admin")) {
      return {
        redirect: {
          destination: `/company/${params.id}/manager`,
          permanent: false,
        },
      };
    }

    return {
      props: {
        company,
        role,
        guides,
      },
    };
  } catch (e) {
    console.error("admin getServerSideProps error:", e);
    return { redirect: { destination: "/login", permanent: false } };
  }
}


const roleLabel = (r) => {
  if (!r) return null;
  if (r === "org_department" || r === "manager") return "manager";
  return r; // owner, admin, guide
};

export default function CompanyAdminPage({ company, role, guides }) {
  const [tab, setTab] = useState('dashboard')

    // модалка приглашения гида (как у owner, но роль фиксирована)
  const [guideInviteOpen, setGuideInviteOpen] = useState(false)
  const [guideInviteSaving, setGuideInviteSaving] = useState(false)
  const [guideInviteIssued, setGuideInviteIssued] = useState(null) // { username, tempPassword } | null

  async function createGuideInvite(e) {
    e.preventDefault()
    setGuideInviteSaving(true)
    setGuideInviteIssued(null)
    try {
      const res = await fetch('/api/v1/company/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: company.id,
          role: 'guide', // тут всегда гид
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

      // показываем одноразовый логин/пароль
      if (data.credentials) {
        setGuideInviteIssued(data.credentials) // { username, tempPassword }
      } else {
        setGuideInviteOpen(false)
      }
    } catch (err) {
      alert(err.message)
    } finally {
      setGuideInviteSaving(false)
    }
  }

  return (
    <div className={s.page}>
      {/* Хедер с названием компании */}
      <header className={s.header}>
        <div className={`${s.shell} ${s.headerInner}`}>
          <Link href="/cabinet" className={s.backButton}>
            <span className={s.backIcon}>←</span>
          </Link>

          <div className={s.headerTitleWrap}>
            <div className={s.companyName}>{company.name}</div>
            {/* { <div className={s.sectionTitle}>{sectionTitle}</div> } */}
          </div>

          {roleLabel(role) && (
            <span className={s.roleBadge}>{roleLabel(role)}</span>
          )}
        </div>
      </header>

      {/* Основной контент */}
      <main className={s.main}>
        <div className={`${s.shell} ${s.mainInner}`}>
          {tab === "dashboard" && <DashboardTab />}
          {tab === "tours" && <ToursTab />}
          {tab === "base" && <BaseTab guides={guides} />}  {/* ВАЖНО */}
          {tab === "templates" && <TemplatesTab />}
        </div>

        {tab === "base" && (
          <button
            type="button"
            onClick={() => {
              setGuideInviteOpen(true)
              setGuideInviteIssued(null)
            }}
            className={`fixed bottom-24 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white ${s.add_button}`}
          >
            <Plus className={s.add_button_icon} />
          </button>
        )}
      </main>

      {/* Модалка приглашения гида */}
      {guideInviteOpen && (
        <div className={`fixed inset-0 z-40 bg-black/40 grid place-items-center px-4`}>
          <div className={`w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-xl p-5 ${s.add_card}`}>
            {guideInviteIssued === null ? (
              <>
                <div className="text-lg font-semibold text-slate-100 text-center">
                  Новый гид
                </div>

                <form onSubmit={createGuideInvite} className={`mt-4 space-y-4`}>
                  <p className={`text-xs text-slate-500 ${s.add_card_color}`}>
                    После нажатия <span className="font-medium">«Сохранить»</span> будет
                    сгенерирован одноразовый логин и пароль для гида. Передайте их гиду.
                    Он должен сначала зарегистрироваться на сайте, затем в кабинете нажать
                    «Добавить компанию» → «Найти» и ввести этот логин и пароль.
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setGuideInviteOpen(false)
                        setGuideInviteIssued(null)
                      }}
                      className="px-4 py-2 rounded-xl border border-slate-200"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      disabled={guideInviteSaving}
                      className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-200 text-white hover:opacity-95 active:scale-[.99]"
                    >
                      {guideInviteSaving ? 'Создаём…' : 'Сохранить'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              // Листок выдачи доступа для гида
              <div>
                <div className="text-lg font-semibold text-slate-100 text-center">
                  Доступ для гида создан
                </div>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Логин</span>
                    <span className="font-mono">{guideInviteIssued.username}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Пароль</span>
                    <span className="font-mono">{guideInviteIssued.tempPassword}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Попросите гида не передавать эти данные третьим лицам.
                    Логин и пароль работают только один раз для привязки компании.
                  </p>
                  <div className="flex items-center justify-end gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setGuideInviteOpen(false)
                        setGuideInviteIssued(null)
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:opacity-95 active:scale-[.99]"
                    >
                      Закрыть
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Нижнее меню */}
      <nav className={s.bottomNav}>
        <div className={`${s.shell} ${s.bottomNavInner}`}>
          <button
            type="button"
            onClick={() => setTab("dashboard")}
            className={
              tab === "dashboard"
                ? `${s.navItem} ${s.navItemActive}`
                : s.navItem
            }
          >
            <LayoutDashboard className={``} />
            <span className={s.navLabel}>Дашборд</span>
          </button>

          <button
            type="button"
            onClick={() => setTab("tours")}
            className={
              tab === "tours" ? `${s.navItem} ${s.navItemActive}` : s.navItem
            }
          >
            <Map className={``} />
            <span className={s.navLabel}>Все туры</span>
          </button>

          <button
            type="button"
            onClick={() => setTab("base")}
            className={
              tab === "base" ? `${s.navItem} ${s.navItemActive}` : s.navItem
            }
          >
            <Database className={``} />
            <span className={s.navLabel}>База</span>
          </button>

          <button
            type="button"
            onClick={() => setTab("templates")}
            className={
              tab === "templates"
                ? `${s.navItem} ${s.navItemActive}`
                : s.navItem
            }
          >
            <Files className={``} />
            <span className={s.navLabel}>Шаблоны</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
