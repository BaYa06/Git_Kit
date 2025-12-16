import { useState } from 'react';

const defaultAlerts = [
  {
    id: 1,
    type: 'critical',
    title: 'Тур 18 Dec (Завтра) — нет назначенного гида',
    description: 'Ответственный: Мария И. • Направление: Ала-Арча',
    action: 'Назначить',
    actionType: 'primary',
  },
  {
    id: 2,
    type: 'critical',
    title: 'Тур 19 Dec — список туристов не загружен',
    description: 'Ответственный: Бот (API) • Группа: #4029',
    action: 'Проверить',
    actionType: 'primary',
  },
  {
    id: 3,
    type: 'warning',
    title: 'Просрочены оплаты: 7 клиентов',
    description: 'Сумма: 42 000 KGS • Срок: Вчера',
    action: 'Напомнить',
    actionType: 'default',
  },
];

export default function AlertsWidget({ alerts = defaultAlerts, onAction }) {
  const [filter, setFilter] = useState('all');
  
  const criticalCount = alerts.filter(a => a.type === 'critical').length;
  const totalCount = alerts.length;
  
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
        {alerts.map((alert) => (
          <div 
            key={alert.id}
            className={`px-6 py-4 flex items-center justify-between transition-colors group ${
              alert.type === 'critical' ? 'hover:bg-rose-50/20' : 'hover:bg-amber-50/20'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-1.5 h-1.5 rounded-full mt-2 ${
                alert.type === 'critical' ? 'bg-rose-500' : 'bg-amber-500'
              }`}></div>
              <div>
                <p className="text-[#111118] font-semibold text-sm">{alert.title}</p>
                <p className="text-[#616189] text-xs mt-0.5">{alert.description}</p>
              </div>
            </div>
            <button 
              onClick={() => onAction?.(alert)}
              className={`text-sm font-semibold bg-white border border-[#e0e0e4] hover:bg-gray-50 px-4 py-1.5 rounded-lg shadow-sm ${
                alert.actionType === 'primary' 
                  ? 'text-[#1313ec] hover:text-[#1313ec]/80' 
                  : 'text-[#111118] hover:text-[#111118]/80'
              }`}
            >
              {alert.action}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
