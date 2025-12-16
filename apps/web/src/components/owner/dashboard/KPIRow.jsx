const kpiData = [
  {
    label: 'Выезды',
    value: '14',
    icon: 'flight_takeoff',
    change: '+2 vs вчера',
    trend: 'up',
  },
  {
    label: 'Туристы',
    value: '286',
    icon: 'groups',
    change: '+12%',
    trend: 'up',
  },
  {
    label: 'Выручка',
    value: '4.82M',
    suffix: 'KGS',
    icon: 'payments',
    change: '+5.2%',
    trend: 'up',
    colSpan: 'col-span-1 md:col-span-2 xl:col-span-1',
  },
  {
    label: 'Маржа',
    value: '18.4%',
    icon: 'pie_chart',
    change: '-0.5%',
    trend: 'down',
  },
  {
    label: 'Дебиторка',
    value: '610K',
    icon: 'warning',
    iconColor: 'text-amber-500',
    change: 'Высокая',
    trend: 'warning',
  },
  {
    label: 'NPS',
    value: '4.7',
    valueSuffix: '/5',
    icon: 'thumb_up',
    isRating: true,
    rating: 4.7,
  },
];

function KPICard({ label, value, suffix, valueSuffix, icon, iconColor, change, trend, isRating, rating, colSpan }) {
  const getTrendStyles = () => {
    switch (trend) {
      case 'up':
        return { icon: 'trending_up', color: 'text-emerald-600' };
      case 'down':
        return { icon: 'trending_down', color: 'text-rose-600' };
      case 'warning':
        return { icon: 'arrow_upward', color: 'text-amber-600' };
      default:
        return { icon: '', color: '' };
    }
  };
  
  const trendStyles = getTrendStyles();
  
  return (
    <div className={`bg-white p-4 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#f0f0f4] flex flex-col gap-3 ${colSpan || ''}`}>
      <div className="flex items-center justify-between">
        <p className="text-[#616189] text-xs font-semibold uppercase tracking-wide">{label}</p>
        <span className={`material-symbols-outlined ${iconColor || 'text-[#1313ec]/60'}`}>{icon}</span>
      </div>
      <div>
        <p className="text-2xl font-bold text-[#111118] tracking-tight">
          {value}
          {suffix && <span className="text-sm font-normal text-[#616189] ml-1">{suffix}</span>}
          {valueSuffix && <span className="text-lg text-[#9ca3af]">{valueSuffix}</span>}
        </p>
        
        {isRating ? (
          <div className="flex items-center gap-1 mt-1">
            <div className="flex text-emerald-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <span 
                  key={star}
                  className="material-symbols-outlined icon-fill" 
                  style={{ 
                    fontSize: '14px',
                    clipPath: star === 5 ? 'inset(0 30% 0 0)' : undefined 
                  }}
                >
                  star
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1 mt-1">
            <span className={`material-symbols-outlined ${trendStyles.color}`} style={{ fontSize: '16px' }}>
              {trendStyles.icon}
            </span>
            <span className={`text-xs font-medium ${trendStyles.color}`}>{change}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function KPIRow({ data = kpiData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
      {data.map((kpi, index) => (
        <KPICard key={index} {...kpi} />
      ))}
    </div>
  );
}
