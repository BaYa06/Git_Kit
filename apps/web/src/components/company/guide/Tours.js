import { useMemo } from "react";
import { Users, CircleCheck, CirclePause, Phone } from "lucide-react";
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

export function GuideTouristsMock({ showAddButton = true, touristsData = null, onTogglePaid }) {
  const mockTourists = [
    {
      id: 1,
      group: "Группа 1",
      groupColor: "#1f2b3a",
      travelers: [
        { name: "Иванов Иван", phone: "+7 999 123-45-67" },
        { name: "Смирнова Ольга", phone: "+7 999 321-67-89" },
        { name: "Ким Алексей", phone: "+7 999 222-33-44" },
      ],
      cost: "1000 USD",
      prepay: "500 USD",
      balance: "500 USD",
      paid: false,
      accent: "#2d65e6",
      balanceTone: "neutral",
    },
    {
      id: 2,
      group: "Группа 2",
      groupColor: "#2b1b3d",
      travelers: [{ name: "Петрова Анна", phone: "+7 999 765-43-21" }],
      cost: "1200 USD",
      prepay: "1200 USD",
      balance: "0 USD",
      paid: true,
      accent: "#8b5cf6",
      balanceTone: "success",
    },
    {
      id: 3,
      group: "Группа 3",
      groupColor: "#1f2b3a",
      travelers: [{ name: "Сидоров Петр", phone: "+7 999 555-55-55" }],
      cost: "1000 USD",
      prepay: "0 USD",
      balance: "1000 USD",
      paid: false,
      accent: "#2d65e6",
      balanceTone: "danger",
    },
  ];
  const tourists = Array.isArray(touristsData) ? touristsData : mockTourists;

  return (
    <div className={s.touristPage}>

      <main className={s.touristMain}>
        <div className={s.touristCards}>
          {tourists.map((t) => (
            <div
              key={t.id}
              className={s.touristCard}
              style={{ backgroundColor: t.groupColor }}
            >
              <div className={s.touristCardTop}>
                <span
                  className={s.touristBadge}
                  style={{ backgroundColor: `${t.accent}1a`, color: t.accent }}
                >
                  {t.group}
                </span>
              </div>

              <div className={s.touristPersonList}>
                {(t.travelers || []).map((person, idx) => (
                  <div key={idx} className={s.touristPerson}>
                    <div className={s.touristPersonRow}>
                      <p className={s.touristName}>{person.name}</p>
                      {person.phone ? (
                        <a
                          href={`tel:${person.phone}`}
                          className={s.touristPhoneCall}
                          aria-label={`Позвонить ${person.name}`}
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      ) : null}
                    </div>
                    <p className={s.touristPhone}>{person.phone}</p>
                  </div>
                ))}
              </div>

              <div className={s.touristDivider} />

              <div className={s.touristMetaGrid}>
                <div className={s.touristMetaItem}>
                  <p className={s.touristMetaLabel}>Стоимость тура</p>
                  <p className={s.touristMetaValue}>{t.cost}</p>
                </div>
                <div className={s.touristMetaItem}>
                  <p className={s.touristMetaLabel}>Предоплата</p>
                  <p
                    className={`${s.touristMetaValue} ${
                      t.balanceTone === "danger" ? s.touristDanger : ""
                    }`}
                  >
                    {t.prepay}
                  </p>
                </div>
                <div className={s.touristMetaItem}>
                  <p className={s.touristMetaLabel}>Остаток</p>
                  <p
                    className={`${s.touristMetaValue} ${
                      t.balanceTone === "success"
                        ? s.touristSuccess
                        : t.balanceTone === "danger"
                        ? s.touristDanger
                        : ""
                    }`}
                  >
                    {t.balance}
                  </p>
                </div>
              </div>

              <div className={s.touristDivider} />

              <div className={s.touristFooterRow}>
                <span className={s.touristFooterLabel}>Оплачено полностью</span>
                <button
                  type="button"
                  aria-pressed={t.paid}
                  className={`${s.touristToggle} ${t.paid ? s.touristToggleOn : ""}`}
                  onClick={() => onTogglePaid && onTogglePaid(t)}
                >
                  <div className={s.touristToggleKnob} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {showAddButton ? (
        <footer className={s.touristFooter}>
          <button type="button" className={s.touristAddButton}>
            <span className={s.touristAddIcon}>＋</span>
            Добавить путешественника
          </button>
        </footer>
      ) : null}
    </div>
  );
}

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
