import { Flag, Hotel, Users, Orbit, CircleCheck, CirclePause } from "lucide-react";
import cards from "../../../styles/admin/cards.module.css";

const s = { ...cards };

const parseDate = (value) => {
  if (!value) return null;
  // добавляем T00:00:00Z, чтобы избежать смещений по таймзоне
  const iso = `${value}T00:00:00Z`;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
};

const monthLabel = (d) =>
  d
    ? d.toLocaleString("en-US", {
        month: "short",
        timeZone: "UTC",
      })
    : "";

const dayLabel = (d) => (d ? d.getUTCDate() : "");

export default function DashboardTab({
  tours = [],
  guides = [],
  hotels = [],
  onTourClick,
}) {
  const today = new Date();
  const todayUTC = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate()
  );

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

  const occupancyPct =
    neededTotal > 0
      ? Math.round((Math.max(signedTotal, 0) * 100) / neededTotal)
      : 0;

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

  const activeToursCount = activeTours.length;
  const partnerHotelsCount = hotels.length || 0;
  const guidesAvailable = guides.length || 0;

  return (
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
          <p className={s.cardValue}>{activeToursCount}</p>
          <p className={s.cardSub}>активные туры</p>
        </div>

        <div className={s.card}>
          <div className={s.cardTopRow}>
            <p className={s.cardTitle}>Available Guides</p>
            <span className={s.cardIcon}>
              <Users className={`w-4 h-4 ${s.icons_color}`} />
            </span>
          </div>
          <p className={s.cardValue}>{guidesAvailable}</p>
          <p className={s.cardSub}>На завтра</p>
        </div>

        <div className={s.card}>
          <div className={s.cardTopRow}>
            <p className={s.cardTitle}>Partner Hotels</p>
            <span className={s.cardIcon}>
              <Hotel className={`w-4 h-4 ${s.icons_color}`} />
            </span>
          </div>
          <p className={s.cardValue}>{partnerHotelsCount}</p>
          <p className={s.cardSub}>в базе</p>
        </div>

        <div className={s.card}>
          <div className={s.cardTopRow}>
            <p className={s.cardTitle}>Plan Occupancy</p>
            <span className={s.cardIcon}>
              <Orbit className={`w-4 h-4 ${s.icons_color}`} />
            </span>
          </div>
          <p className={s.cardValue}>{occupancyPct}%</p>
          <p className={s.cardSub}>
            заполненность туров ({signedTotal}/{neededTotal || 0})
          </p>
        </div>
      </div>

      {/* Ближайшие туры */}
      <h3 className={s.sectionHeading}>Ближайшие туры</h3>

      {nearestTours.length === 0 && (
        <div className={s.emptyState}>
          <p className={s.emptyTitle}>Нет ближайших туров</p>
          <p className={s.emptyText}>Сегодня, завтра и послезавтра туров нет.</p>
        </div>
      )}

      {nearestTours.length > 0 && (
        <div className={s.toursList}>
          {nearestTours.map((t) => {
            const dateObj = parseDate(t.start_date);
            const month = monthLabel(dateObj);
            const day = dayLabel(dateObj);
            const guides = Array.isArray(t.guide_names)
              ? t.guide_names.filter(Boolean)
              : [];
            const guideLabel = guides.length > 0 ? guides.join(", ") : "-";
            const status =
              t.status === "confirmed" || t.status === "active"
                ? "confirmed"
                : t.status === "planned" || t.status === "draft"
                ? "planned"
                : "other";
            const signed = Number.isFinite(t.tourists_signed)
              ? t.tourists_signed
              : "-";
            const needed = Number.isFinite(t.tourists_count)
              ? t.tourists_count
              : "-";

            return (
              <div
                className={s.tourItem}
                key={t.id}
                role="button"
                tabIndex={0}
                onClick={() => onTourClick && onTourClick(t)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onTourClick && onTourClick(t);
                  }
                }}
              >
                <div className={s.tourDate}>
                  <span className={s.tourMonth}>{month}</span>
                  <span className={s.tourDay}>{day}</span>
                </div>
                <div className={s.tourBody}>
                  <p className={s.tourTitle}>{t.name}</p>
                  <p className={s.tourMeta}>Гид: {guideLabel}</p>
                  <div
                    className={
                      status === "confirmed"
                        ? s.tour_position_confirmed
                        : s.tour_position_waiting
                    }
                  >
                    {status === "confirmed" ? (
                      <CircleCheck className={`w-4 h-4 ${s.icons_color_green}`} />
                    ) : (
                      <CirclePause className={`w-4 h-4 ${s.icons_color_green}`} />
                    )}
                    <p className={s.tour_ready}>{t.status || "planned"}</p>
                  </div>
                </div>
                <div className={s.tourChevron}>
                  <div className={s.count_people}>
                    <Users className={`w-4 h-4 ${s.icons_color}`} />
                    <p className={s.people_count_number}>
                      {signed}/{needed}
                    </p>
                  </div>
                  <p className={s.people_count_right}>›</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
