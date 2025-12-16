export default function FinancesStats({ stats }) {
  const defaultStats = [
    {
      id: 'revenue',
      label: 'Выручка',
      value: '18.45 M',
      change: '+12%',
      changeType: 'positive',
      subtext: 'vs прошлый период',
      icon: 'payments',
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
    },
    {
      id: 'income',
      label: 'Поступления',
      value: '16.9 M',
      change: '+9%',
      changeType: 'positive',
      subtext: 'vs прошлый период',
      icon: 'account_balance_wallet',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      id: 'receivables',
      label: 'Дебиторка',
      value: '1.55 M',
      change: '−4%',
      changeType: 'positive',
      subtext: 'хорошая динамика',
      icon: 'money_off',
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-600',
    },
    {
      id: 'prepayments',
      label: 'Предоплаты',
      value: '6.2 M',
      change: '+6%',
      changeType: 'positive',
      subtext: 'рост резервов',
      icon: 'savings',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      id: 'avgCheck',
      label: 'Средний чек',
      value: '64.5 K',
      progress: 75,
      subtext: 'стабильно',
      icon: 'receipt_long',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
  ];

  const data = stats || defaultStats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
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
