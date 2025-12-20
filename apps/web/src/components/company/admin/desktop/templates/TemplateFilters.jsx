export default function TemplateFilters({
  categories,
  category,
  onCategoryChange,
  query,
  onQueryChange,
  filters,
  onFiltersChange,
  typeOptions,
  directionOptions,
  onReset,
}) {
  const handleFilterChange = (key, value) => {
    onFiltersChange?.({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        {categories.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onCategoryChange?.(item.id)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
              category === item.id
                ? 'bg-white text-black shadow-sm'
                : 'bg-surface-dark/50 border border-white/10 text-gray-400 hover:text-white hover:bg-surface-dark'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="glass-card rounded-2xl p-4 flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <label className="relative flex items-center flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3.5 text-gray-400 text-[20px]">search</span>
            <input
              className="h-10 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
              placeholder="Поиск по названию или направлению..."
              type="text"
              value={query}
              onChange={(e) => onQueryChange?.(e.target.value)}
            />
          </label>
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
            <div className="relative min-w-[140px]">
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="h-10 w-full appearance-none rounded-xl border border-white/10 bg-white/5 pl-3 pr-8 text-sm text-gray-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer"
              >
                {typeOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-2 top-2.5 text-gray-500 pointer-events-none text-[20px]">
                arrow_drop_down
              </span>
            </div>
            <div className="relative min-w-[140px]">
              <select
                value={filters.direction}
                onChange={(e) => handleFilterChange('direction', e.target.value)}
                className="h-10 w-full appearance-none rounded-xl border border-white/10 bg-white/5 pl-3 pr-8 text-sm text-gray-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer"
              >
                {directionOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-2 top-2.5 text-gray-500 pointer-events-none text-[20px]">
                arrow_drop_down
              </span>
            </div>
            <div className="relative min-w-[140px]">
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="h-10 w-full appearance-none rounded-xl border border-white/10 bg-white/5 pl-3 pr-8 text-sm text-gray-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer"
              >
                <option value="newest">Сортировка: Сначала новые</option>
                <option value="name">Сортировка: По названию</option>
                <option value="segments">Сортировка: По сегментам</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-2.5 text-gray-500 pointer-events-none text-[20px]">
                sort
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 border-t lg:border-t-0 border-white/10 pt-3 lg:pt-0">
          <button
            type="button"
            onClick={onReset}
            className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            Сбросить
          </button>
          <div className="h-6 w-px bg-white/10 mx-1 hidden lg:block"></div>
          <button
            type="button"
            onClick={() => handleFilterChange('highlight', filters.highlight === 'popular' ? null : 'popular')}
            className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
              filters.highlight === 'popular'
                ? 'bg-primary/20 border-primary/50 text-primary'
                : 'bg-white/5 border-transparent hover:border-white/10 text-gray-300'
            }`}
          >
            Популярные
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange('highlight', filters.highlight === 'recent' ? null : 'recent')}
            className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
              filters.highlight === 'recent'
                ? 'bg-primary/20 border-primary/50 text-primary'
                : 'bg-white/5 border-transparent hover:border-white/10 text-gray-300'
            }`}
          >
            Недавно обновлены
          </button>
        </div>
      </div>
    </div>
  );
}
