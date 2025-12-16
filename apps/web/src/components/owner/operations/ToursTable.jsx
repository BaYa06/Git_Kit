import { useState } from 'react';

const defaultTours = [
  {
    id: 'TR-4020',
    date: '17 Dec',
    time: '07:00',
    name: 'Горнолыжный База "Каракол"',
    pax: 18,
    status: 'active',
    responsible: { initials: 'EA', name: 'Елена А.' },
    guide: 'Иван Петров',
    transport: { name: 'MB Sprinter', plate: '#0492', warning: false },
    readiness: { current: 10, total: 10 },
    payment: 'paid',
    risk: 'low',
    notes: 'VIP клиент в группе...',
    isHighRisk: false,
  },
  {
    id: 'TR-4021',
    date: '18 Dec',
    time: '06:30',
    name: 'Иссык-Куль: Южный берег',
    pax: 42,
    status: 'preparing',
    responsible: { initials: 'DK', name: 'Дмитрий К.' },
    guide: null,
    transport: { name: 'Neoplan', plate: null, warning: true },
    readiness: { current: 6, total: 10 },
    payment: 'due',
    risk: 'high',
    notes: 'Срочно найти гида!',
    isHighRisk: true,
  },
  {
    id: 'TR-4022',
    date: '19 Dec',
    time: '08:00',
    name: 'Чункурчак: Зима',
    pax: 15,
    status: 'confirmed',
    responsible: { initials: 'AS', name: 'Анна С.' },
    guide: 'Ольга Мин',
    transport: { name: 'Sprinter', plate: '#8812', warning: false },
    readiness: { current: 9, total: 10 },
    payment: 'paid',
    risk: 'low',
    notes: '-',
    isHighRisk: false,
  },
  {
    id: 'TR-4025',
    date: '20 Dec',
    time: '07:00',
    name: 'Алматы: Медео + Шымбулак',
    pax: 0,
    status: 'draft',
    responsible: { initials: 'EA', name: 'Елена А.' },
    guide: null,
    transport: { name: null, plate: null, warning: false },
    readiness: { current: 1, total: 10 },
    payment: 'empty',
    risk: 'none',
    notes: 'Запуск рекламы завтра',
    isHighRisk: false,
  },
];

function getStatusBadge(status) {
  const styles = {
    active: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Active' },
    preparing: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', label: 'Preparing' },
    confirmed: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', label: 'Confirmed' },
    draft: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', label: 'Draft' },
  };
  return styles[status] || styles.draft;
}

function getPaymentBadge(payment) {
  const styles = {
    paid: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', label: 'Paid' },
    due: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', label: 'Due' },
    empty: { bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200', label: 'Empty' },
  };
  return styles[payment] || styles.empty;
}

function getRiskBadge(risk) {
  const styles = {
    high: { icon: 'error', color: 'text-rose-600', label: 'High', bold: true },
    medium: { icon: 'warning', color: 'text-amber-600', label: 'Medium', bold: false },
    low: { icon: 'check_circle', color: 'text-slate-400', label: 'Low', bold: false },
    none: { icon: 'remove', color: 'text-slate-400', label: 'None', bold: false },
  };
  return styles[risk] || styles.none;
}

function getReadinessColor(current, total) {
  const percent = (current / total) * 100;
  if (percent >= 90) return { bar: 'bg-emerald-500', text: 'text-emerald-600' };
  if (percent >= 50) return { bar: 'bg-amber-500', text: 'text-amber-600' };
  if (percent >= 20) return { bar: 'bg-[#4f46e5]', text: 'text-[#4f46e5]' };
  return { bar: 'bg-slate-300', text: 'text-slate-400' };
}

export default function ToursTable({ tours = defaultTours, onTourClick }) {
  const [activeTab, setActiveTab] = useState('list');
  const [currentPage, setCurrentPage] = useState(1);
  const totalTours = 12;

  const tabs = [
    { key: 'list', label: 'Список', icon: 'list' },
    { key: 'calendar', label: 'Календарь', icon: 'calendar_month' },
    { key: 'risks', label: 'Риски', icon: 'bug_report', badge: 8 },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden min-h-[500px]">
      {/* Tabs */}
      <div className="px-6 border-b border-slate-200 flex items-center gap-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === tab.key
                ? 'text-[#4f46e5] border-[#4f46e5] font-semibold'
                : 'text-slate-500 hover:text-slate-900 border-transparent hover:border-slate-300'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{tab.icon}</span>
            {tab.label}
            {tab.badge && (
              <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-xs">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[120px]">Дата / Время</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider min-w-[200px]">Тур / ID</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[60px]">PAX</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[110px]">Статус</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ответственный</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Гид</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Транспорт</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[160px]">Готовность</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Оплаты</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[100px]">Риск</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Прим.</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right w-[50px]">...</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tours.map((tour) => {
              const statusBadge = getStatusBadge(tour.status);
              const paymentBadge = getPaymentBadge(tour.payment);
              const riskBadge = getRiskBadge(tour.risk);
              const readinessColor = getReadinessColor(tour.readiness.current, tour.readiness.total);
              const readinessPercent = (tour.readiness.current / tour.readiness.total) * 100;

              return (
                <tr
                  key={tour.id}
                  onClick={() => onTourClick?.(tour)}
                  className={`hover:bg-slate-50 transition-colors cursor-pointer group ${
                    tour.isHighRisk ? 'bg-rose-50/30' : ''
                  }`}
                >
                  <td className="px-4 py-3 align-top">
                    <p className="text-sm font-bold text-slate-900">{tour.date}</p>
                    <p className="text-xs text-slate-500">{tour.time}</p>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <p className="text-sm font-medium text-[#4f46e5] hover:underline">{tour.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">ID: <span className="font-mono">#{tour.id}</span></p>
                  </td>
                  <td className="px-4 py-3 align-top text-sm font-medium text-slate-900">{tour.pax}</td>
                  <td className="px-4 py-3 align-top">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${statusBadge.bg} ${statusBadge.text} text-xs font-medium border ${statusBadge.border}`}>
                      {statusBadge.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex items-center gap-2">
                      <div className="size-6 rounded-full bg-slate-200 text-[10px] flex items-center justify-center font-bold text-slate-600">
                        {tour.responsible.initials}
                      </div>
                      <span className="text-xs text-slate-700">{tour.responsible.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    {tour.guide ? (
                      <span className="text-xs text-slate-700">{tour.guide}</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-bold border border-rose-200 uppercase tracking-wide">
                        Not Assigned
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top">
                    {tour.transport.name ? (
                      tour.transport.warning ? (
                        <div className="flex items-center gap-1 text-amber-600" title="Check transport">
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>warning</span>
                          <span className="text-xs font-medium">{tour.transport.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-700">
                          {tour.transport.name} <span className="text-slate-400">{tour.transport.plate}</span>
                        </span>
                      )
                    ) : (
                      <span className="text-xs text-slate-400 italic">No transport</span>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-col gap-1 w-full max-w-[140px]">
                      <div className="flex justify-between text-[10px] font-medium text-slate-500">
                        <span>{readinessPercent >= 90 ? 'Ready' : readinessPercent >= 10 ? 'Progress' : 'Start'}</span>
                        <span className={readinessColor.text}>{tour.readiness.current}/{tour.readiness.total}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${readinessColor.bar} rounded-full`}
                          style={{ width: `${readinessPercent}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <span className={`text-xs font-bold ${paymentBadge.text} ${paymentBadge.bg} px-2 py-0.5 rounded border ${paymentBadge.border}`}>
                      {paymentBadge.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className={`flex items-center gap-1 ${riskBadge.color}`}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{riskBadge.icon}</span>
                      <span className={`text-xs ${riskBadge.bold ? 'font-bold' : ''}`}>{riskBadge.label}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <p className={`text-xs truncate max-w-[150px] ${
                      tour.isHighRisk ? 'text-rose-500 font-medium' : 'text-slate-400'
                    }`}>
                      {tour.notes}
                    </p>
                  </td>
                  <td className="px-4 py-3 align-top text-right">
                    <button className="text-slate-400 hover:text-slate-700">
                      <span className="material-symbols-outlined">more_horiz</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
        <p className="text-xs text-slate-500">Showing {tours.length} of {totalTours} tours</p>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-white border border-slate-200 rounded text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-3 py-1 bg-white border border-slate-200 rounded text-xs font-medium text-slate-600 hover:bg-slate-100"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
