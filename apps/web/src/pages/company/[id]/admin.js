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
  if (!pair) return { redirect: { destination: "/login", permanent: false } };

  try {
    const token = decodeURIComponent(pair.split("=")[1]);
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "dev_secret_change_me"
    );

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const [cRes, rRes] = await Promise.all([
      pool.query("SELECT id, name FROM companies WHERE id=$1", [params.id]),
      pool.query(
        "SELECT role FROM user_company_roles WHERE user_id=$1 AND company_id=$2 LIMIT 1",
        [payload.sub, params.id]
      ),
    ]);
    await pool.end();

    if (!cRes.rows[0]) return { notFound: true };
    const company = cRes.rows[0];
    const role = rRes.rows[0]?.role || null;

    // доступ сюда: admin / owner
    if (!(role === "admin" || role === "owner")) {
      return {
        redirect: {
          destination: `/company/${params.id}/manager`,
          permanent: false,
        },
      };
    }

    return { props: { company, role } };
  } catch {
    return { redirect: { destination: "/login", permanent: false } };
  }
}

const roleLabel = (r) => {
  if (!r) return null;
  if (r === "org_department" || r === "manager") return "manager";
  return r; // owner, admin, guide
};

export default function CompanyAdminPage({ company, role }) {
  const [tab, setTab] = useState("dashboard"); // dashboard | tours | base | templates

  const sectionTitle =
    tab === "dashboard"
      ? "Company Dashboard"
      : tab === "tours"
      ? "Все туры"
      : tab === "base"
      ? "База"
      : "Шаблоны";

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
            <div className={s.sectionTitle}>{sectionTitle}</div>
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
          {tab === "base" && <BaseTab />}
          {tab === "templates" && <TemplatesTab />}
        </div>

        {/* Плавающая кнопка + (оставляем как было) */}
        <button
          type="button"
          className={`fixed bottom-24 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg ${s.add_button}`}
        >
          <Plus className={s.add_button_icon} />
        </button>
      </main>

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
