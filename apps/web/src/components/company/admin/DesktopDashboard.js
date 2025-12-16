import { useMemo } from "react";
import {
  Flag,
  Users,
  Hotel,
  Orbit,
  TrendingUp,
  Clock3,
  CheckCircle2,
  PauseCircle,
  ArrowRight,
  UserRound,
} from "lucide-react";
import styles from "../../../styles/admin/desktopDashboard.module.css";

const formatInitials = (name = "") => {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] || "").concat(parts[1][0] || "").toUpperCase();
};

const parseDate = (value) => {
  if (!value) return null;
  const iso = `${value}T00:00:00Z`;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
};

const monthLabel = (d) =>
  d
    ? d.toLocaleString("ru-RU", {
        month: "short",
        timeZone: "UTC",
      })
    : "";

const dayLabel = (d) => (d ? d.getUTCDate() : "");

export default function DesktopDashboard({ company, tours = [], guides = [], hotels = [], onTourClick }) {
  const today = new Date();
  const todayUTC = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());

  const stats = useMemo(() => {
    const activeTours = (tours || []).filter((t) => {
      const d = parseDate(t.start_date);
      if (!d) return false;
      return d.getTime() >= todayUTC;
    });

    const { signedTotal, neededTotal } = activeTours.reduce(
      (acc, t) => {
        const signed = Number.isFinite(t.tourists_signed) ? t.tourists_signed : 0;
        const needed = Number.isFinite(t.tourists_count) ? t.tourists_count : 0;
        acc.signedTotal += signed;
        acc.neededTotal += needed;
        return acc;
      },
      { signedTotal: 0, neededTotal: 0 }
    );

    const occupancyPct = neededTotal > 0 ? Math.round((Math.max(signedTotal, 0) * 100) / neededTotal) : 0;

    const nearestTours = activeTours
      .filter((t) => {
        const d = parseDate(t.start_date);
        if (!d) return false;
        const diffDays = Math.floor((d.getTime() - todayUTC) / 86400000);
        return diffDays >= 0 && diffDays <= 2;
      })
      .sort((a, b) => {
        const da = parseDate(a.start_date)?.getTime() || 0;
        const db = parseDate(b.start_date)?.getTime() || 0;
        return da - db;
      });

    const badReviews =
      (guides || [])
        .filter((g) => Number(g.reviews_count) > 0 && Number(g.avg_rating) > 0 && Number(g.avg_rating) < 4)
        .slice(0, 4) || [];

    return {
      activeToursCount: activeTours.length,
      guidesAvailable: guides.length || 0,
      partnerHotelsCount: hotels.length || 0,
      occupancyPct,
      signedTotal,
      neededTotal,
      nearestTours,
      badReviews,
    };
  }, [guides, hotels, todayUTC, tours]);

  const logoUrl = company?.logo_url || null;
  const initials = formatInitials(company?.name || "GK");

  return (
    <div className={styles.desktopPage}>
      <header className={styles.desktopHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.companyLogo}>
            {logoUrl ? <img src={logoUrl} alt={company?.name || "Компания"} /> : <span>{initials}</span>}
          </div>
          <div className={styles.companyNameBlock}>
            <div className={styles.companyName}>{company?.name || "Компания"}</div>
            <div className={styles.companyTagline}>Панель администратора</div>
          </div>
        </div>
        <div className={styles.headerActions}>
          <span className={styles.headerBadge}>Десктоп</span>
          <div className={styles.headerAvatar}>
            <div className={styles.companyLogo} style={{ width: 32, height: 32 }}>
              <span>AD</span>
            </div>
            <div className={styles.headerAvatarText}>
              <span className={styles.headerAvatarName}>Admin</span>
              <span className={styles.headerAvatarRole}>role</span>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.desktopMain}>
        <div className={styles.desktopShell}>
          <div className={styles.statsGrid}>
            <div className={styles.card}>
              <div className={styles.cardTop}>
                <span>Active Tours</span>
                <span className={styles.cardIcon}>
                  <Flag className="w-4 h-4" />
                </span>
              </div>
              <div className={styles.cardValueRow}>
                <span className={styles.cardValue}>{stats.activeToursCount}</span>
                <span className={styles.cardSub}>активные туры</span>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardTop}>
                <span>Available Guides</span>
                <span className={styles.cardIcon}>
                  <Users className="w-4 h-4" />
                </span>
              </div>
              <div className={styles.cardValueRow}>
                <span className={styles.cardValue}>{stats.guidesAvailable}</span>
                <span className={styles.cardSub}>из {guides.length || 0}</span>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardTop}>
                <span>Partner Hotels</span>
                <span className={styles.cardIcon}>
                  <Hotel className="w-4 h-4" />
                </span>
              </div>
              <div className={styles.cardValueRow}>
                <span className={styles.cardValue}>{stats.partnerHotelsCount}</span>
                <span className={styles.cardSub}>в базе</span>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardTop}>
                <span>Plan Occupancy</span>
                <span className={styles.cardIcon}>
                  <Orbit className="w-4 h-4" />
                </span>
              </div>
              <div className={styles.cardValueRow}>
                <span className={styles.cardValue}>{stats.occupancyPct}%</span>
                <span className={styles.cardSub}>
                  заполненность ({stats.signedTotal}/{stats.neededTotal || 0})
                </span>
              </div>
            </div>
          </div>

          <div className={styles.contentGrid}>
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <h3 className={styles.panelTitle}>Ближайшие туры</h3>
                <div className={styles.pillRow}>
                  <span className={`${styles.pill} ${styles.pillActive}`}>Сегодня</span>
                  <span className={styles.pill}>Завтра</span>
                  <span className={styles.pill}>Послезавтра</span>
                </div>
              </div>

              <div className={`${styles.table} ${styles.tableHead}`}>
                <span>Дата</span>
                <span>Название тура</span>
                <span>Статус</span>
                <span className="text-right">Участники</span>
              </div>

              {stats.nearestTours.length === 0 && (
                <div className={styles.emptyState}>Сегодня, завтра и послезавтра туров нет.</div>
              )}

              {stats.nearestTours.map((t) => {
                const dateObj = parseDate(t.start_date);
                const month = monthLabel(dateObj);
                const day = dayLabel(dateObj);
                const guidesNames = Array.isArray(t.guide_names)
                  ? t.guide_names.filter(Boolean).join(", ")
                  : "-";
                const status =
                  t.status === "confirmed" || t.status === "active"
                    ? "confirmed"
                    : t.status === "planned" || t.status === "draft"
                    ? "planned"
                    : "progress";
                const signed = Number.isFinite(t.tourists_signed) ? t.tourists_signed : "-";
                const needed = Number.isFinite(t.tourists_count) ? t.tourists_count : "-";

                return (
                  <div
                    key={t.id}
                    className={`${styles.table} ${styles.tableRow}`}
                    onClick={() => onTourClick && onTourClick(t)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onTourClick && onTourClick(t);
                      }
                    }}
                  >
                    <div>
                      <span className={styles.pill}>{`${day} ${month}`}</span>
                    </div>
                    <div>
                      <div className={styles.tourTitle}>{t.name}</div>
                      <div className={styles.tourMeta}>Гид: {guidesNames}</div>
                    </div>
                    <div>
                      <span
                        className={`${styles.status} ${
                          status === "planned"
                            ? styles.statusPending
                            : status === "progress"
                            ? styles.statusProgress
                            : ""
                        }`}
                      >
                        {status === "planned" ? <Clock3 className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        {t.status || "planned"}
                      </span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className={styles.people}>{signed}<span className={styles.peopleMuted}>/{needed}</span></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={styles.sideStack}>
              <div className={styles.panel}>
                <div className={styles.panelHeader}>
                  <h3 className={styles.panelTitle}>Быстрые действия</h3>
                </div>
                <div className={styles.quickActions}>
                  <button type="button" className={styles.primaryButton}>
                    <TrendingUp className="w-4 h-4" />
                    Создать тур из шаблона
                  </button>
                  <button type="button" className={styles.quickLink}>
                    <span className={styles.quickLinkLabel}>
                      <span className={styles.pillIcon}>
                        <Users className="w-4 h-4" />
                      </span>
                      Добавить гида
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button type="button" className={styles.quickLink}>
                    <span className={styles.quickLinkLabel}>
                      <span className={styles.pillIcon}>
                        <Hotel className="w-4 h-4" />
                      </span>
                      Добавить отель
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button type="button" className={styles.quickLink}>
                    <span className={styles.quickLinkLabel}>
                      <span className={styles.pillIcon}>
                        <Flag className="w-4 h-4" />
                      </span>
                      Добавить транспорт
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className={styles.panel}>
                <div className={styles.panelHeader}>
                  <h3 className={styles.panelTitle}>Плохие отзывы</h3>
                  <span className={styles.badge}>{stats.badReviews.length}</span>
                </div>
                {stats.badReviews.length === 0 ? (
                  <div className={styles.emptyState}>Отзывов с низкой оценкой нет</div>
                ) : (
                  <div className={styles.reviewsList}>
                    {stats.badReviews.map((g) => (
                      <div key={g.id} className={styles.reviewItem}>
                        <span className={styles.reviewAvatar}>
                          <UserRound className="w-4 h-4" />
                        </span>
                        <div className={styles.reviewBody}>
                          <span className={styles.reviewName}>{g.full_name || "Гид"}</span>
                          <span className={styles.reviewText}>Средняя: {(Number(g.avg_rating) || 0).toFixed(1)}</span>
                        </div>
                        <span className={styles.reviewRating}>{(Number(g.avg_rating) || 0).toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
