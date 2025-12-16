export default function DebtStructure() {
  const debtCategories = [
    { label: 'До 3 дней', percent: 40, color: 'bg-blue-500' },
    { label: '4-7 дней', percent: 25, color: 'bg-amber-500' },
    { label: '8+ дней', percent: 35, color: 'bg-rose-500' },
  ];

  const topDebtors = [
    { name: 'Mark T.', tour: 'Almaty City', amount: '-180k', severity: 'high' },
    { name: 'Elena K.', tour: 'Uzbekistan tour', amount: '-95k', severity: 'high' },
    { name: 'LLC "Stroy"', tour: 'Team building', amount: '-45k', severity: 'medium' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#f0f0f4] p-5 flex flex-col flex-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[#111118] text-base font-bold">Структура долга</h3>
        <button className="text-primary text-xs font-bold hover:underline">Детали</button>
      </div>

      {/* Chart and Legend */}
      <div className="flex items-center gap-4 py-4 border-b border-[#f0f0f4]">
        {/* Donut Chart */}
        <div className="relative size-16 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            {/* Background */}
            <path
              className="text-gray-100"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
            />
            {/* Blue segment (40%) */}
            <path
              className="text-blue-500"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeDasharray="40, 100"
              strokeWidth="6"
            />
            {/* Amber segment (25%) */}
            <path
              className="text-amber-500"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeDasharray="25, 100"
              strokeDashoffset="-40"
              strokeWidth="6"
            />
            {/* Rose segment (35%) */}
            <path
              className="text-rose-500"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeDasharray="35, 100"
              strokeDashoffset="-65"
              strokeWidth="6"
            />
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-1 text-xs w-full">
          {debtCategories.map((category, index) => (
            <div key={index} className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <div className={`size-2 rounded-full ${category.color}`} />
                <span className="text-[#616189]">{category.label}</span>
              </div>
              <span className="font-bold">{category.percent}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Debtors */}
      <div className="mt-3 flex flex-col gap-2">
        <p className="text-[10px] text-[#616189] uppercase font-bold tracking-wide mb-1">
          Топ должников
        </p>
        {topDebtors.map((debtor, index) => (
          <div key={index} className="flex items-center justify-between text-xs">
            <div className="truncate pr-2">
              <span className="font-semibold text-[#111118]">{debtor.name}</span>{' '}
              <span className="text-[#616189]">{debtor.tour}</span>
            </div>
            <span className={`font-bold ${debtor.severity === 'high' ? 'text-rose-600' : 'text-amber-600'}`}>
              {debtor.amount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
