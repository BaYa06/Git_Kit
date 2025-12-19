import { useMemo, useState } from 'react';

export default function FinancesFilterBar({ period = 'today', onPeriodChange, updatedAt }) {
  const [currency, setCurrency] = useState('KGS');

  const periods = [
    { id: 'today', label: 'Сегодня' },
    { id: '7days', label: '7 дней' },
    { id: '30days', label: '30 дней' },
    { id: 'custom', label: 'Кастом' },
  ];

  const formattedUpdatedAt = useMemo(() => {
    if (!updatedAt) return '—';
    const date = typeof updatedAt === 'string' ? new Date(updatedAt) : updatedAt;
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [updatedAt]);

  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold text-[#111118]">Финансы</h2>
        <p className="text-[#616189] text-sm mt-1">
          Выручка, поступления, долги и эффективность направлений
        </p>
      </div>
      
      <div className="flex flex-col items-end gap-1">
        <div className="flex flex-wrap items-center gap-3">
          {/* Period Selector */}
          <div className="flex bg-white rounded-lg p-1 border border-[#e0e0e4] shadow-sm">
            {periods.map((opt) => (
              <button
                key={opt.id}
                onClick={() => onPeriodChange?.(opt.id)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  period === opt.id
                    ? 'bg-[#f0f0f4] text-[#111118] font-semibold shadow-sm'
                    : 'text-[#616189] hover:bg-[#f8f8fa]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="h-8 w-px bg-[#e0e0e4] hidden lg:block" />

          {/* Currency Selector */}
          <div className="relative">
            <button className="flex items-center gap-2 h-9 px-3 bg-white border border-[#e0e0e4] rounded-lg text-sm text-[#111118] font-medium shadow-sm hover:border-[#cbd5e1] transition-colors">
              <span>{currency}</span>
              <span className="material-symbols-outlined text-[#616189]" style={{ fontSize: '18px' }}>
                keyboard_arrow_down
              </span>
            </button>
          </div>

          {/* Export Button */}
          <button className="flex items-center gap-2 h-9 px-4 bg-white border border-[#e0e0e4] rounded-lg text-sm text-[#111118] font-semibold shadow-sm hover:bg-[#f8f8fa] transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>ios_share</span>
            Экспорт отчёта
          </button>

          {/* Download Report Button */}
          <button className="flex items-center gap-2 h-9 px-4 bg-primary text-white border border-transparent rounded-lg text-sm font-semibold shadow-sm hover:bg-primary/90 transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
            Скачать отчёт недели
          </button>
        </div>
        
        <span className="text-xs text-[#616189] font-medium mt-1">
          Обновлено: {formattedUpdatedAt}
        </span>
      </div>
    </div>
  );
}
