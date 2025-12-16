// KPIRow.jsx - KPI карточки для Owner Dashboard
// Принимает данные из props или использует дефолтные значения

function KPICard({ label, value, suffix, valueSuffix, icon, iconColor, change, trend, isRating, rating, colSpan }) {
  const getTrendStyles = () => {
    switch (trend) {
      case 'up':
        return { icon: 'trending_up', color: 'text-emerald-600' };
      case 'down':
        return { icon: 'trending_down', color: 'text-rose-600' };
      case 'warning':
        return { icon: 'warning', color: 'text-amber-600' };
      case 'neutral':
        return { icon: 'remove', color: 'text-gray-500' };
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
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = rating >= star;
                const partial = !filled && rating > star - 1;
                return (
                  <span 
                    key={star}
                    className={`material-symbols-outlined ${filled || partial ? 'icon-fill' : ''}`}
                    style={{ 
                      fontSize: '14px',
                      color: filled || partial ? '#10b981' : '#d1d5db',
                      clipPath: partial ? `inset(0 ${100 - (rating % 1) * 100}% 0 0)` : undefined 
                    }}
                  >
                    star
                  </span>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1 mt-1">
            {trendStyles.icon && (
              <span className={`material-symbols-outlined ${trendStyles.color}`} style={{ fontSize: '16px' }}>
                {trendStyles.icon}
              </span>
            )}
            <span className={`text-xs font-medium ${trendStyles.color}`}>{change}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function KPIRow({ stats, loading = false }) {
  // Формируем данные для карточек
  const kpiData = [
    {
      label: 'Выезды',
      value: loading ? '...' : (stats?.tours?.value || '0'),
      icon: 'flight_takeoff',
      change: loading ? 'Загрузка...' : (stats?.tours?.change || '-'),
      trend: loading ? 'neutral' : (stats?.tours?.trend || 'neutral'),
    },
    {
      label: 'Туристы',
      value: loading ? '...' : (stats?.tourists?.value || '0'),
      icon: 'groups',
      change: loading ? 'Загрузка...' : (stats?.tourists?.change || '-'),
      trend: loading ? 'neutral' : (stats?.tourists?.trend || 'neutral'),
    },
    {
      label: 'Выручка',
      value: loading ? '...' : (stats?.revenue?.value || '0'),
      suffix: 'KGS',
      icon: 'payments',
      change: loading ? 'Загрузка...' : (stats?.revenue?.change || '-'),
      trend: loading ? 'neutral' : (stats?.revenue?.trend || 'neutral'),
      colSpan: 'col-span-1 md:col-span-2 xl:col-span-1',
    },
    {
      label: 'Маржа',
      value: loading ? '...' : (stats?.margin?.value || '0%'),
      icon: 'pie_chart',
      change: loading ? 'Загрузка...' : (stats?.margin?.change || '-'),
      trend: loading ? 'neutral' : (stats?.margin?.trend || 'neutral'),
    },
    {
      label: 'Дебиторка',
      value: loading ? '...' : (stats?.debt?.value || '0'),
      icon: 'warning',
      iconColor: stats?.debt?.trend === 'warning' ? 'text-amber-500' : 'text-[#1313ec]/60',
      change: loading ? 'Загрузка...' : (stats?.debt?.change || '-'),
      trend: loading ? 'neutral' : (stats?.debt?.trend || 'neutral'),
    },
    {
      label: 'NPS',
      value: loading ? '...' : (stats?.nps?.value || '0'),
      valueSuffix: stats?.nps?.valueSuffix || '/5',
      icon: 'thumb_up',
      isRating: true,
      rating: loading ? 0 : (stats?.nps?.rating || 0),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
      {kpiData.map((kpi, index) => (
        <KPICard key={index} {...kpi} />
      ))}
    </div>
  );
}
