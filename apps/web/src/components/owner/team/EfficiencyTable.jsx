import { useState } from 'react';

const avatarColors = [
  'bg-purple-100 text-purple-600',
  'bg-blue-100 text-blue-600',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-indigo-100 text-indigo-700',
  'bg-slate-100 text-slate-600',
];

const formatNumber = (value) => {
  const num = Number(value || 0);
  try {
    return new Intl.NumberFormat('ru-RU').format(num);
  } catch {
    return String(num);
  }
};

const formatAvgCheck = (value) => {
  const num = Number(value || 0);
  const rounded = Number.isFinite(num) ? Math.round(num) : 0;
  return formatNumber(rounded);
};

const initialsFromName = (name, fallback = '—') => {
  const str = String(name || '').trim();
  if (!str) return fallback;

  const parts = str
    .split(/\s+/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length === 0) return fallback;
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

export default function EfficiencyTable({ managers, guides }) {
  const [activeTab, setActiveTab] = useState('managers');

  const tabs = [
    { id: 'managers', label: 'Менеджеры' },
    { id: 'guides', label: 'Гиды' },
    { id: 'coordinators', label: 'Координаторы' },
    { id: 'drivers', label: 'Водители' },
  ];

  const isManagers = activeTab === 'managers';
  const isGuides = activeTab === 'guides';

  const managersRows = Array.isArray(managers) ? managers : null;
  const guidesRows = Array.isArray(guides) ? guides : null;
  const isLoading = managersRows === null && guidesRows === null;

  const selectedRows = isManagers ? managersRows || [] : isGuides ? guidesRows || [] : [];

  return (
    <div className="bg-white rounded-xl border border-[#e0e0e4] shadow-sm flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#f0f0f4] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-[#111118]">Топ по эффективности</h3>
        <div className="flex bg-[#f6f6f8] p-1 rounded-lg self-start">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-primary font-semibold shadow-sm'
                  : 'text-[#616189] hover:text-[#111118]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#fcfcfd] border-b border-[#f0f0f4]">
              <th className="sticky top-0 z-10 bg-[#fcfcfd] px-6 py-3 text-xs font-semibold text-[#616189] uppercase tracking-wider">
                Сотрудник
              </th>

              {isManagers ? (
                <>
                  <th className="sticky top-0 z-10 bg-[#fcfcfd] px-6 py-3 text-xs font-semibold text-[#616189] uppercase tracking-wider text-right">
                    Лиды
                  </th>
                  <th className="sticky top-0 z-10 bg-[#fcfcfd] px-6 py-3 text-xs font-semibold text-[#616189] uppercase tracking-wider text-right">
                    Продажи
                  </th>
                  <th className="sticky top-0 z-10 bg-[#fcfcfd] px-6 py-3 text-xs font-semibold text-[#616189] uppercase tracking-wider text-right">
                    Конв.
                  </th>
                  <th className="sticky top-0 z-10 bg-[#fcfcfd] px-6 py-3 text-xs font-semibold text-[#616189] uppercase tracking-wider text-right">
                    Ср. чек
                  </th>
                  <th className="sticky top-0 z-10 bg-[#fcfcfd] px-6 py-3 text-xs font-semibold text-[#616189] uppercase tracking-wider text-right">
                    SLA
                  </th>
                  <th className="sticky top-0 z-10 bg-[#fcfcfd] px-6 py-3 text-xs font-semibold text-[#616189] uppercase tracking-wider text-right">
                    План
                  </th>
                  <th className="sticky top-0 z-10 bg-[#fcfcfd] px-6 py-3 text-xs font-semibold text-[#616189] uppercase tracking-wider text-center">
                    Риск
                  </th>
                  <th className="sticky top-0 z-10 bg-[#fcfcfd] px-6 py-3 text-xs font-semibold text-[#616189] uppercase tracking-wider">
                    Статус
                  </th>
                </>
              ) : isGuides ? (
                <>
                  <th className="sticky top-0 z-10 bg-[#fcfcfd] px-6 py-3 text-xs font-semibold text-[#616189] uppercase tracking-wider text-right">
                    Туров
                  </th>
                  <th className="sticky top-0 z-10 bg-[#fcfcfd] px-6 py-3 text-xs font-semibold text-[#616189] uppercase tracking-wider text-right">
                    Рейтинг
                  </th>
                  <th className="sticky top-0 z-10 bg-[#fcfcfd] px-6 py-3 text-xs font-semibold text-[#616189] uppercase tracking-wider text-right">
                    Жалобы
                  </th>
                </>
              ) : (
                <th className="sticky top-0 z-10 bg-[#fcfcfd] px-6 py-3 text-xs font-semibold text-[#616189] uppercase tracking-wider">
                  —
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0f0f4] text-sm">
            {!isManagers && !isGuides ? (
              <tr>
                <td className="px-6 py-8 text-sm text-[#616189]" colSpan={2}>
                  Этот раздел пока в разработке
                </td>
              </tr>
            ) : isLoading ? (
              <tr>
                <td className="px-6 py-8 text-sm text-[#616189]" colSpan={isManagers ? 9 : isGuides ? 4 : 2}>
                  Загрузка данных…
                </td>
              </tr>
            ) : selectedRows.length === 0 ? (
              <tr>
                <td className="px-6 py-8 text-sm text-[#616189]" colSpan={isManagers ? 9 : isGuides ? 4 : 2}>
                  Нет данных за выбранный период
                </td>
              </tr>
            ) : isManagers ? (
              (selectedRows || []).map((row, index) => {
                const fullName =
                  [row.firstName, row.lastName].filter(Boolean).join(' ') || row.email || '—';
                const initials =
                  initialsFromName([row.firstName, row.lastName].filter(Boolean).join(' '), null) ||
                  initialsFromName(row.email, '—');
                const color = avatarColors[index % avatarColors.length];
                const salesPeople = Number(row.salesPeople || 0);
                const revenue = Number(row.revenue || 0);
                const avgCheck = salesPeople > 0 ? revenue / salesPeople : 0;

                return (
                  <tr key={row.id} className="group hover:bg-[#f8f8fa] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`size-10 rounded-full ${color} flex items-center justify-center font-bold`}>
                          {initials}
                        </div>
                        <div>
                          <p className="font-semibold text-[#111118]">{fullName}</p>
                          <p className="text-xs text-[#616189]">{row.email || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right tabular-nums text-[#616189]">0</td>
                    <td className="px-6 py-4 text-right tabular-nums font-medium text-[#111118]">
                      {formatNumber(salesPeople)}
                    </td>
                    <td className="px-6 py-4 text-right tabular-nums font-bold text-[#616189]">0%</td>
                    <td className="px-6 py-4 text-right tabular-nums text-[#111118]">{formatAvgCheck(avgCheck)}</td>
                    <td className="px-6 py-4 text-right tabular-nums text-[#616189]">0</td>
                    <td className="px-6 py-4 text-right tabular-nums text-[#616189]">0</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block size-2 rounded-full bg-emerald-400" />
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                        Активен
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : isGuides ? (
              (selectedRows || []).map((row, index) => {
                const fullName = row.fullName || '—';
                const initials = initialsFromName(fullName, '—');
                const color = avatarColors[index % avatarColors.length];
                const avgRating =
                  row.avgRating === null || row.avgRating === undefined
                    ? null
                    : Number(row.avgRating);
                const ratingLabel = avgRating === null || Number.isNaN(avgRating) ? '—' : avgRating.toFixed(1);
                const ratingColor =
                  avgRating === null
                    ? 'text-[#616189]'
                    : avgRating >= 4.5
                      ? 'text-emerald-600'
                      : avgRating >= 3.5
                        ? 'text-amber-600'
                        : 'text-rose-600';
                const subtitle = row.telegram || row.phone || row.email || '—';

                return (
                  <tr key={row.id} className="group hover:bg-[#f8f8fa] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`size-10 rounded-full ${color} flex items-center justify-center font-bold`}>
                          {initials}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-[#111118]">{fullName}</p>
                            {row.isActive === false && (
                              <span className="text-[10px] font-bold text-[#616189] bg-[#f6f6f8] px-2 py-0.5 rounded-full border border-[#e0e0e4]">
                                Неактивен
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#616189]">{subtitle}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right tabular-nums font-medium text-[#111118]">
                      {formatNumber(Number(row.toursCount || 0))}
                    </td>
                    <td className={`px-6 py-4 text-right tabular-nums font-bold ${ratingColor}`}>
                      {ratingLabel}
                    </td>
                    <td className="px-6 py-4 text-right tabular-nums font-medium text-[#111118]">
                      {formatNumber(Number(row.complaints || 0))}
                    </td>
                  </tr>
                );
              })
            ) : null}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-3 border-t border-[#f0f0f4] bg-[#fcfcfd] flex items-center justify-between text-xs text-[#616189]">
        <span>
          {isManagers
            ? `Показано ${formatNumber(selectedRows.length)} сотрудников`
            : isGuides
              ? `Показано ${formatNumber(selectedRows.length)} гидов`
              : `Показано ${formatNumber(selectedRows.length)} записей`}
        </span>
        <div className="flex gap-2">
          <button
            className="px-2 py-1 rounded hover:bg-white border border-transparent hover:border-[#e0e0e4] disabled:opacity-50"
            disabled
          >
            Предыдущая
          </button>
          <button className="px-2 py-1 rounded hover:bg-white border border-transparent hover:border-[#e0e0e4]">
            Следующая
          </button>
        </div>
      </div>
    </div>
  );
}
