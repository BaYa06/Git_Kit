export default function DesktopKPICards({ stats }) {
  const kpiItems = [
    {
      id: 'active_tours',
      label: 'Active Tours',
      value: stats?.activeTours || 14,
      trend: '+2%',
      trendUp: true,
      icon: 'hiking',
      color: 'primary',
      bgColor: 'bg-primary/20',
      textColor: 'text-primary',
      hoverBg: 'group-hover:bg-primary',
    },
    {
      id: 'guides',
      label: 'Available Guides',
      value: stats?.availableGuides || 8,
      subtitle: `of ${stats?.totalGuides || 24} total`,
      icon: 'groups',
      color: 'blue',
      bgColor: 'bg-blue-500/20',
      textColor: 'text-blue-400',
      hoverBg: 'group-hover:bg-blue-500',
    },
    {
      id: 'hotels',
      label: 'Partner Hotels',
      value: stats?.partnerHotels || 23,
      trend: '+5%',
      trendUp: true,
      icon: 'hotel',
      color: 'orange',
      bgColor: 'bg-orange-500/20',
      textColor: 'text-orange-400',
      hoverBg: 'group-hover:bg-orange-500',
    },
    {
      id: 'occupancy',
      label: 'Plan Occupancy',
      value: `${stats?.occupancy || 85}%`,
      trend: '+12%',
      trendUp: true,
      icon: 'pie_chart',
      color: 'pink',
      bgColor: 'bg-pink-500/20',
      textColor: 'text-pink-400',
      hoverBg: 'group-hover:bg-pink-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpiItems.map((item) => (
        <div
          key={item.id}
          className="glass-card flex flex-col gap-1 rounded-xl p-5 hover:bg-surface-dark/80 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-400">{item.label}</span>
            <div
              className={`flex size-8 items-center justify-center rounded-full ${item.bgColor} ${item.textColor} ${item.hoverBg} group-hover:text-white transition-colors`}
            >
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{item.value}</span>
            {item.trend && (
              <span
                className={`text-sm font-medium flex items-center ${
                  item.trendUp ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {item.trendUp ? 'trending_up' : 'trending_down'}
                </span>
                {item.trend}
              </span>
            )}
            {item.subtitle && (
              <span className="text-sm font-medium text-gray-500">{item.subtitle}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
