import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  Users,
  UserRound,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import s from "../../../styles/guide.module.css";

const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export default function GuideTable({ companyId }) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [dayStatuses, setDayStatuses] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState("none");
  const [selectedDay, setSelectedDay] = useState(null);

  const targetYear = viewDate.getFullYear();
  const targetMonthIndex = viewDate.getMonth();
  const monthStart = useMemo(
    () => new Date(targetYear, targetMonthIndex, 1),
    [targetYear, targetMonthIndex]
  );
  const startOffset = monthStart.getDay();
  const daysInMonth = useMemo(
    () => new Date(targetYear, targetMonthIndex + 1, 0).getDate(),
    [targetYear, targetMonthIndex]
  );
  const monthLabel = useMemo(
    () =>
      monthStart.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      }),
    [monthStart]
  );

  const weekdayLabels = ["S", "M", "T", "W", "T", "F", "S"];
  const weekDays = useMemo(() => {
    const start = new Date(today);
    const currentWeekday = start.getDay() || 7; // Sunday => 7
    start.setDate(start.getDate() - (currentWeekday - 1)); // move to Monday

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const weekday = d.toLocaleDateString("ru-RU", { weekday: "long" });
      const label = weekday.charAt(0).toUpperCase() + weekday.slice(1);
      return {
        label,
        index: d.getDay(),
        dateKey: formatDateKey(d),
      };
    });
  }, [today]);

  const todaysEvents = [
    {
      id: 1,
      title: "10:00 - Walking Tour of the Old Town",
      subtitle: "Group of 8, Confirmed",
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: 2,
      title: "14:00 - Private Museum Visit",
      subtitle: "Private Tour, Confirmed",
      icon: <UserRound className="w-5 h-5" />,
    },
  ];

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const todayLabel = today.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
  });

  const statusOptions = [
    { value: "none", label: "Не выбрано", icon: <Circle className="w-5 h-5" /> },
    { value: "free", label: "Свободен", icon: <CheckCircle2 className="w-5 h-5" /> },
    { value: "busy", label: "Занят", icon: <XCircle className="w-5 h-5" /> },
  ];

  const fetchAvailability = async () => {
    if (!companyId) return;
    const monthStartDate = new Date(targetYear, targetMonthIndex, 1);
    const monthEndDate = new Date(targetYear, targetMonthIndex + 1, 0);
    const from = formatDateKey(monthStartDate);
    const to = formatDateKey(monthEndDate);

    try {
      const res = await fetch(
        `/api/v1/guides/availability?company_id=${companyId}&from=${from}&to=${to}`
      );
      if (!res.ok) return;
      const data = await res.json();
      const items = Array.isArray(data.items) ? data.items : [];
      setDayStatuses((prev) => {
        const next = { ...prev };
        items.forEach((item) => {
          if (!item || !item.date) return;
          if (item.status && item.status !== "none") {
            next[item.date] = item.status;
          } else {
            delete next[item.date];
          }
        });
        return next;
      });
    } catch (e) {
      console.error("availability fetch failed", e);
    }
  };

  const persistStatus = async (dateKey, status) => {
    if (!companyId || !dateKey) return;
    try {
      await fetch("/api/v1/guides/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: companyId,
          items: [{ date: dateKey, status }],
        }),
      });
    } catch (e) {
      console.error("availability save failed", e);
    }
  };

  useEffect(() => {
    fetchAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, targetYear, targetMonthIndex]);

  return (
    <div className={s.scheduleLayout}>
      <section className={s.calendarCard}>
        <div className={s.calendarHeader}>
          <h2 className={s.scheduleHeading}>Расписание</h2>
          <div className={s.monthNav}>
            <button
              type="button"
              className={s.monthNavButton}
              aria-label="Previous month"
              onClick={() => {
                setViewDate((prev) => {
                  const next = new Date(prev);
                  next.setMonth(prev.getMonth() - 1, 1);
                  next.setHours(0, 0, 0, 0);
                  return next;
                });
              }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className={s.monthLabel}>{monthLabel}</span>
            <button
              type="button"
              className={s.monthNavButton}
              aria-label="Next month"
              onClick={() => {
                setViewDate((prev) => {
                  const next = new Date(prev);
                  next.setMonth(prev.getMonth() + 1, 1);
                  next.setHours(0, 0, 0, 0);
                  return next;
                });
              }}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className={s.calendarGrid}>
          {weekdayLabels.map((label, idx) => (
            <div key={`${label}-${idx}`} className={s.weekdayLabel}>
              {label}
            </div>
          ))}

          {Array.from({ length: startOffset }).map((_, idx) => (
            <div key={`offset-${idx}`} className={s.dayEmpty} />
          ))}

          {days.map((day) => {
            const dayDate = new Date(targetYear, targetMonthIndex, day);
            const isToday =
              day === today.getDate() &&
              targetMonthIndex === today.getMonth() &&
              targetYear === today.getFullYear();
            const key = formatDateKey(dayDate);
            const status = dayStatuses[key] || "none";
            const toneClass =
              status === "free"
                ? s.dayAvailable
                : status === "busy"
                ? s.dayBusy
                : isToday
                ? s.daySelected
                : s.dayNeutral;
            return (
              <button
                type="button"
                key={day}
                className={`${s.dayButton} ${toneClass}`}
                onClick={() => {
                  setSelectedDay({
                    day,
                    key,
                    label: dayDate.toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "long",
                    }),
                    weekdayIndex: dayDate.getDay(),
                  });
                  setPendingStatus(status);
                  setModalOpen(true);
                }}
              >
                {day}
              </button>
            );
          })}
        </div>
      </section>

      <section className={s.weekSection}>
        <h3 className={s.sectionTitle}>Эта неделя</h3>
        <div className={s.weekList}>
          {weekDays.map((day, idx) => (
            <div key={`${day.dateKey}-${idx}`} className={s.weekRow}>
              <span className={s.weekdayName}>{day.label}</span>
              <div
                className={`${s.selectWrap} ${
                  dayStatuses[day.dateKey] === "free"
                    ? s.selectWrapFree
                    : dayStatuses[day.dateKey] === "busy"
                    ? s.selectWrapBusy
                    : ""
                }`}
              >
                <select
                  className={s.weekSelect}
                  value={dayStatuses[day.dateKey] || "none"}
                  onChange={(e) => {
                    const value = e.target.value;
                    setDayStatuses((prev) => {
                      const next = { ...prev };
                      if (value === "none") {
                        delete next[day.dateKey];
                      } else {
                        next[day.dateKey] = value;
                      }
                      return next;
                    });
                    persistStatus(day.dateKey, value);
                  }}
                >
                  <option value="none">не выбрано</option>
                  <option value="free">свободен</option>
                  <option value="busy">занят</option>
                </select>
                <ChevronDown className={s.selectIcon} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={s.eventsSection}>
        <h3 className={s.sectionTitle}>Сегодня, {todayLabel}</h3>
        <div className={s.eventsList}>
          {todaysEvents.map((event) => (
            <div key={event.id} className={s.eventCard}>
              <div className={s.eventIcon}>{event.icon}</div>
              <div className={s.eventBody}>
                <p className={s.eventTitle}>{event.title}</p>
                <p className={s.eventSubtitle}>{event.subtitle}</p>
              </div>
              <ChevronRight className={s.eventChevron} />
            </div>
          ))}
        </div>
      </section>

      {modalOpen && selectedDay ? (
        <div className={s.modalOverlay} role="dialog" aria-modal="true">
          <button
            type="button"
            className={s.modalBackdrop}
            onClick={() => setModalOpen(false)}
            aria-label="Закрыть выбор статуса"
          />
          <div className={s.modalSheet}>
            <div className={s.modalHandle} />
            <h3 className={s.modalTitle}>Выберите статус на {selectedDay.label}</h3>
            <div className={s.statusList}>
              {statusOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={s.statusOption}
                  onClick={() => {
                    setPendingStatus(opt.value);
                    setDayStatuses((prev) => {
                      const next = { ...prev };
                      if (opt.value === "none") {
                        delete next[selectedDay.key];
                      } else {
                        next[selectedDay.key] = opt.value;
                      }
                      return next;
                    });
                    persistStatus(selectedDay.key, opt.value);
                    setModalOpen(false);
                  }}
                >
                  <input
                    type="radio"
                    name="status-radio"
                    value={opt.value}
                    checked={pendingStatus === opt.value}
                    onChange={() => {}}
                    className={s.statusInput}
                  />
                  <span
                    className={`${s.statusIcon} ${
                      opt.value === "free"
                        ? s.statusIconFree
                        : opt.value === "busy"
                        ? s.statusIconBusy
                        : s.statusIconNeutral
                    }`}
                  >
                    {opt.icon}
                  </span>
                  <div className={s.statusLabelWrap}>
                    <p className={s.statusLabel}>{opt.label}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
