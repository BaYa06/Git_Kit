import { useState } from 'react';

export default function FilterBar({ onPeriodChange, onExport }) {
  const [activePeriod, setActivePeriod] = useState('today');
  
  const periods = [
    { key: 'today', label: 'Сегодня' },
    { key: '7days', label: '7 дней' },
    { key: '30days', label: '30 дней' },
    { key: 'custom', label: 'Кастом' },
  ];
  
  const handlePeriodClick = (key) => {
    setActivePeriod(key);
    onPeriodChange?.(key);
  };
  
  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Date Pills */}
        <div className="flex bg-white rounded-lg p-1 border border-[#e0e0e4] shadow-sm">
          {periods.map((period) => (
            <button
              key={period.key}
              onClick={() => handlePeriodClick(period.key)}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                activePeriod === period.key
                  ? 'bg-[#f0f0f4] text-[#111118] font-semibold'
                  : 'text-[#616189] hover:bg-[#f8f8fa] font-medium'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
        
        {/* Divider */}
        <div className="h-8 w-px bg-[#e0e0e4] hidden lg:block"></div>
        
        {/* Dropdowns */}
        <button className="flex items-center gap-2 h-9 px-3 bg-white border border-[#e0e0e4] rounded-lg text-sm text-[#111118] font-medium shadow-sm hover:border-[#cbd5e1]">
          <span>Филиал: Все</span>
          <span className="material-symbols-outlined text-[#616189]" style={{ fontSize: '18px' }}>keyboard_arrow_down</span>
        </button>
        
        <button className="flex items-center gap-2 h-9 px-3 bg-white border border-[#e0e0e4] rounded-lg text-sm text-[#111118] font-medium shadow-sm hover:border-[#cbd5e1]">
          <span>Направление: Все</span>
          <span className="material-symbols-outlined text-[#616189]" style={{ fontSize: '18px' }}>keyboard_arrow_down</span>
        </button>
      </div>
      
      <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
        <span className="text-xs text-[#616189] font-medium">Обновлено: 2 мин назад</span>
        <button 
          onClick={onExport}
          className="flex items-center gap-2 h-9 px-4 bg-white border border-[#e0e0e4] rounded-lg text-sm text-[#111118] font-semibold shadow-sm hover:bg-[#f8f8fa]"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
          Экспорт
        </button>
      </div>
    </div>
  );
}
