import { useState, useEffect } from 'react';

// Маппинг типов рисков на иконки и тексты действий
const RISK_CONFIG = {
  missing_guide: { icon: 'person_off', action: 'Назначить' },
  missing_vehicle: { icon: 'directions_bus_filled', action: 'Назначить' },
  missing_hotel: { icon: 'hotel', action: 'Указать' },
  guide_conflict: { icon: 'event_busy', action: 'Исправить' },
  vehicle_conflict: { icon: 'warning', action: 'Исправить' },
  guide_overload: { icon: 'schedule', action: 'Проверить' },
  tourists_incomplete: { icon: 'group_off', action: 'Заполнить' },
  tourists_missing_data: { icon: 'edit', action: 'Дополнить' },
  high_debt_before_tour: { icon: 'payments', action: 'Связаться' },
  low_deposit: { icon: 'account_balance', action: 'Напомнить' },
  unresolved_complaint: { icon: 'report', action: 'Рассмотреть' },
  low_rating: { icon: 'star_half', action: 'Проверить' },
};

export default function AlertsWidget({ companyId, onAction }) {
  const [filter, setFilter] = useState('all');
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Загрузка рисков
  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    const fetchRisks = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `/api/v1/risks/list?company_id=${companyId}&limit=10`,
          { credentials: 'include' }
        );
        
        if (!res.ok) throw new Error('Failed to fetch risks');
        
        const data = await res.json();
        setRisks(data.risks || []);
      } catch (err) {
        console.error('Failed to load risks:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRisks();
    
    // Обновляем каждые 2 минуты
    const interval = setInterval(fetchRisks, 120000);
    return () => clearInterval(interval);
  }, [companyId]);

  // Фильтруем только критичные и важные
  const displayRisks = risks.filter(r => 
    r.severity === 'critical' || r.severity === 'warning'
  );
  
  const criticalCount = displayRisks.filter(r => r.severity === 'critical').length;
  const totalCount = displayRisks.length;
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-rose-100 overflow-hidden">
      {/* Header */}
      <div className="bg-rose-50/50 px-6 py-4 border-b border-rose-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-rose-100 p-1.5 rounded-lg text-rose-600">
            <span className="material-symbols-outlined">report_problem</span>
          </div>
          <h3 className="text-[#111118] text-lg font-bold">
            Критические риски ({totalCount})
          </h3>
        </div>
        <div className="flex bg-white rounded-lg p-0.5 border border-rose-100">
          <button 
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded text-xs font-bold ${
              filter === 'all' ? 'bg-rose-50 text-rose-700' : 'text-[#616189] hover:bg-[#f8f8fa]'
            }`}
          >
            Все
          </button>
          <button 
            onClick={() => setFilter('own')}
            className={`px-3 py-1 rounded text-xs font-medium ${
              filter === 'own' ? 'bg-rose-50 text-rose-700' : 'text-[#616189] hover:bg-[#f8f8fa]'
            }`}
          >
            Только свои
          </button>
        </div>
      </div>
      
      {/* Alert Items */}
      <div className="divide-y divide-rose-50">
        {loading && (
          <div className="px-6 py-8 text-center text-[#616189]">
            Загрузка рисков...
          </div>
        )}
        
        {error && (
          <div className="px-6 py-8 text-center text-rose-600">
            Ошибка загрузки: {error}
          </div>
        )}
        
        {!loading && !error && displayRisks.length === 0 && (
          <div className="px-6 py-8 text-center">
            <span className="material-symbols-outlined text-green-500 text-4xl mb-2">
              check_circle
            </span>
            <p className="text-[#111118] font-semibold">Критических рисков нет</p>
            <p className="text-[#616189] text-sm mt-1">Все туры готовы к выезду</p>
          </div>
        )}
        
        {!loading && !error && displayRisks.map((risk) => {
          const config = RISK_CONFIG[risk.risk_type] || { icon: 'warning', action: 'Проверить' };
          const hoursLeft = risk.hours_to_departure;
          const timeText = hoursLeft ? 
            (hoursLeft < 24 ? `через ${Math.round(hoursLeft)}ч` : 
             hoursLeft < 48 ? 'завтра' : 
             `${Math.round(hoursLeft / 24)}д`) : '';
          
          return (
            <div 
              key={risk.id}
              className={`px-6 py-4 flex items-center justify-between transition-colors group ${
                risk.severity === 'critical' ? 'hover:bg-rose-50/20' : 'hover:bg-amber-50/20'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-1.5 h-1.5 rounded-full mt-2 ${
                  risk.severity === 'critical' ? 'bg-rose-500' : 'bg-amber-500'
                }`}></div>
                <div>
                  <p className="text-[#111118] font-semibold text-sm">
                    {risk.tour_name} {timeText && `(${timeText})`} — {risk.title.toLowerCase()}
                  </p>
                  <p className="text-[#616189] text-xs mt-0.5">{risk.description}</p>
                </div>
              </div>
              <button 
                onClick={() => onAction?.(risk)}
                className="text-sm font-semibold bg-white border border-[#e0e0e4] hover:bg-gray-50 px-4 py-1.5 rounded-lg shadow-sm text-[#1313ec] hover:text-[#1313ec]/80"
              >
                {config.action}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

