const actions = [
  { icon: 'add_circle', label: 'Новый тур', action: 'new_tour' },
  { icon: 'person_add', label: 'Гид', action: 'add_guide' },
  { icon: 'attach_money', label: 'Оплата', action: 'payment' },
  { icon: 'description', label: 'Отчет', action: 'report' },
];

export default function QuickActions({ onAction }) {
  return (
    <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#f0f0f4] p-6">
      <h3 className="text-[#111118] text-lg font-bold mb-4">Действия</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => onAction?.(action.action)}
            className="flex flex-col items-center justify-center gap-2 bg-[#f8f8fa] hover:bg-[#1313ec] hover:text-white p-3 rounded-xl transition-all group"
          >
            <span className="material-symbols-outlined text-[#1313ec] group-hover:text-white">
              {action.icon}
            </span>
            <span className="text-xs font-semibold">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
