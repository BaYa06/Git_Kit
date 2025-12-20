const tabs = [
  { id: 'main', label: 'Основное' },
  { id: 'work', label: 'Работа' },
  { id: 'salary', label: 'Зарплата' },
  { id: 'docs', label: 'Документы' },
  { id: 'settings', label: 'Настройки' },
];

export default function SalaryTabs({ active = 'salary', onChange }) {
  return (
    <div className="border-b border-white/10">
      <nav aria-label="Tabs" className="flex gap-8 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange?.(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`border-b-2 py-4 px-1 text-sm font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-primary text-white'
                  : 'border-transparent text-gray-400 hover:border-gray-300 hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
