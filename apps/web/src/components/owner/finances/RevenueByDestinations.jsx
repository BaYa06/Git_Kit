export default function RevenueByDestinations() {
  const destinations = [
    { name: 'Issyk-Kul', revenue: '8.3M', percent: 45, trend: '+12%', trendType: 'positive', color: 'bg-primary' },
    { name: 'Almaty', revenue: '4.6M', percent: 25, trend: '+8%', trendType: 'positive', color: 'bg-indigo-400' },
    { name: 'Uzbekistan', revenue: '3.7M', percent: 20, trend: '-2%', trendType: 'negative', color: 'bg-indigo-200' },
    { name: 'Другое', revenue: '1.8M', percent: 10, trend: '0%', trendType: 'neutral', color: 'bg-gray-300' },
  ];

  const total = '18.4M';

  return (
    <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#f0f0f4] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[#111118] text-lg font-bold">Выручка по направлениям</h3>
        <button className="p-1 rounded hover:bg-[#f0f0f4] text-[#616189]">
          <span className="material-symbols-outlined">more_horiz</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-8">
        {/* Donut Chart */}
        <div className="relative size-40 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            {/* Background */}
            <path
              className="text-gray-100"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
            />
            {/* Primary (45%) */}
            <path
              className="text-primary"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeDasharray="45, 100"
              strokeWidth="8"
            />
            {/* Indigo-400 (25%) */}
            <path
              className="text-indigo-400"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeDasharray="25, 100"
              strokeDashoffset="-45"
              strokeWidth="8"
            />
            {/* Indigo-200 (20%) */}
            <path
              className="text-indigo-200"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeDasharray="20, 100"
              strokeDashoffset="-70"
              strokeWidth="8"
            />
            {/* Gray (10%) */}
            <path
              className="text-gray-300"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeDasharray="10, 100"
              strokeDashoffset="-90"
              strokeWidth="8"
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs text-[#616189]">Total</span>
            <span className="text-lg font-bold text-[#111118]">{total}</span>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 w-full">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[#616189] text-xs uppercase border-b border-[#f0f0f4]">
                <th className="font-semibold text-left py-2">Направление</th>
                <th className="font-semibold text-right py-2">Выручка</th>
                <th className="font-semibold text-right py-2">%</th>
                <th className="font-semibold text-right py-2">Тренд</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0f4]">
              {destinations.map((dest, index) => (
                <tr key={index}>
                  <td className="py-2.5 flex items-center gap-2">
                    <div className={`size-2 rounded-full ${dest.color}`} />
                    <span className="font-medium text-[#111118]">{dest.name}</span>
                  </td>
                  <td className="py-2.5 text-right font-bold text-[#111118]">{dest.revenue}</td>
                  <td className="py-2.5 text-right text-[#616189]">{dest.percent}%</td>
                  <td className={`py-2.5 text-right font-medium ${
                    dest.trendType === 'positive' 
                      ? 'text-emerald-600' 
                      : dest.trendType === 'negative' 
                        ? 'text-rose-600' 
                        : 'text-[#616189]'
                  }`}>
                    {dest.trend}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
