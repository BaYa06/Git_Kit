const placeholderStats = [
  {
    label: 'Туры',
    value: '—',
    icon: 'today',
    change: '—',
    trend: 'neutral',
    subtitle: 'Загрузка...',
  },
  {
    label: 'В подготовке',
    value: '—',
    icon: 'pending_actions',
    change: '—',
    trend: 'neutral',
    subtitle: 'Загрузка...',
  },
  {
    label: 'Критические риски',
    value: '—',
    icon: 'report_problem',
    change: '—',
    trend: 'critical',
    subtitle: 'Загрузка...',
    variant: 'danger',
  },
  {
    label: 'Проблемные оплаты',
    value: '—',
    icon: 'account_balance_wallet',
    change: '—',
    trend: 'neutral',
    subtitle: 'Загрузка...',
  },
];

function StatCard({ label, value, icon, change, trend, subtitle, variant }) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          border: 'border-rose-100 hover:border-rose-200',
          labelColor: 'text-rose-600',
          iconColor: 'text-rose-500',
          subtitleColor: 'text-rose-400',
          badgeBg: 'bg-rose-50 text-rose-600',
          hasDecor: true,
        };
      case 'warning':
        return {
          border: 'border-amber-100 hover:border-amber-200',
          labelColor: 'text-amber-600',
          iconColor: 'text-amber-500',
          subtitleColor: 'text-amber-500',
          badgeBg: 'bg-amber-50 text-amber-600',
        };
      default:
        return {
          border: 'border-slate-200',
          labelColor: 'text-slate-500',
          iconColor: 'text-[#4f46e5]/50 group-hover:text-[#4f46e5]',
          subtitleColor: 'text-slate-400',
          badgeBg: trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-500',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={`bg-white p-5 rounded-xl border ${styles.border} shadow-sm cursor-pointer hover:shadow-md transition-all group relative overflow-hidden`}>
      {styles.hasDecor && (
        <div className="absolute right-0 top-0 w-16 h-16 bg-rose-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
      )}
      
      <div className="flex justify-between items-start mb-2 relative z-10">
        <p className={`${styles.labelColor} text-xs font-bold uppercase tracking-wider`}>{label}</p>
        <span className={`material-symbols-outlined ${styles.iconColor} transition-colors`}>{icon}</span>
      </div>
      
      <div className="flex items-end gap-3 relative z-10">
        <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
        <div className={`flex items-center gap-1 mb-1.5 ${styles.badgeBg} px-1.5 py-0.5 rounded text-xs font-semibold`}>
          {trend === 'up' && (
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>trending_up</span>
          )}
          {trend === 'critical' && (
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>priority_high</span>
          )}
          <span>{change}</span>
        </div>
      </div>
      
      <p className={`text-xs ${styles.subtitleColor} mt-2`}>{subtitle}</p>
    </div>
  );
}

export default function OperationsStats({ stats }) {
  const safeStats = Array.isArray(stats) ? stats : [];

  if (safeStats.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {placeholderStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {safeStats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}
