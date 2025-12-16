export default function FinancialRisksSummary() {
  const risks = [
    {
      id: 'overdue',
      severity: 'critical',
      severityLabel: 'Критично',
      severityColor: 'text-rose-300',
      icon: 'warning',
      title: 'Просроченные остатки',
      description: '12 клиентов / 450 000 KGS',
      buttonLabel: 'Посмотреть список',
    },
    {
      id: 'margin',
      severity: 'warning',
      severityLabel: 'Внимание',
      severityColor: 'text-amber-300',
      icon: 'trending_down',
      title: 'Туры с низкой маржой',
      description: '3 тура ниже 10% маржинальности',
      buttonLabel: 'Анализ цен',
    },
    {
      id: 'refunds',
      severity: 'info',
      severityLabel: 'Операции',
      severityColor: 'text-indigo-300',
      icon: 'replay',
      title: 'Возвраты за период',
      description: '2 возврата на сумму 24 000 KGS',
      buttonLabel: 'Детали возвратов',
    },
    {
      id: 'expenses',
      severity: 'info',
      severityLabel: 'Расходы',
      severityColor: 'text-indigo-300',
      icon: 'receipt',
      title: 'Не закрыты расходы',
      description: 'Тур #881 завершен, нет отчета гида',
      buttonLabel: 'Напомнить',
    },
  ];

  return (
    <div className="bg-indigo-900 rounded-xl shadow-lg border border-indigo-800 overflow-hidden text-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-indigo-800 bg-indigo-950/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-800/80 p-1.5 rounded-lg text-white">
            <span className="material-symbols-outlined icon-fill">notifications_active</span>
          </div>
          <h3 className="text-white text-lg font-bold">Сводка финансовых рисков</h3>
        </div>
        <button className="text-indigo-200 hover:text-white text-sm font-medium transition-colors">
          Перейти в Риски
        </button>
      </div>

      {/* Risk Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-indigo-800/50">
        {risks.map((risk) => (
          <div
            key={risk.id}
            className="p-5 flex flex-col justify-between hover:bg-indigo-800/30 transition-colors"
          >
            <div>
              <div className={`flex items-center gap-2 mb-2 ${risk.severityColor}`}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  {risk.icon}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider">
                  {risk.severityLabel}
                </span>
              </div>
              <p className="font-bold text-lg leading-tight mb-1">{risk.title}</p>
              <p className="text-indigo-200 text-sm">{risk.description}</p>
            </div>
            <button className="mt-4 w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-semibold transition-colors">
              {risk.buttonLabel}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
