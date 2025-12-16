import { useMemo, useState } from 'react';

function getReadinessColor(value) {
  if (value >= 90) return 'bg-emerald-500';
  if (value >= 60) return 'bg-amber-500';
  return 'bg-[#1313ec]';
}

function getReadinessTextColor(value) {
  if (value >= 90) return 'text-emerald-600';
  if (value >= 60) return 'text-amber-600';
  return 'text-[#1313ec]';
}

function getStatusStyles(status) {
  switch (status) {
    case 'in_progress':
      return { dot: 'bg-emerald-500', text: 'text-emerald-600' };
    case 'risk':
      return { dot: 'bg-amber-500', text: 'text-amber-600' };
    case 'ideal':
      return { dot: 'bg-blue-500', text: 'text-blue-600' };
    case 'planned':
      return { dot: 'bg-slate-400', text: 'text-slate-600' };
    default:
      return { dot: 'bg-slate-400', text: 'text-slate-600' };
  }
}

function getPaymentBadge(payment) {
  switch (payment) {
    case 'paid':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Оплачено' };
    case 'partial':
      return { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Частично' };
    default:
      return { bg: 'bg-slate-50', text: 'text-slate-700', label: 'Не оплачено' };
  }
}

function parseDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(`${dateStr}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDateLabel(dateStr) {
  if (!dateStr) return '';
  const d = parseDate(dateStr);
  if (!d) return dateStr;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const label = d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' });
  if (diffDays === 0) return `${label}, Сегодня`;
  if (diffDays === 1) return `${label}, Завтра`;
  return label;
}

export default function UpcomingTripsTable({ trips = [], loading = false }) {
  const [activeTab, setActiveTab] = useState('today');
  const filtered = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);

    return (trips || []).filter((t) => {
      const d = parseDate(t.startDate || t.date);
      if (!d) return false;
      d.setHours(0, 0, 0, 0);

      if (activeTab === 'today') return d.getTime() === today.getTime();
      if (activeTab === 'tomorrow') return d.getTime() === tomorrow.getTime();
      return d.getTime() >= today.getTime() && d.getTime() <= weekEnd.getTime();
    });
  }, [trips, activeTab]);

  return (
    <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#f0f0f4] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#f0f0f4] flex items-center justify-between">
        <h3 className="text-[#111118] text-lg font-bold">Ближайшие выезды</h3>
        <div className="flex gap-2">
          <div className="flex bg-[#f0f0f4] rounded-lg p-0.5">
            {['today', 'tomorrow', '7days'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-md text-xs transition-colors ${
                  activeTab === tab
                    ? 'bg-white text-[#111118] font-bold shadow-sm'
                    : 'text-[#616189] hover:text-[#111118] font-medium'
                }`}
              >
                {tab === 'today' ? 'Сегодня' : tab === 'tomorrow' ? 'Завтра' : '7 дней'}
              </button>
            ))}
          </div>
          <button className="p-2 rounded-lg hover:bg-[#f0f0f4] text-[#1313ec] text-sm font-semibold">
            Открыть все
          </button>
        </div>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#fcfcfd] border-b border-[#f0f0f4]">
              <th className="px-6 py-3 text-xs font-semibold text-[#616189] uppercase tracking-wider">Дата / Время</th>
              <th className="px-6 py-3 text-xs font-semibold text-[#616189] uppercase tracking-wider">Направление</th>
              <th className="px-6 py-3 text-xs font-semibold text-[#616189] uppercase tracking-wider">PAX</th>
              <th className="px-6 py-3 text-xs font-semibold text-[#616189] uppercase tracking-wider">Готовность</th>
              <th className="px-6 py-3 text-xs font-semibold text-[#616189] uppercase tracking-wider">Оплаты</th>
              <th className="px-6 py-3 text-xs font-semibold text-[#616189] uppercase tracking-wider">Статус</th>
              <th className="px-6 py-3 text-xs font-semibold text-[#616189] uppercase tracking-wider text-right">Действие</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0f0f4]">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-6 text-center text-sm text-[#616189]">
                  Загружаем выезды...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-6 text-center text-sm text-[#616189]">
                  Нет выездов в выбранный период
                </td>
              </tr>
            ) : (
              filtered.map((trip) => {
              const statusStyles = getStatusStyles(trip.status);
              const paymentBadge = getPaymentBadge(trip.payment);
              const dateLabel = formatDateLabel(trip.startDate || trip.date);

              return (
                <tr key={trip.id} className="group hover:bg-[#f8f8fa] transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-[#111118]">{dateLabel}</p>
                    <p className="text-xs text-[#616189]">{trip.time || '—'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div 
                        className="size-8 rounded-lg bg-gray-200 bg-cover bg-center"
                        style={{ backgroundImage: trip.image ? `url('${trip.image}')` : 'none' }}
                      />
                      <p className="text-sm font-medium text-[#111118]">{trip.destination}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#111118] font-medium">
                    {trip.pax}
                  </td>
                  <td className="px-6 py-4 w-48">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-[#f0f0f4] rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${getReadinessColor(trip.readiness)}`}
                          style={{ width: `${trip.readiness}%` }}
                        />
                      </div>
                      <span className={`text-xs font-bold ${getReadinessTextColor(trip.readiness)}`}>
                        {trip.readiness}%
                      </span>
                    </div>
                    {trip.readinessWarning ? (
                      <p className="text-[10px] text-rose-500 mt-1">
                        {trip.readinessWarning}
                      </p>
                    ) : trip.missingComponents && trip.missingComponents.length > 0 ? (
                      <p className="text-[10px] text-rose-500 mt-1">
                        Не хватает: {trip.missingComponents.join(', ')}
                      </p>
                    ) : (
                      <p className="text-[10px] text-emerald-600 mt-1">Все готово</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded ${paymentBadge.bg} ${paymentBadge.text} text-xs font-medium`}>
                      {paymentBadge.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1.5 text-xs font-medium ${statusStyles.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusStyles.dot}`}></span>
                      {trip.statusLabel}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-[#616189] hover:text-[#111118] p-1 rounded hover:bg-gray-200">
                      <span className="material-symbols-outlined">more_horiz</span>
                    </button>
                  </td>
                </tr>
              );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
