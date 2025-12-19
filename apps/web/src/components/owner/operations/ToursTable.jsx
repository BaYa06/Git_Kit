import { useEffect, useMemo, useState } from 'react';

const RU_WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function formatTourDateRuShort(value) {
  if (!value || value === '—') return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  const parts = new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
  })
    .formatToParts(d)
    .reduce((acc, p) => {
      acc[p.type] = (acc[p.type] || '') + p.value;
      return acc;
    }, {});
  const day = String(parts.day || '').padStart(2, '0');
  const month = String(parts.month || '').replace('.', '').toLowerCase();
  return `${day}-${month}`;
}

function formatDateRuDayMonth(value) {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  const parts = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
  })
    .formatToParts(d)
    .reduce((acc, p) => {
      acc[p.type] = (acc[p.type] || '') + p.value;
      return acc;
    }, {});
  const day = String(parts.day || '').trim();
  const month = String(parts.month || '').replace('.', '').toLowerCase();
  return `${day} ${month}`;
}

function startOfWeekMonday(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  // JS: 0=Sun..6=Sat, want Monday start
  const offset = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - offset);
  return d;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function dateKey(value) {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseSignedFromPax(pax) {
  const left = String(pax || '').split('/')[0];
  const n = Number.parseInt(left, 10);
  return Number.isFinite(n) ? n : 0;
}

function getStatusBadge(status) {
  const styles = {
    active: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      label: 'В пути',
    },
    preparing: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      border: 'border-blue-200',
      label: 'Подготовка',
    },
    confirmed: {
      bg: 'bg-purple-100',
      text: 'text-purple-700',
      border: 'border-purple-200',
      label: 'Подтверждён',
    },
    draft: {
      bg: 'bg-slate-100',
      text: 'text-slate-600',
      border: 'border-slate-200',
      label: 'Черновик',
    },
    completed: {
      bg: 'bg-slate-200',
      text: 'text-slate-700',
      border: 'border-slate-300',
      label: 'Завершён',
    },
    canceled: {
      bg: 'bg-slate-100',
      text: 'text-slate-500',
      border: 'border-slate-200',
      label: 'Отменён',
    },
  };
  return styles[status] || styles.draft;
}

function getPaymentBadge(payment) {
  const styles = {
    paid: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
      label: 'Полностью',
    },
    due: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-100',
      label: 'Есть долг',
    },
    empty: {
      bg: 'bg-slate-100',
      text: 'text-slate-500',
      border: 'border-slate-200',
      label: 'Частично',
    },
  };
  return styles[payment] || styles.empty;
}

function getRiskBadge(risk) {
  const styles = {
    high: { icon: 'error', color: 'text-rose-600', label: 'Критический', bold: true },
    medium: { icon: 'warning', color: 'text-amber-600', label: 'Средний', bold: false },
    low: { icon: 'check_circle', color: 'text-slate-400', label: 'Низкий', bold: false },
    none: { icon: 'remove', color: 'text-slate-400', label: 'Нет', bold: false },
  };
  return styles[risk] || styles.none;
}

function getReadinessColor(current, total) {
  const percent = (current / total) * 100;
  if (percent >= 90) return { bar: 'bg-emerald-500', text: 'text-emerald-600' };
  if (percent >= 50) return { bar: 'bg-amber-500', text: 'text-amber-600' };
  if (percent >= 20) return { bar: 'bg-[#4f46e5]', text: 'text-[#4f46e5]' };
  return { bar: 'bg-slate-300', text: 'text-slate-400' };
}

function getRiskLineColor(risk) {
  switch (risk) {
    case 'high':
      return 'bg-rose-500';
    case 'medium':
      return 'bg-amber-500';
    case 'low':
      return 'bg-emerald-500';
    default:
      return 'bg-slate-200';
  }
}

function getStatusCardTone(status) {
  switch (status) {
    case 'active':
      return { border: 'border-emerald-200', stripe: 'bg-emerald-500' };
    case 'confirmed':
      return { border: 'border-purple-200', stripe: 'bg-purple-500' };
    case 'preparing':
      return { border: 'border-blue-200', stripe: 'bg-blue-500' };
    case 'draft':
      return { border: 'border-slate-200 border-dashed', stripe: 'bg-slate-300' };
    default:
      return { border: 'border-slate-200', stripe: 'bg-slate-300' };
  }
}

export default function ToursTable({ companyId, tours = [], onTourClick }) {
  const [activeTab, setActiveTab] = useState('list');
  const [currentPage, setCurrentPage] = useState(1);

  const [calendarView, setCalendarView] = useState('week'); // day | week | month
  const [calendarCursor, setCalendarCursor] = useState(() => startOfWeekMonday(new Date()));

  const [calendarTours, setCalendarTours] = useState([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarError, setCalendarError] = useState(null);

  const totalTours = tours.length;
  const risksBadge = tours.filter((t) => t.risk && t.risk !== 'none').length;

  const tabs = [
    { key: 'list', label: 'Список' },
    { key: 'calendar', label: 'Календарь' },
    { key: 'risks', label: 'Риски', badge: risksBadge },
  ];

  const calendarDays = useMemo(() => {
    if (calendarView === 'day') {
      const d = new Date(calendarCursor);
      d.setHours(0, 0, 0, 0);
      return [d];
    }

    if (calendarView === 'month') {
      const monthStart = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth(), 1);
      const gridStart = startOfWeekMonday(monthStart);
      return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
    }

    const weekStart = startOfWeekMonday(calendarCursor);
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [calendarCursor, calendarView]);

  const calendarDataTours = companyId ? calendarTours : tours;

  const toursByDay = useMemo(() => {
    return calendarDataTours.reduce((acc, t) => {
      const key = dateKey(t.date);
      if (!key) return acc;
      if (!acc[key]) acc[key] = [];
      acc[key].push(t);
      return acc;
    }, {});
  }, [calendarDataTours]);

  const rangeLabel = useMemo(() => {
    if (calendarView === 'month') {
      return new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' }).format(
        calendarCursor
      );
    }
    const start = calendarDays[0];
    const end = calendarDays[calendarDays.length - 1];
    return `${formatDateRuDayMonth(start)} — ${formatDateRuDayMonth(end)}`;
  }, [calendarCursor, calendarDays, calendarView]);

  const shiftCalendar = (dir) => {
    if (calendarView === 'day') {
      setCalendarCursor((d) => addDays(d, dir));
      return;
    }
    if (calendarView === 'month') {
      setCalendarCursor((d) => addMonths(d, dir));
      return;
    }
    setCalendarCursor((d) => addDays(d, dir * 7));
  };

  const onToday = () => {
    setCalendarCursor(startOfWeekMonday(new Date()));
  };

  // Fetch calendar tours for the visible range (uses existing owner operations endpoint)
  // This keeps current list/KPI logic untouched, and only powers Calendar tab.
  useEffect(() => {
    if (activeTab !== 'calendar') return;
    if (!companyId) return;

    const start = dateKey(calendarDays[0]);
    const end = dateKey(calendarDays[calendarDays.length - 1]);
    if (!start || !end) return;

    let ignore = false;
    setCalendarLoading(true);
    setCalendarError(null);

    fetch(
      `/api/v1/owner/operations?companyId=${encodeURIComponent(
        companyId
      )}&period=custom&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`,
      { credentials: 'include' }
    )
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(text || `Request failed: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (ignore) return;
        setCalendarTours(Array.isArray(data?.tours) ? data.tours : []);
      })
      .catch((e) => {
        if (ignore) return;
        setCalendarTours([]);
        setCalendarError(e?.message || 'Не удалось загрузить туры');
      })
      .finally(() => {
        if (ignore) return;
        setCalendarLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [activeTab, calendarDays, companyId]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden min-h-[500px]">
      {/* Tabs + Calendar Toolbar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex p-1 bg-slate-100 rounded-lg border border-slate-200">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-2 ${
                  activeTab === tab.key
                    ? 'bg-white text-slate-900 shadow-sm font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab.label}
                {!!tab.badge && tab.key === 'risks' && (
                  <span className="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded text-xs font-semibold">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {activeTab === 'calendar' && (
            <>
              <div className="w-px h-8 bg-slate-200 hidden md:block"></div>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex p-1 bg-slate-100 rounded-lg border border-slate-200">
                  {[
                    { key: 'day', label: 'День' },
                    { key: 'week', label: 'Неделя' },
                    { key: 'month', label: 'Месяц' },
                  ].map((v) => (
                    <button
                      key={v.key}
                      onClick={() => setCalendarView(v.key)}
                      className={`px-3 py-1.5 text-xs rounded transition-colors ${
                        calendarView === v.key
                          ? 'bg-white text-slate-900 shadow-sm font-semibold'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                  <button
                    onClick={() => shiftCalendar(-1)}
                    className="p-1 hover:bg-slate-50 rounded text-slate-500"
                    aria-label="Назад"
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <button
                    onClick={onToday}
                    className="px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded"
                  >
                    Сегодня
                  </button>
                  <button
                    onClick={() => shiftCalendar(1)}
                    className="p-1 hover:bg-slate-50 rounded text-slate-500"
                    aria-label="Вперёд"
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '18px' }}>
                    calendar_month
                  </span>
                  <span className="text-sm font-semibold text-slate-700">{rangeLabel}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* List */}
      {activeTab === 'list' && (
        <>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[120px]">
                    Дата / Время
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider min-w-[200px]">
                    Тур
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[90px]">
                    Туристы
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[110px]">
                    Статус
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Ответственный
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Гид
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Транспорт
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[160px]">
                    Готовность
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Оплаты
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[100px]">
                    Риск
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Прим.
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right w-[50px]">
                    ...
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tours.length === 0 && (
                  <tr>
                    <td className="px-4 py-10 text-sm text-slate-500" colSpan={12}>
                      Нет туров в выбранном периоде.
                    </td>
                  </tr>
                )}

                {tours.map((tour) => {
                  const statusBadge = getStatusBadge(tour.status);
                  const paymentBadge = getPaymentBadge(tour.payment);
                  const riskBadge = getRiskBadge(tour.risk);
                  const readinessColor = getReadinessColor(tour.readiness.current, tour.readiness.total);
                  const readinessPercent = (tour.readiness.current / tour.readiness.total) * 100;

                  return (
                    <tr
                      key={tour.id}
                      onClick={() => onTourClick?.(tour)}
                      className={`hover:bg-slate-50 transition-colors cursor-pointer group ${
                        tour.isHighRisk ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      <td className="px-4 py-3 align-center">
                        <p className="text-sm font-bold text-slate-900">
                          {formatTourDateRuShort(tour.date)}
                        </p>
                        <p className="text-xs text-slate-500">{tour.time || '—'}</p>
                      </td>
                      <td className="px-4 py-3 align-center">
                        <p className="text-sm font-medium text-[#4f46e5] hover:underline">{tour.name}</p>
                      </td>
                      <td className="px-4 py-3 align-center text-sm font-medium text-slate-900">{tour.pax}</td>
                      <td className="px-4 py-3 align-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${statusBadge.bg} ${statusBadge.text} text-xs font-medium border ${statusBadge.border}`}
                        >
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-center">
                        <div className="flex items-center gap-2">
                          <div className="size-6 rounded-full bg-slate-200 text-[10px] flex items-center justify-center font-bold text-slate-600">
                            {tour.responsible.initials}
                          </div>
                          <span className="text-xs text-slate-700">{tour.responsible.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-center">
                        {tour.guide ? (
                          <span className="text-xs text-slate-700">{tour.guide}</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-bold border border-rose-200 uppercase tracking-wide">
                            Не назначен
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 align-center">
                        {tour.transport?.name ? (
                          tour.transport.warning ? (
                            <div className="flex items-center gap-1 text-amber-600" title="Проверьте транспорт">
                              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                                warning
                              </span>
                              <span className="text-xs font-medium">{tour.transport.name}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-700">
                              {tour.transport.name}{' '}
                              <span className="text-slate-400">{tour.transport.plate}</span>
                            </span>
                          )
                        ) : (
                          <span className="text-xs text-slate-400 italic">Нет транспорта</span>
                        )}
                      </td>
                      <td className="px-4 py-3 align-center">
                        <div className="flex flex-col gap-1 w-full max-w-[140px]">
                          <div className="flex justify-between text-[10px] font-medium text-slate-500">
                            <span>
                              {readinessPercent >= 90
                                ? 'Готов'
                                : readinessPercent >= 10
                                  ? 'В процессе'
                                  : 'Старт'}
                            </span>
                            <span className={readinessColor.text}>
                              {tour.readiness.current}/{tour.readiness.total}
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${readinessColor.bar} rounded-full`}
                              style={{ width: `${Math.max(0, Math.min(100, readinessPercent))}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-center">
                        <span
                          className={`text-xs font-bold ${paymentBadge.text} ${paymentBadge.bg} px-2 py-0.5 rounded border ${paymentBadge.border}`}
                        >
                          {paymentBadge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-center">
                        <div className={`flex items-center gap-1 ${riskBadge.color}`}>
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                            {riskBadge.icon}
                          </span>
                          <span className={`text-xs ${riskBadge.bold ? 'font-bold' : ''}`}>{riskBadge.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-center">
                        <p
                          className={`text-xs truncate max-w-[150px] ${
                            tour.isHighRisk ? 'text-rose-500 font-medium' : 'text-slate-400'
                          }`}
                        >
                          {tour.notes}
                        </p>
                      </td>
                      <td className="px-4 py-3 align-center text-right">
                        <button className="text-slate-400 hover:text-slate-700">
                          <span className="material-symbols-outlined">more_horiz</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination (UI only) */}
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Показано {tours.length} из {totalTours} туров
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-white border border-slate-200 rounded text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
              >
                Назад
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-3 py-1 bg-white border border-slate-200 rounded text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Вперёд
              </button>
            </div>
          </div>
        </>
      )}

      {/* Calendar (UI only for now) */}
      {activeTab === 'calendar' && (
        <div className="flex-1 overflow-y-auto bg-slate-100 p-4">
          {calendarLoading && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 text-sm text-slate-500 mb-4">
              Загрузка...
            </div>
          )}
          {!calendarLoading && calendarError && (
            <div className="bg-white border border-rose-200 text-rose-700 rounded-xl p-4 text-sm mb-4">
              Ошибка: {calendarError}
            </div>
          )}
          <div
            className={`min-h-full grid gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden ring-1 ring-slate-200 shadow-sm ${
              calendarView === 'day' ? 'grid-cols-1' : 'grid-cols-7'
            }`}
          >
            {calendarDays.map((day, idx) => {
              const key = dateKey(day);
              const dayTours = toursByDay[key] || [];
              const paxSum = dayTours.reduce((s, t) => s + parseSignedFromPax(t.pax), 0);
              const weekdayIndex = (day.getDay() + 6) % 7;
              const isToday = key === dateKey(new Date());

              return (
                <div key={key || idx} className="bg-white flex flex-col min-h-[300px]">
                  <div
                    className={`sticky top-0 z-10 border-b p-2 text-center shadow-sm ${
                      isToday ? 'bg-blue-50/50 border-blue-100' : 'bg-white border-slate-100'
                    }`}
                  >
                    <span className={`block text-xs font-semibold uppercase ${isToday ? 'text-[#4f46e5]' : 'text-slate-500'}`}>
                      {RU_WEEKDAYS[weekdayIndex]}
                    </span>
                    <span className={`block text-lg font-bold leading-tight ${isToday ? 'text-[#4f46e5]' : 'text-slate-900'}`}>
                      {formatDateRuDayMonth(day)}
                    </span>
                    <div className="flex items-center justify-center gap-1 mt-1 text-[10px] text-slate-400 font-medium">
                      <span>{dayTours.length ? `${dayTours.length} тур(ов)` : 'Нет туров'}</span>
                      {dayTours.length > 0 && (
                        <>
                          <span>•</span>
                          <span>{paxSum} туристов</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 p-2 flex flex-col gap-2 bg-slate-50/30">
                    {dayTours.length === 0 && (
                      <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                        Нет туров
                      </div>
                    )}

                    {dayTours.map((tour) => {
                      const paymentBadge = getPaymentBadge(tour.payment);
                      const statusTone = getStatusCardTone(tour.status);
                      const readinessColor = getReadinessColor(tour.readiness.current, tour.readiness.total);
                      const readinessPercent = (tour.readiness.current / tour.readiness.total) * 100;
                      const riskLine = getRiskLineColor(tour.risk);

                      return (
                        <div
                          key={tour.id}
                          onClick={() => onTourClick?.(tour)}
                          className={`bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden ${statusTone.border}`}
                        >
                          <div className={`absolute left-0 top-0 h-full w-1 ${statusTone.stripe}`}></div>
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <div className="font-mono text-xs font-bold text-slate-700 pl-2">{tour.time || '—'}</div>
                          </div>

                          <h4 className="text-sm font-semibold text-slate-900 leading-tight mb-2 group-hover:text-[#4f46e5] transition-colors pl-2">
                            {tour.name}
                          </h4>

                          <div className="text-xs text-slate-500 space-y-1 mb-3 pl-2">
                            <div className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '14px' }}>
                                groups
                              </span>
                              <span>Туристы: {tour.pax}</span>
                            </div>
                            {tour.guide && (
                              <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '14px' }}>
                                  person
                                </span>
                                <span>Гид: {tour.guide}</span>
                              </div>
                            )}
                            {tour.transport?.name && (
                              <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '14px' }}>
                                  directions_bus
                                </span>
                                <span>
                                  Транспорт: {tour.transport.name}
                                  {tour.transport.plate ? ` ${tour.transport.plate}` : ''}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="mt-auto pl-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-[10px] font-bold ${paymentBadge.text} ${paymentBadge.bg} px-1.5 rounded border ${paymentBadge.border}`}>
                                {paymentBadge.label}
                              </span>
                            </div>
                            <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${readinessColor.bar} rounded-full`}
                                style={{ width: `${Math.max(0, Math.min(100, readinessPercent))}%` }}
                              />
                            </div>
                            <div className={`mt-1 h-0.5 w-full ${riskLine} rounded-full`}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="h-10"></div>
        </div>
      )}

      {/* Risks (UI placeholder) */}
      {activeTab === 'risks' && (
        <div className="flex-1 overflow-y-auto bg-white p-6">
          <h3 className="text-sm font-bold text-slate-900">Риски</h3>
          <p className="text-sm text-slate-500 mt-1">Пока только UI. Бекенд подключим позже.</p>
        </div>
      )}
    </div>
  );
}
