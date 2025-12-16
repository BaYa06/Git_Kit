import { useState } from 'react';

const defaultTrips = [
  {
    id: 1,
    date: '17 Dec, Сегодня',
    time: '07:00 AM',
    destination: 'Горнолыжный База "Каракол"',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDktTehAVkquEvFeLXznl_C1HTLBcUaja_JK8lzfuLZzNB-hUVVKK7uZ4eUizdGD3rqfxsTb9YVj99KvOU0PPA63zU6b5RIASB1mm3fq98Yz_Uec0pFxxQ-YXcAAZRkN1WcDzYowq53MeiL03r2H1N2GnC7eOu6kwMT0rTOtgxXQfbHf397H5BLUEu0Krf8M2dZqsNCkMhakWe3X4fPP-3jQEufYpH4dBfQizDrubeEPC8LdquE7YJwusMfy7nMh_S1NNyeWE-ZzJE',
    pax: '18/20',
    readiness: 100,
    payment: 'paid',
    status: 'in_progress',
    statusLabel: 'В пути',
  },
  {
    id: 2,
    date: '18 Dec, Завтра',
    time: '06:30 AM',
    destination: 'Иссык-Куль: Южный берег',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBH3Mq2QIfj2mkxv6bw5nuBjB5VZcYjlj5HOsCKrF8KMNZpBsnICtNbpsrBVReU3gNV6mU0cBI05ECgIJ4NiNL_4aI8ZOd2Z4ZydOSWOTSR6qs2z6nAwLGGZMM5-tM7LL1mrzhtDPBm_SZQ6k_sLqbQTGQkespTvCVozew7GgrBzjaqkX0H4fjWrmhbbMKkDCwIycYt5Uo7rm7eMJA7S9PQriN8gml7Gkw-W5GoWB_X84riIGVsjTL9CPNvmjWzghcL6VTfZvsJdbE',
    pax: '42/45',
    readiness: 60,
    readinessWarning: '! Нет гида',
    payment: 'partial',
    status: 'risk',
    statusLabel: 'Риск',
  },
  {
    id: 3,
    date: '19 Dec',
    time: '08:00 AM',
    destination: 'Чункурчак: Зима',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1TJssdzTKHcyFea_c88OwdSG_i9F2DjJIN35yugRsf4axcW1iCSlWb_Urwo28MgW_N5VMszqKcX75VU5DN6z-gkfhO0rABmF_Y9b_qNP7UhHFdf-7xrdO-qEnTryd7fDiRnxMVbeLr6q7KImQip43BxumpdMVHa9laB4w33Xj8b2TfwlImY6UiYKiJV9B81pNTZuyEOTZ16aq_IZb2CISGguuYuDOPdb8hRZeyRrtxZ1M86EuWEZu69tUcekyXC6Wca_zVSVYwkk',
    pax: '12/15',
    readiness: 90,
    payment: 'paid',
    status: 'planned',
    statusLabel: 'Планово',
  },
];

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

export default function UpcomingTripsTable({ trips = defaultTrips }) {
  const [activeTab, setActiveTab] = useState('today');
  
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
            {trips.map((trip) => {
              const statusStyles = getStatusStyles(trip.status);
              const paymentBadge = getPaymentBadge(trip.payment);
              
              return (
                <tr key={trip.id} className="group hover:bg-[#f8f8fa] transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-[#111118]">{trip.date}</p>
                    <p className="text-xs text-[#616189]">{trip.time}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div 
                        className="size-8 rounded-lg bg-gray-200 bg-cover bg-center"
                        style={{ backgroundImage: `url('${trip.image}')` }}
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
                    {trip.readinessWarning && (
                      <p className="text-[10px] text-rose-500 mt-1">{trip.readinessWarning}</p>
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
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
