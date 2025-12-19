export default function DesktopAlerts({ alerts = [], risks = [] }) {
  // Mock data if no alerts provided
  const mockAlerts = [
    {
      id: 1,
      type: 'warning',
      icon: 'warning',
      iconColor: 'text-yellow-400',
      title: 'Конфликт расписания',
      description: 'Гид Алексей Смирнов занят 14 Окт',
    },
    {
      id: 2,
      type: 'info',
      icon: 'mail',
      iconColor: 'text-blue-400',
      title: 'Новая заявка',
      description: 'Тур "Белые Ночи" от Ивана К.',
    },
    {
      id: 3,
      type: 'danger',
      icon: 'payments',
      iconColor: 'text-red-400',
      title: 'Неоплаченный счет',
      description: 'Отель "Астория", просрочено 2 дня',
    },
  ];

  // Combine alerts and risks
  const displayAlerts = [...alerts];
  
  // Convert risks to alert format
  if (risks && risks.length > 0) {
    risks.forEach((risk) => {
      let icon = 'warning';
      let iconColor = 'text-yellow-400';

      // Map risk categories to icons
      if (risk.category === 'A' || risk.category === 'critical') {
        icon = 'error';
        iconColor = 'text-red-400';
      } else if (risk.category === 'B' || risk.category === 'conflict') {
        icon = 'warning';
        iconColor = 'text-yellow-400';
      } else if (risk.category === 'D' || risk.category === 'financial') {
        icon = 'payments';
        iconColor = 'text-red-400';
      } else if (risk.category === 'E' || risk.category === 'complaint') {
        icon = 'feedback';
        iconColor = 'text-orange-400';
      }

      displayAlerts.push({
        id: `risk-${risk.id}`,
        type: risk.severity || 'warning',
        icon,
        iconColor,
        title: risk.risk_type_ru || risk.risk_type || 'Внимание',
        description: risk.message || risk.description || '',
      });
    });
  }

  const finalAlerts = displayAlerts.length > 0 ? displayAlerts : mockAlerts;
  const alertCount = finalAlerts.length;

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Требует внимания</h3>
        {alertCount > 0 && (
          <span className="flex size-6 items-center justify-center rounded-full bg-red-500/20 text-xs font-bold text-red-500">
            {alertCount}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {finalAlerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <span className="material-symbols-outlined text-4xl mb-2">check_circle</span>
            <p className="text-sm">Все в порядке!</p>
          </div>
        ) : (
          finalAlerts.map((alert) => (
            <div
              key={alert.id}
              className="flex gap-3 rounded-xl bg-surface-dark/40 p-3 border border-white/10 hover:border-white/20 transition-colors cursor-pointer"
            >
              <div className={`mt-0.5 shrink-0 ${alert.iconColor}`}>
                <span className="material-symbols-outlined text-[20px]">{alert.icon}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">{alert.title}</p>
                <p className="text-xs text-gray-500 mt-1">{alert.description}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
