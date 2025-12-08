import { useMemo } from "react";
import { Users, CircleCheck, CirclePause } from "lucide-react";
import base from "../../../styles/guide.module.css";
import cards from "../../../styles/admin/cards.module.css";

const s = { ...base, ...cards };

const monthDay = (date) => {
  if (!date) return { month: "", day: "" };
  const d = new Date(`${date}T00:00:00Z`);
  return {
    month: d.toLocaleString("en-US", { month: "short", timeZone: "UTC" }),
    day: d.getUTCDate(),
  };
};

const StatusPill = ({ status }) => {
  const isConfirmed = status === "confirmed" || status === "active";
  return (
    <div
      className={
        isConfirmed ? s.tour_position_confirmed : s.tour_position_waiting
      }
    >
      {isConfirmed ? (
        <CircleCheck className={`w-4 h-4 ${s.icons_color_green}`} />
      ) : (
        <CirclePause className={`w-4 h-4 ${s.icons_color_green}`} />
      )}
      <p className={s.tour_ready}>{isConfirmed ? "confirmed" : "planned"}</p>
    </div>
  );
};

const TourCard = ({ item, isPast = false, onOpen }) => {
  const { month, day } = monthDay(item.start);
  return (
    <div
      className={`${s.tourItem} ${s.tourItemMobile}`}
      role="button"
      tabIndex={0}
      onClick={() => onOpen && onOpen(item)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen && onOpen(item);
        }
      }}
    >
      <div
        className={`${s.tourDate} ${s.tourDateMobile} ${
          isPast ? s.tourDatePast : ""
        }`}
      >
        <span className={s.tourMonth}>{month}</span>
        <span className={s.tourDay}>{day}</span>
      </div>
      <div className={s.tourBody}>
        <p className={`${s.tourTitle} ${s.tourTitleMobile}`}>{item.name || "Без названия"}</p>
        <p className={`${s.tourMeta} ${s.tourMetaMobile}`}>
          Гид: {item.guide || "—"}
        </p>
        <StatusPill status={item.status} />
      </div>
      <div className={s.tourChevronMobile}>
        <div className={s.count_people}>
          <Users className={`w-4 h-4 ${s.icons_color}`} />
          <p className={s.people_count_number}>
            {item.signed}/{item.needed}
          </p>
        </div>
        <p className={s.people_count_right}>›</p>
      </div>
    </div>
  );
};

export default function GuideTours({ tours = [], onOpenTour }) {
  const { upcoming, past } = useMemo(() => {
    const today = new Date();
    const todayUTC = Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate()
    );

    const normalize = (t) => {
      const ts = t.start_date
        ? new Date(`${t.start_date}T00:00:00Z`).getTime()
        : null;
      const isPast = Number.isFinite(ts) ? ts < todayUTC : false;
      const guideLabel =
        Array.isArray(t.guide_names) && t.guide_names.length > 0
          ? t.guide_names.join(", ")
          : t.main_guide_name || "";
      return {
        id: t.id,
        name: t.name,
        start: t.start_date,
        signed: Number.isFinite(t.tourists_signed) ? t.tourists_signed : 0,
        needed: Number.isFinite(t.tourists_count) ? t.tourists_count : 0,
        status: t.status,
        guide: guideLabel || "—",
        ts,
        isPast,
      };
    };

    const normalized = (tours || []).map(normalize);
    const upcoming = normalized
      .filter((t) => !t.isPast)
      .sort((a, b) => {
        if (Number.isFinite(a.ts) && Number.isFinite(b.ts)) return a.ts - b.ts;
        if (Number.isFinite(a.ts)) return -1;
        if (Number.isFinite(b.ts)) return 1;
        return 0;
      });
    const past = normalized
      .filter((t) => t.isPast)
      .sort((a, b) => {
        if (Number.isFinite(a.ts) && Number.isFinite(b.ts)) return b.ts - a.ts;
        if (Number.isFinite(a.ts)) return -1;
        if (Number.isFinite(b.ts)) return 1;
        return 0;
      });

    return { upcoming, past };
  }, [tours]);

  return (
    <div className={s.list}>
      <div className={s.sectionHeading}>Предстоящие туры</div>
      {upcoming.length === 0 ? (
        <div className={s.emptyBox}>Нет предстоящих туров</div>
      ) : (
        <div className={s.toursList}>
          {upcoming.map((t) => (
            <TourCard key={t.id} item={t} onOpen={onOpenTour} />
          ))}
        </div>
      )}

      <div className={s.sectionHeading} style={{ marginTop: 18 }}>
        Прошедшие
      </div>
      {past.length === 0 ? (
        <div className={s.emptyBox}>Пока нет прошедших туров</div>
      ) : (
        <div className={s.toursList}>
          {past.map((t) => (
            <TourCard key={t.id} item={t} isPast onOpen={onOpenTour} />
          ))}
        </div>
      )}
    </div>
  );
}
