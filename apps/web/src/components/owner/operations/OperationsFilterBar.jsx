import { useState } from 'react';

export default function OperationsFilterBar({ onFilterChange, onExport, onCreate }) {
  const [filters, setFilters] = useState({
    period: 'today',
    status: 'all',
    destination: 'all',
    responsible: 'all',
    risk: 'all',
    search: '',
  });

  const activePeriod = filters.period;

  const periods = [
    { key: 'today', label: 'Сегодня' },
    { key: 'tomorrow', label: 'Завтра' },
    { key: '7days', label: '7 дней' },
    { key: '30days', label: '30 дней' },
    { key: 'custom', label: 'Кастом' },
  ];

  const handlePeriodClick = (key) => {
    const newFilters = { ...filters, period: key };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  return (
    <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
      <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
        {/* Date Pills */}
        <div className="flex bg-slate-100/50 rounded-lg p-1 border border-slate-200">
          {periods.map((period) => (
            <button
              key={period.key}
              onClick={() => handlePeriodClick(period.key)}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                activePeriod === period.key
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-500 hover:bg-slate-100 font-medium'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>

        <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

        {/* Status Filter */}
        <div className="relative group">
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:border-slate-300 focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5] outline-none cursor-pointer"
          >
            <option value="all">Статус: Все</option>
            <option value="preparing">Подготовка</option>
            <option value="confirmed">Подтверждён</option>
            <option value="active">В пути</option>
            <option value="draft">Черновик</option>
          </select>
          <span className="material-symbols-outlined absolute right-2 top-1.5 text-slate-400 pointer-events-none" style={{ fontSize: '18px' }}>
            keyboard_arrow_down
          </span>
        </div>

        {/* Destination Filter */}
        <div className="relative group">
          <select
            value={filters.destination}
            onChange={(e) => handleFilterChange('destination', e.target.value)}
            className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:border-slate-300 focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5] outline-none cursor-pointer"
          >
            <option value="all">Направление: Все</option>
            <option value="issyk-kul">Иссык-Куль</option>
            <option value="almaty">Алматы</option>
            <option value="karakol">Каракол</option>
          </select>
          <span className="material-symbols-outlined absolute right-2 top-1.5 text-slate-400 pointer-events-none" style={{ fontSize: '18px' }}>
            keyboard_arrow_down
          </span>
        </div>

        {/* Responsible Filter */}
        <div className="relative group">
          <select
            value={filters.responsible}
            onChange={(e) => handleFilterChange('responsible', e.target.value)}
            className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:border-slate-300 focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5] outline-none cursor-pointer"
          >
            <option value="all">Ответственный: Все</option>
            <option value="elena">Елена А.</option>
            <option value="dmitry">Дмитрий К.</option>
            <option value="anna">Анна С.</option>
          </select>
          <span className="material-symbols-outlined absolute right-2 top-1.5 text-slate-400 pointer-events-none" style={{ fontSize: '18px' }}>
            keyboard_arrow_down
          </span>
        </div>

        {/* Risk Filter */}
        <div className="relative group">
          <select
            value={filters.risk}
            onChange={(e) => handleFilterChange('risk', e.target.value)}
            className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:border-slate-300 focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5] outline-none cursor-pointer"
          >
            <option value="all">Риск: Все</option>
            <option value="high">Критический</option>
            <option value="medium">Средний</option>
            <option value="low">Низкий</option>
          </select>
          <span className="material-symbols-outlined absolute right-2 top-1.5 text-slate-400 pointer-events-none" style={{ fontSize: '18px' }}>
            keyboard_arrow_down
          </span>
        </div>

        {/* Search */}
        <div className="relative flex-grow md:flex-grow-0 md:w-48">
          <span className="material-symbols-outlined absolute left-2.5 top-1.5 text-slate-400" style={{ fontSize: '18px' }}>
            search
          </span>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Поиск..."
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5] outline-none transition-shadow"
          />
        </div>
      </div>

      <div className="flex items-center justify-between w-full xl:w-auto gap-4 pt-4 xl:pt-0 border-t xl:border-t-0 border-slate-100">
        <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Обновлено: 2 мин назад</span>
        <div className="flex items-center gap-3">
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
            Экспорт
          </button>
          <button
            onClick={onCreate}
            className="flex items-center gap-2 px-4 py-2 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
            Создать тур
          </button>
        </div>
      </div>
    </div>
  );
}
