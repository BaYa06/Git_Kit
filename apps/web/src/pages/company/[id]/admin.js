// pages/company/[id]/admin.js

import { useState } from "react";
import Link from "next/link";
import s from "../../../styles/admin.module.css";
import { Flag, Hotel, Users, Orbit, CircleCheck, CirclePause, LayoutDashboard, Map, Database, Files } from 'lucide-react';

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
          {tab === "dashboard" ? (
            <>
              {/* Карточки-статистика */}
              <div className={s.cardsGrid}>
                <div className={s.card}>
                  <div className={s.cardTopRow}>
                    <p className={s.cardTitle}>Active Tours</p>
                    <span className={s.cardIcon}>
                      <Flag className={`w-4 h-4 ${s.icons_color}`} />
                    </span>
                  </div>
                  <p className={s.cardValue}>12</p>
                  <p className={s.cardSub}>на этой неделе</p>
                </div>

                <div className={s.card}>
                  <div className={s.cardTopRow}>
                    <p className={s.cardTitle}>Available Guides</p>
                    <span className={s.cardIcon}>
                      <Users className={`w-4 h-4 ${s.icons_color}`} />
                    </span>
                  </div>
                  <p className={s.cardValue}>8</p>
                  <p className={s.cardSub}>свободны завтра</p>
                </div>

                <div className={s.card}>
                  <div className={s.cardTopRow}>
                    <p className={s.cardTitle}>Partner Hotels</p>
                    <span className={s.cardIcon}>
                      <Hotel className={`w-4 h-4 ${s.icons_color}`} />
                    </span>
                  </div>
                  <p className={s.cardValue}>25</p>
                  <p className={s.cardSub}>в базе</p>
                </div>

                <div className={s.card}>
                  <div className={s.cardTopRow}>
                    <p className={s.cardTitle}>Plan Occupancy</p>
                    <span className={s.cardIcon}>
                      <Orbit className={`w-4 h-4 ${s.icons_color}`} />
                    </span>
                  </div>
                  <p className={s.cardValue}>85%</p>
                  <p className={s.cardSub}>заполненность туров</p>
                </div>
              </div>

              {/* Ближайшие туры */}
              <h3 className={s.sectionHeading}>Ближайшие туры</h3>

              <div className={s.toursList}>
                <div className={s.tourItem}>
                  <div className={s.tourDate}>
                    <span className={s.tourMonth}>Nov</span>
                    <span className={s.tourDay}>12</span>
                  </div>
                  <div className={s.tourBody}>
                    <p className={s.tourTitle}>Ala-Archa Day Tour</p>
                    <p className={s.tourMeta}>
                      Сбор 08:30 • Гид: Асан
                    </p>
                    <div className={s.tour_position_confirmed}>
                      <CircleCheck className={`w-4 h-4 ${s.icons_color_green}`} />
                      <p className={s.tour_ready}> Confirmed</p>
                    </div>
                  </div>
                  <div className={s.tourChevron}>
                    <div className={s.count_people}>
                      <Users className={`w-4 h-4 ${s.icons_color}`} />
                      <p className={s.people_count_number}>10/12</p>
                    </div>
                    <p className={s.people_count_right}>›</p> 
                  </div>
                </div>

                <div className={s.tourItem}>
                  <div className={s.tourDate}>
                    <span className={s.tourMonth}>Nov</span>
                    <span className={s.tourDay}>15</span>
                  </div>
                  <div className={s.tourBody}>
                    <p className={s.tourTitle}>Issyk-Kul Weekend</p>
                    <p className={s.tourMeta}>
                      Сбор: 06:30 • Гид: Айпери
                    </p>
                    <div className={s.tour_position_waiting}>
                      <CirclePause className={`w-4 h-4 ${s.icons_color_green}`} />
                      <p className={s.tour_ready}> Confirmed</p>
                    </div>
                  </div>
                  <div className={s.tourChevron}>
                    <div className={s.count_people}>
                      <Users className={`w-4 h-4 ${s.icons_color}`} />
                      <p className={s.people_count_number}>5/10</p>
                    </div>
                    <p className={s.people_count_right}>›</p> 
                  </div>
                </div>

                <div className={s.tourItem}>
                  <div className={s.tourDate}>
                    <span className={s.tourMonth}>Nov</span>
                    <span className={s.tourDay}>20</span>
                  </div>
                  <div className={s.tourBody}>
                    <p className={s.tourTitle}>City Tour Bishkek</p>
                    <p className={s.tourMeta}>
                      Сбор: 10:30 • Гид: Асель
                    </p>
                    <div className={s.tour_position_waiting}>
                      <CirclePause className={`w-4 h-4 ${s.icons_color_green}`} />
                      <p className={s.tour_ready}> Confirmed</p>
                    </div>
                  </div>
                  <div className={s.tourChevron}>
                    <div className={s.count_people}>
                      <Users className={`w-4 h-4 ${s.icons_color}`} />
                      <p className={s.people_count_number}>0/8</p>
                    </div>
                    <p className={s.people_count_right}>›</p> 
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className={s.emptyState}>
              <p className={s.emptyTitle}>Здесь пока пусто</p>
              <p className={s.emptyText}>
                Раздел «
                {tab === "tours"
                  ? "Все туры"
                  : tab === "base"
                  ? "База"
                  : "Шаблоны"}
                » мы добавим позже.
              </p>
            </div>
          )}
        </div>
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
