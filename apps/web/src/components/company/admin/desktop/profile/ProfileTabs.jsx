const tabs = ['Основное', 'Работа', 'Зарплата', 'Документы', 'Настройки'];

export default function ProfileTabs({ active = 'Основное', onChange }) {
  return (
    <div className="border-b border-white/10">
      <nav aria-label="Tabs" className="flex gap-8 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const isActive = tab === active;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => onChange?.(tab)}
              aria-current={isActive ? 'page' : undefined}
              className={`border-b-2 py-4 px-1 text-sm font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-primary text-white'
                  : 'border-transparent text-gray-400 hover:border-gray-300 hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
