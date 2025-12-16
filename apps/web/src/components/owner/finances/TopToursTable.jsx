export default function TopToursTable({ tours }) {
  const defaultTours = [
    {
      name: 'Новогодний Каракол',
      period: '30 Dec - 02 Jan',
      revenue: '1.2M',
      paymentStatus: 'paid',
    },
    {
      name: 'Уикенд в Алматы',
      period: '24 Dec - 26 Dec',
      revenue: '850K',
      paymentStatus: 'partial',
    },
    {
      name: 'Самарканд Экспресс',
      period: '15 Jan - 20 Jan',
      revenue: '620K',
      paymentStatus: 'paid',
    },
    {
      name: 'Ski Чункурчак',
      period: '18 Dec (1 day)',
      revenue: '145K',
      paymentStatus: 'due',
    },
    {
      name: 'Ала-Арча: Зима',
      period: '19 Dec (1 day)',
      revenue: '89K',
      paymentStatus: 'paid',
    },
  ];

  const data = tours || defaultTours;

  const getPaymentBadge = (status) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded bg-emerald-50 text-emerald-700 text-xs font-medium">
            Paid
          </span>
        );
      case 'partial':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded bg-amber-50 text-amber-700 text-xs font-medium">
            Partial
          </span>
        );
      case 'due':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded bg-rose-50 text-rose-700 text-xs font-medium">
            Due
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#f0f0f4] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#f0f0f4] flex items-center justify-between">
        <h3 className="text-[#111118] text-lg font-bold">Топ-туров по выручке</h3>
        <button className="text-primary text-sm font-semibold hover:underline">Все туры</button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-[#fcfcfd] border-b border-[#f0f0f4]">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-[#616189] uppercase">Тур</th>
              <th className="px-6 py-3 text-xs font-semibold text-[#616189] uppercase">Период</th>
              <th className="px-6 py-3 text-xs font-semibold text-[#616189] uppercase">Выручка</th>
              <th className="px-6 py-3 text-xs font-semibold text-[#616189] uppercase text-right">Оплата</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0f0f4]">
            {data.map((tour, index) => (
              <tr key={index} className="hover:bg-[#f8f8fa]">
                <td className="px-6 py-3 text-sm font-medium text-[#111118]">{tour.name}</td>
                <td className="px-6 py-3 text-sm text-[#616189]">{tour.period}</td>
                <td className="px-6 py-3 text-sm font-bold text-[#111118]">{tour.revenue}</td>
                <td className="px-6 py-3 text-right">{getPaymentBadge(tour.paymentStatus)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
