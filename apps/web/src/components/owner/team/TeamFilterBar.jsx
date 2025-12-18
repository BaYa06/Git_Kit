import { useState } from 'react';

export default function TeamFilterBar({
  onFilterChange,
  onExport,
  onInvite,
  activeRole = 'all',
  onRoleChange,
}) {
  const [activePeriod, setActivePeriod] = useState('30days');
  const [searchQuery, setSearchQuery] = useState('');

  const periods = [
    { id: '7days', label: '7 дней' },
    { id: '30days', label: '30 дней' },
    { id: 'quarter', label: 'Квартал' },
    { id: 'custom', label: 'Кастом' },
  ];

  const roles = [
    { id: 'all', label: 'Все' },
    { id: 'managers', label: 'Менеджеры' },
    { id: 'guides', label: 'Гиды' },
    { id: 'coordinators', label: 'Коорд.' },
    { id: 'drivers', label: 'Водители' },
  ];

  const handleRoleClick = (roleId) => {
    onRoleChange?.(roleId);
    onFilterChange?.({
      role: roleId,
      period: activePeriod,
      search: searchQuery,
    });
  };

  const handlePeriodClick = (periodId) => {
    setActivePeriod(periodId);
    onFilterChange?.({
      role: activeRole,
      period: periodId,
      search: searchQuery,
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-2xl font-bold text-[#111118]">Команда</h2>
        <p className="text-[#616189] text-sm mt-1">
          Управление сотрудниками и эффективность
        </p>
      </div>

      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 bg-white p-3 rounded-xl border border-[#e0e0e4] shadow-sm">
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Period Selector */}
          <div className="flex bg-[#f6f6f8] rounded-lg p-1">
            {periods.map((period) => (
              <button
                key={period.id}
                onClick={() => handlePeriodClick(period.id)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activePeriod === period.id
                    ? 'bg-white text-[#111118] font-semibold shadow-sm'
                    : 'text-[#616189] hover:bg-white hover:shadow-sm hover:text-[#111118]'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-[#e0e0e4] hidden sm:block" />

          {/* Filters */}
          <div className="flex gap-2">
            <button className="flex items-center gap-2 h-9 px-3 bg-white border border-[#e0e0e4] rounded-lg text-sm text-[#111118] font-medium hover:border-[#b0b0b9] transition-colors">
              <span>Филиал</span>
              <span className="material-symbols-outlined text-[#616189]" style={{ fontSize: '18px' }}>
                expand_more
              </span>
            </button>
            <button className="flex items-center gap-2 h-9 px-3 bg-white border border-[#e0e0e4] rounded-lg text-sm text-[#111118] font-medium hover:border-[#b0b0b9] transition-colors">
              <span>Направление</span>
              <span className="material-symbols-outlined text-[#616189]" style={{ fontSize: '18px' }}>
                expand_more
              </span>
            </button>
          </div>

          {/* Role Filter */}
          <div className="flex bg-[#f6f6f8] rounded-lg p-1 hidden lg:flex">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => handleRoleClick(role.id)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeRole === role.id
                    ? 'bg-white text-[#111118] font-semibold shadow-sm'
                    : 'text-[#616189] hover:text-[#111118]'
                }`}
              >
                {role.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative group">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af] group-focus-within:text-primary transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>search</span>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                const next = e.target.value;
                setSearchQuery(next);
                onFilterChange?.({
                  role: activeRole,
                  period: activePeriod,
                  search: next,
                });
              }}
              placeholder="Поиск по имени, телефону, email"
              className="h-9 pl-9 pr-3 text-sm bg-white border border-[#e0e0e4] rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none w-[260px] transition-all"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 w-full xl:w-auto justify-end border-t xl:border-0 border-[#f0f0f4] pt-3 xl:pt-0">
          <button
            onClick={onExport}
            className="flex items-center gap-2 h-9 px-4 bg-white border border-[#e0e0e4] rounded-lg text-sm text-[#111118] font-medium hover:bg-[#f8f8fa] transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
            Экспорт
          </button>
          <button
            onClick={onInvite}
            className="flex items-center gap-2 h-9 px-4 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 shadow-sm shadow-primary/30 transition-all"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
            Пригласить
          </button>
        </div>
      </div>
    </div>
  );
}
