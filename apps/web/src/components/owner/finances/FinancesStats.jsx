export default function FinancesStats({ stats }) {
  const fallback = [
    { id: 'revenue', label: 'Выручка', value: '—', subtext: 'нет данных', icon: 'payments', iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600' },
    { id: 'income', label: 'Поступления', value: '—', subtext: 'нет данных', icon: 'account_balance_wallet', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    { id: 'receivables', label: 'Дебиторка', value: '—', subtext: 'нет данных', icon: 'money_off', iconBg: 'bg-rose-50', iconColor: 'text-rose-600' },
    { id: 'avgCheck', label: 'Средний чек', value: '—', subtext: 'нет данных', icon: 'receipt_long', iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
  ];

  const raw = Array.isArray(stats) && stats.length > 0 ? stats : fallback;
  const data = raw.filter((s) => s.id !== 'expected').slice(0, 4);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {data.map((stat) => (
        <div
          key={stat.id}
          className="bg-white p-4 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#f0f0f4] flex flex-col justify-between gap-3 group hover:border-primary/20 transition-all"
        >
          <div className="flex items-center justify-between">
            <p className="text-[#616189] text-xs font-semibold uppercase tracking-wide">
              {stat.label}
            </p>
            <div className={`p-1.5 ${stat.iconBg} rounded-lg ${stat.iconColor}`}>
              <span className="material-symbols-outlined icon-fill">{stat.icon}</span>
            </div>
          </div>
          
          <div>
            <p className="text-[22px] font-bold text-[#111118] tracking-tight">{stat.value}</p>
            <div className="flex items-center gap-2 mt-1">
              {stat.change ? (
                <>
                  <span className={`flex items-center text-xs font-bold px-1.5 py-0.5 rounded ${
                    stat.changeType === 'positive' 
                      ? 'text-emerald-600 bg-emerald-50' 
                      : 'text-rose-600 bg-rose-50'
                  }`}>
                    {stat.change}
                    <span className="material-symbols-outlined ml-0.5" style={{ fontSize: '12px' }}>
                      {stat.change.startsWith('+') || stat.change.startsWith('−') && stat.changeType === 'positive' 
                        ? 'trending_up' 
                        : 'trending_down'}
                    </span>
                  </span>
                  <span className="text-xs text-[#9ca3af]">{stat.subtext}</span>
                </>
              ) : stat.progress !== undefined ? (
                <>
                  <div className="h-1 w-16 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-400" 
                      style={{ width: `${stat.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-[#9ca3af]">{stat.subtext}</span>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
