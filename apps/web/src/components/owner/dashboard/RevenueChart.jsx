import { useMemo, useState } from 'react';

function formatLabel(item) {
  // Если в данных уже есть label (для недель и месяцев), используем его
  if (item.label) return item.label;
  
  // Для дней форматируем дату
  const dateStr = item.date;
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' });
}

export default function RevenueChart({ series = [], loading = false, periodLabel = '' }) {
  const [activeTab, setActiveTab] = useState('revenue');

  const data = Array.isArray(series) ? series : [];
  const maxValue = useMemo(() => {
    const values = data.map((d) => Number(d.value) || 0);
    const max = values.length ? Math.max(...values) : 0;
    return max > 0 ? max : 1;
  }, [data]);

  const bars = useMemo(() => {
    if (!data.length) return [];
    return data.map((item) => {
      const value = Number(item.value) || 0;
      const height = Math.round((value / maxValue) * 100);
      return {
        ...item,
        height: Number.isFinite(height) ? Math.min(Math.max(height, 0), 100) : 0,
        label: formatLabel(item),
      };
    });
  }, [data, maxValue]);

  const tabs = [
    { key: 'revenue', label: 'Выручка' },
    { key: 'profit', label: 'Прибыль' },
    { key: 'pax', label: 'PAX' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#f0f0f4] p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-[#111118] text-lg font-bold">Динамика выручки</h3>
          {periodLabel ? <p className="text-xs text-[#616189] mt-1">Период: {periodLabel}</p> : null}
        </div>
        <div className="flex bg-[#f0f0f4] rounded-lg p-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1 rounded-md text-xs transition-colors ${
                activeTab === tab.key
                  ? 'bg-white text-[#111118] font-bold shadow-sm'
                  : 'text-[#616189] hover:text-[#111118] font-medium'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-[250px] w-full animate-pulse bg-gray-100 rounded-lg" />
      ) : bars.length === 0 ? (
        <div className="h-[250px] flex items-center justify-center text-sm text-[#616189]">
          Нет данных за выбранный период
        </div>
      ) : (
        <div className="h-[250px] w-full flex items-end gap-2 relative">
          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-[#616189] pr-2 border-r border-dashed border-gray-200 h-full w-10">
            <span>{Math.round(maxValue) || 0}</span>
            <span>{Math.round(maxValue * 0.75)}</span>
            <span>{Math.round(maxValue * 0.5)}</span>
            <span>{Math.round(maxValue * 0.25)}</span>
            <span>0</span>
          </div>

          <div className="ml-12 flex-1 h-full flex items-end justify-between gap-1 pb-6 pt-4">
            {bars.map((bar, index) => (
              <div
                key={bar.date || index}
                className={`flex-1 rounded-t-sm transition-all relative group cursor-pointer ${
                  index === bars.length - 1
                    ? 'bg-[#1313ec] hover:bg-[#1313ec]/90 shadow-lg shadow-[#1313ec]/30'
                    : 'bg-[#1313ec]/10 hover:bg-[#1313ec]/20'
                }`}
                style={{ height: `${bar.height || 0}%` }}
              >
                <div
                  className={`absolute -top-10 left-1/2 -translate-x-1/2 bg-[#111118] text-white text-xs px-2 py-1 rounded whitespace-nowrap ${
                    index === bars.length - 1 ? 'font-bold' : 'opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {bar.value}
                </div>
              </div>
            ))}
          </div>

          <div className="absolute bottom-0 left-12 right-0 flex justify-between text-xs text-[#616189] px-2 overflow-hidden">
            {bars.map((bar, index) => {
              // Показываем не все метки если их слишком много
              const showLabel = bars.length <= 12 || 
                               index === 0 || 
                               index === bars.length - 1 || 
                               (bars.length > 12 && index % Math.ceil(bars.length / 7) === 0);
              return (
                <span
                  key={bar.date || index}
                  className={`${index === bars.length - 1 ? 'font-bold text-[#1313ec]' : ''} ${showLabel ? '' : 'opacity-0'} truncate text-center`}
                  style={{ minWidth: 0, flex: '1 1 0' }}
                >
                  {bar.label}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
