import { useEffect, useMemo, useState } from 'react';

const formatNumber = (value) => {
  try {
    return new Intl.NumberFormat('ru-RU').format(value);
  } catch {
    return String(value);
  }
};

const StarRating = ({ rating }) => {
  if (typeof rating !== 'number') {
    return <span className="text-slate-400 text-xs">Нет рейтинга</span>;
  }

  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.25 && rating - fullStars < 0.75;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex text-amber-400 text-[14px]">
        {Array.from({ length: fullStars }).map((_, idx) => (
          <span key={`full-${idx}`} className="material-symbols-outlined icon-fill">
            star
          </span>
        ))}
        {hasHalf ? (
          <span className="material-symbols-outlined icon-fill">star_half</span>
        ) : null}
        {Array.from({ length: emptyStars }).map((_, idx) => (
          <span
            key={`empty-${idx}`}
            className="material-symbols-outlined icon-fill text-slate-300"
          >
            star
          </span>
        ))}
      </div>
      <span
        className={[
          'font-bold',
          rating >= 4.5 ? 'text-emerald-600' : 'text-slate-700',
        ].join(' ')}
      >
        {rating.toFixed(1)}
      </span>
    </div>
  );
};

export default function TeamGuidesContent({
  companyId,
  period = '30days',
  search = '',
  isCreateGuideOpen,
  onCloseCreateGuide,
}) {
  const [guides, setGuides] = useState([]);
  const [stats, setStats] = useState(null);
  const [topByRating, setTopByRating] = useState([]);
  const [needsAttention, setNeedsAttention] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const periodLabel = useMemo(() => {
    switch (period) {
      case '7days':
        return 'за 7 дней';
      case '30days':
        return 'за 30 дней';
      case 'quarter':
        return 'за 90 дней';
      case 'custom':
        return 'за период';
      default:
        return 'за 30 дней';
    }
  }, [period]);

  const monthShortRu = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

  const formatShortDate = (isoDate) => {
    if (!isoDate) return null;
    const parts = String(isoDate).slice(0, 10).split('-');
    if (parts.length !== 3) return String(isoDate);
    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);
    if (!year || !month || !day) return String(isoDate);
    const monthLabel = monthShortRu[month - 1] || String(month);
    return `${day} ${monthLabel}`;
  };

  const toLanguageCodes = (langs) => {
    const list = Array.isArray(langs) ? langs : [];
    const map = (value) => {
      const v = String(value || '').trim().toLowerCase();
      if (!v) return null;
      if (v.includes('рус')) return 'RU';
      if (v.includes('eng') || v.includes('англ')) return 'EN';
      if (v.includes('de') || v.includes('нем')) return 'DE';
      if (v.includes('кырг') || v.includes('kyr')) return 'KG';
      if (v.length <= 3) return v.toUpperCase();
      return value;
    };

    const out = list.map(map).filter(Boolean);
    if (out.length <= 3) return out;
    return [...out.slice(0, 2), `+${out.length - 2}`];
  };

  const initialsFromName = (name, fallback = '—') => {
    const str = String(name || '').trim();
    if (!str) return fallback;
    const parts = str.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  };

  useEffect(() => {
    const load = async () => {
      if (!companyId) return;
      setLoading(true);
      setLoadError(null);

      try {
        const url = new URL('/api/v1/owner/team-guides', window.location.origin);
        url.searchParams.set('companyId', companyId);
        url.searchParams.set('period', period);
        if (search) url.searchParams.set('search', search);

        const res = await fetch(url.toString());
        if (!res.ok) {
          let data = {};
          try {
            data = await res.json();
          } catch {}
          throw new Error(data?.error || `Ошибка ${res.status}`);
        }

        const data = await res.json();
        const rows = Array.isArray(data.guides) ? data.guides : [];

        setStats(data.stats || null);

        const mapped = rows.map((row) => {
          const name = row.fullName || row.email || '—';
          const initials = initialsFromName(name);
          const isActive = Boolean(row.isActive);
          const rating =
            row.avgRating === null || row.avgRating === undefined ? null : Number(row.avgRating);
          const nextTour = row.nextTour
            ? {
                date: formatShortDate(row.nextTour.date),
                title: row.nextTour.name || 'Тур',
              }
            : null;

          return {
            id: row.id,
            initials,
            avatarUrl: row.logoUrl || null,
            avatarClass: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
            name,
            phone: row.phone || '—',
            telegram: row.telegram || null,
            status: isActive ? 'Активен' : 'Неактивен',
            statusClass: isActive
              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
              : 'bg-slate-100 text-slate-600 border-slate-200',
            languages: toLanguageCodes(row.languages),
            toursCount: Number(row.toursCount || 0),
            nextTour,
            rating,
            complaints: Number(row.complaints || 0),
            complaintsActive: Number(row.complaints || 0) > 0,
            incidents: 0,
            activity: '—',
            muted: !isActive,
          };
        });

        setGuides(mapped);

        const topRated = Array.isArray(data.topRated) ? data.topRated : [];
        setTopByRating(
          topRated.slice(0, 3).map((entry) => {
            const name = entry.fullName || '—';
            const rating = Number(entry.avgRating || 0);
            const roundedToHalf = Math.round(rating * 2) / 2;
            const fullStars = Math.floor(roundedToHalf);
            const hasHalf = roundedToHalf - fullStars === 0.5;
            return {
              id: entry.id,
              initials: initialsFromName(name),
              name,
              tours: Number(entry.toursCount || 0),
              stars: Math.max(0, Math.min(5, fullStars)),
              half: hasHalf,
              rating,
            };
          })
        );

        const attention = Array.isArray(data.needsAttention) ? data.needsAttention : [];
        setNeedsAttention(
          attention.map((item) => {
            const name = item.fullName || '—';
            const rating = Number(item.avgRating || 0);
            const critical = rating < 3.5;
            const badge = critical
              ? { label: 'Критично', className: 'text-rose-600 bg-rose-50' }
              : { label: 'Внимание', className: 'text-amber-700 bg-amber-50' };

            return {
              id: item.id,
              initials: initialsFromName(name),
              initialsClass: critical ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-700',
              name,
              badge,
              text: (
                <>
                  Рейтинг: <span className={critical ? 'font-semibold text-rose-600' : 'font-semibold'}>{rating.toFixed(1)}</span>
                  {typeof item.complaints === 'number' && item.complaints > 0 ? (
                    <> · Жалобы: <span className="font-semibold text-rose-600">{formatNumber(item.complaints)}</span></>
                  ) : null}
                </>
              ),
            };
          })
        );
      } catch (e) {
        setStats(null);
        setGuides([]);
        setTopByRating([]);
        setNeedsAttention([]);
        setLoadError(e.message || 'Ошибка загрузки');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [companyId, period, search]);

  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const selectedCount = selectedIds.size;
  const allSelected = guides.length > 0 && guides.every((g) => selectedIds.has(g.id));

  const toggleRow = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(guides.map((g) => g.id)));
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-primary/20 transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wide">
              Активных гидов
            </span>
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                hiking
              </span>
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {formatNumber(Number(stats?.activeGuides || 0))}
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Всего в базе: {formatNumber(Number(stats?.totalGuides || 0))}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-primary/20 transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wide">
              Туров за период
            </span>
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                flag
              </span>
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {formatNumber(Number(stats?.toursInPeriod || 0))}
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-1">{periodLabel}</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-primary/20 transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wide">
              Средняя оценка
            </span>
            <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <span className="material-symbols-outlined icon-fill" style={{ fontSize: '20px' }}>
                star
              </span>
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {typeof stats?.avgGuideRating === 'number' ? stats.avgGuideRating.toFixed(1) : '—'}
            </span>
            <span className="text-xs font-medium text-slate-500 flex items-center gap-0.5">
              <span
                className="material-symbols-outlined text-amber-400 icon-fill"
                style={{ fontSize: '12px' }}
              >
                star
              </span>
              из 5.0
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            На основе {formatNumber(Number(stats?.ratingsCount || 0))} отзывов
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-primary/20 transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wide">
              Жалобы
            </span>
            <span className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                report_problem
              </span>
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {formatNumber(Number(stats?.complaints || 0))}
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-1">Оценки 2 или 1</div>
        </div>
      </div>

      {isCreateGuideOpen ? (
        <div className="bg-white rounded-xl border border-indigo-200 shadow-[0_4px_20px_-4px_rgba(79,70,229,0.1)] overflow-hidden">
          <div className="px-6 py-4 border-b border-indigo-100 bg-indigo-50/30 flex justify-between items-center">
            <h3 className="font-bold text-indigo-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-600">person_add</span>
              Новый гид
            </h3>
            <button
              type="button"
              onClick={onCloseCreateGuide}
              className="text-indigo-400 hover:text-indigo-700 transition-colors"
              aria-label="Закрыть"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Имя
                    </label>
                    <input
                      className="w-full text-sm rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                      placeholder="Иван"
                      type="text"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Фамилия
                    </label>
                    <input
                      className="w-full text-sm rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                      placeholder="Иванов"
                      type="text"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Телефон
                  </label>
                  <input
                    className="w-full text-sm rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                    placeholder="+996 (___) __-__-__"
                    type="text"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Telegram (ник / ID)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      @
                    </span>
                    <input
                      className="w-full pl-7 text-sm rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                      placeholder="ник"
                      type="text"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Языки
                  </label>
                  <div className="flex flex-wrap gap-2 p-2 border border-slate-200 rounded-lg bg-slate-50">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-indigo-100 text-indigo-700 text-xs font-medium">
                      Русский{' '}
                      <button type="button" className="hover:text-indigo-900">
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-indigo-100 text-indigo-700 text-xs font-medium">
                      Английский{' '}
                      <button type="button" className="hover:text-indigo-900">
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </span>
                    <button
                      type="button"
                      className="text-xs text-slate-500 hover:text-indigo-600 font-medium px-2 py-1 border border-dashed border-slate-300 rounded hover:border-indigo-400 flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">add</span>
                      Добавить
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Регионы / направления
                  </label>
                  <select className="w-full text-sm rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm">
                    <option>Выберите направления...</option>
                    <option>Иссык-Куль</option>
                    <option>Чуйская область</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <input
                      defaultChecked
                      className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                      type="checkbox"
                    />
                    <label className="text-sm text-slate-700 font-medium">
                      Активен
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                      type="checkbox"
                    />
                    <label className="text-sm text-slate-700">
                      Отправить приглашение
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onCloseCreateGuide}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Отмена
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-colors"
              >
                Создать гида
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col">
        <div className="p-4 border-b border-slate-200 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-sm font-semibold text-slate-700">
              Выбрано: <span className="text-primary">{selectedCount}</span>
            </div>
            <div className="h-6 w-px bg-slate-200"></div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={selectedCount === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[16px]">block</span>
                Деактивировать
              </button>
              <button
                type="button"
                disabled={selectedCount === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[16px]">lock_reset</span>
                Сбросить доступ
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <select className="appearance-none pl-3 pr-8 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-indigo-500">
                <option>Статус: Все</option>
                <option>Активен</option>
                <option>Неактивен</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-[16px] pointer-events-none">
                expand_more
              </span>
            </div>

            <div className="relative">
              <button
                type="button"
                className="flex items-center gap-2 pl-3 pr-2 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100"
              >
                Языки
                <span className="bg-slate-200 px-1.5 rounded text-[10px]">
                  3
                </span>
                <span className="material-symbols-outlined text-slate-400 text-[16px]">
                  expand_more
                </span>
              </button>
            </div>

            <div className="relative">
              <select className="appearance-none pl-3 pr-8 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-indigo-500">
                <option>Направление: Все</option>
                <option>Чуй</option>
                <option>Иссык-Куль</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-[16px] pointer-events-none">
                expand_more
              </span>
            </div>

            <div className="relative">
              <select className="appearance-none pl-3 pr-8 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-indigo-500">
                <option>Рейтинг: Все</option>
                <option>Высокий (4.5+)</option>
                <option>Средний (4.0-4.5)</option>
                <option>Низкий (&lt; 4.0)</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-[16px] pointer-events-none">
                expand_more
              </span>
            </div>

            <button
              type="button"
              className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
              title="Сортировка"
            >
              <span className="material-symbols-outlined text-[20px]">sort</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="sticky top-0 z-10 bg-slate-50/80 px-4 py-3 w-10 text-center">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="Выбрать всех"
                  />
                </th>
                <th className="sticky top-0 z-10 bg-slate-50/80 px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Гид
                </th>
                <th className="sticky top-0 z-10 bg-slate-50/80 px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="sticky top-0 z-10 bg-slate-50/80 px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Языки
                </th>
                <th className="sticky top-0 z-10 bg-slate-50/80 px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Туров
                </th>
                <th className="sticky top-0 z-10 bg-slate-50/80 px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Ближайший
                </th>
                <th className="sticky top-0 z-10 bg-slate-50/80 px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Рейтинг
                </th>
                <th className="sticky top-0 z-10 bg-slate-50/80 px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                  Жалобы
                </th>
                <th className="sticky top-0 z-10 bg-slate-50/80 px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                  Инциденты
                </th>
                <th className="sticky top-0 z-10 bg-slate-50/80 px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Активность
                </th>
                <th className="sticky top-0 z-10 bg-slate-50/80 px-4 py-3 w-20"></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td className="px-4 py-8 text-sm text-slate-500" colSpan={11}>
                    Загрузка гидов…
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td className="px-4 py-8 text-sm text-rose-600" colSpan={11}>
                    {loadError}
                  </td>
                </tr>
              ) : guides.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-sm text-slate-500" colSpan={11}>
                    Гиды не найдены
                  </td>
                </tr>
              ) : guides.map((guide) => {
                const isSelected = selectedIds.has(guide.id);

                return (
                  <tr
                    key={guide.id}
                    className="group hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        checked={isSelected}
                        onChange={() => toggleRow(guide.id)}
                        aria-label={`Выбрать ${guide.name}`}
                      />
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {guide.avatarUrl ? (
                          <div
                            className="size-9 rounded-full bg-cover bg-center border border-slate-200"
                            style={{ backgroundImage: `url('${guide.avatarUrl}')` }}
                          ></div>
                        ) : (
                          <div
                            className={`size-9 rounded-full ${guide.avatarClass} flex items-center justify-center text-xs font-bold`}
                          >
                            {guide.initials}
                          </div>
                        )}

                        <div className={guide.muted ? 'opacity-50' : ''}>
                          <p className="font-semibold text-slate-900">{guide.name}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>{guide.phone}</span>
                            {guide.telegram ? (
                              <span className="text-indigo-500 bg-indigo-50 px-1 rounded text-[10px]">
                                {guide.telegram}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${guide.statusClass}`}
                      >
                        {guide.status}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex gap-1">
                        {guide.languages.map((lang) => (
                          <span
                            key={`${guide.id}-${lang}`}
                            className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-xs rounded border border-slate-200"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-slate-700 tabular-nums font-medium">
                      {formatNumber(guide.toursCount)}
                    </td>

                    <td className="px-4 py-4">
                      {guide.nextTour ? (
                        <div className="text-xs">
                          <p className="font-medium text-slate-900">{guide.nextTour.date}</p>
                          <p className="text-slate-500">{guide.nextTour.title}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <StarRating rating={guide.rating} />
                    </td>

                    <td className="px-4 py-4 text-center">
                      {guide.complaints > 0 ? (
                        <div className="inline-flex items-center gap-1 bg-rose-50 px-2 py-1 rounded-full border border-rose-100">
                          <span className="text-rose-700 font-bold text-xs">
                            {guide.complaints}
                          </span>
                          {guide.complaintsActive ? (
                            <span className="block size-1.5 bg-rose-500 rounded-full animate-pulse"></span>
                          ) : null}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">0</span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-center">
                      <span className="text-slate-400 text-xs">
                        {guide.incidents}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-xs text-slate-500">{guide.activity}</td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                          title="Редактировать"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          type="button"
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded"
                          title="Удалить"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>
            Показано {formatNumber(guides.length)} из{' '}
            {formatNumber(Number(stats?.totalGuides || guides.length))} гидов
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              className="px-2 py-1 rounded hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-50"
              disabled
            >
              Предыдущая
            </button>
            <button
              type="button"
              className="px-2 py-1 rounded hover:bg-white border border-transparent hover:border-slate-200"
            >
              Следующая
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-6">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <h3 className="text-lg font-bold mb-4 relative z-10 flex items-center gap-2">
            <span className="material-symbols-outlined icon-fill text-yellow-300">
              workspace_premium
            </span>
            Топ по оценкам
          </h3>

          <div className="space-y-4 relative z-10">
            {topByRating.length === 0 ? (
              <div className="text-sm text-indigo-100">Нет оценок для отображения</div>
            ) : topByRating.slice(0, 3).map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between bg-white/10 p-3 rounded-lg backdrop-blur-sm hover:bg-white/20 transition-colors cursor-pointer border border-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-white text-indigo-700 font-bold flex items-center justify-center text-xs">
                    {entry.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{entry.name}</p>
                    <p className="text-[10px] text-indigo-200">
                      {formatNumber(entry.tours)} туров
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex text-yellow-300 text-[12px]">
                    {Array.from({ length: entry.stars }).map((_, idx) => (
                      <span key={idx} className="material-symbols-outlined icon-fill">
                        star
                      </span>
                    ))}
                    {entry.half ? (
                      <span className="material-symbols-outlined icon-fill">star_half</span>
                    ) : null}
                  </div>
                  <span className="text-xs font-bold">{entry.rating.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-rose-100 shadow-sm flex flex-col">
          <div className="px-6 py-4 border-b border-rose-50 bg-rose-50/30">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-500">warning</span>
              <h3 className="text-lg font-bold text-slate-900">Требуют внимания</h3>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {needsAttention.length === 0 ? (
              <div className="px-6 py-8 text-sm text-slate-500">Пока всё хорошо</div>
            ) : needsAttention.map((item) => (
              <div
                key={item.id}
                className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <div
                  className={`size-10 rounded-full ${item.initialsClass} flex items-center justify-center font-bold text-xs flex-shrink-0`}
                >
                  {item.initials}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-900">{item.name}</p>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${item.badge.className}`}
                    >
                      {item.badge.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{item.text}</p>
                </div>
                <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">
                  chevron_right
                </span>
              </div>
            ))}
          </div>

          <div className="p-3 mt-auto border-t border-slate-100 bg-slate-50/50 text-center">
            <button
              type="button"
              className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
            >
              Показать всех проблемных
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
