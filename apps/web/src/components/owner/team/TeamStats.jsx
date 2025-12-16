export default function TeamStats({ stats }) {
  const defaultStats = [
    {
      id: 'employees',
      label: 'Активные сотрудники',
      value: '24',
      subtext: 'Все в строю',
      icon: 'badge',
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
    },
    {
      id: 'sales',
      label: 'Продажи',
      value: '186',
      change: '+12%',
      changeType: 'positive',
      subtext: 'vs план',
      icon: 'shopping_cart',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      id: 'conversion',
      label: 'Конверсия',
      value: '12.4%',
      change: '-0.8%',
      changeType: 'negative',
      subtext: 'недели',
      icon: 'percent',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      id: 'rating',
      label: 'Оценка сервиса',
      value: '4.7',
      subtext: 'На основе 142 отзывов',
      icon: 'star',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      id: 'complaints',
      label: 'Жалобы',
      value: '6',
      alert: '2 не решены',
      icon: 'report_problem',
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-600',
    },
  ];

  const data = stats || defaultStats;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {data.map((stat) => (
        <div
          key={stat.id}
          className="bg-white p-5 rounded-xl border border-[#e0e0e4] shadow-[0_2px_4px_rgba(0,0,0,0.02)] flex flex-col justify-between h-28 hover:border-primary/30 transition-colors"
        >
          <div className="flex justify-between items-start">
            <span className="text-[#616189] text-xs font-bold uppercase tracking-wide">
              {stat.label}
            </span>
            <div className={`p-1.5 ${stat.iconBg} ${stat.iconColor} rounded-lg`}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                {stat.icon}
              </span>
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#111118]">{stat.value}</div>
            <div className="flex items-center gap-1 mt-0.5">
              {stat.change ? (
                <>
                  <span
                    className={`material-symbols-outlined ${
                      stat.changeType === 'positive' ? 'text-emerald-500' : 'text-rose-500'
                    }`}
                    style={{ fontSize: '16px' }}
                  >
                    {stat.changeType === 'positive' ? 'trending_up' : 'trending_down'}
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      stat.changeType === 'positive' ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {stat.change} {stat.subtext}
                  </span>
                </>
              ) : stat.alert ? (
                <>
                  <span className="inline-flex size-2 rounded-full bg-rose-500" />
                  <span className="text-xs font-bold text-rose-600">{stat.alert}</span>
                </>
              ) : (
                <span className="text-xs text-[#616189]">{stat.subtext}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
