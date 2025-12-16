export default function ServiceQualityWidget() {
  const ratings = [
    { label: '5 Звезд', percent: 75, color: 'bg-emerald-500' },
    { label: '4 Звезды', percent: 15, color: 'bg-amber-400' },
    { label: '1-3 Звезды', percent: 10, color: 'bg-rose-500' },
  ];

  return (
    <div className="bg-white p-6 rounded-xl border border-[#e0e0e4] shadow-sm flex flex-col">
      <h3 className="text-lg font-bold text-[#111118] mb-4">Качество сервиса</h3>

      <div className="flex items-center gap-6 mb-6">
        {/* Donut Chart */}
        <div className="relative size-32 flex-shrink-0">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'conic-gradient(#10b981 0% 75%, #fbbf24 75% 90%, #f43f5e 90% 100%)',
            }}
          />
          <div className="absolute inset-3 bg-white rounded-full flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-[#111118]">4.7</span>
            <div className="flex">
              <span className="material-symbols-outlined text-amber-400" style={{ fontSize: '14px' }}>
                star
              </span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-1.5 w-full">
          {ratings.map((rating, index) => (
            <div key={index} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className={`size-2 ${rating.color} rounded-full`} />
                <span className="text-[#616189]">{rating.label}</span>
              </div>
              <span className="font-bold">{rating.percent}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Complaints summary */}
      <div className="mt-auto border-t border-[#f0f0f4] pt-4 grid grid-cols-2 gap-4">
        <div className="bg-red-50 rounded-lg p-3 border border-red-100">
          <p className="text-[10px] text-red-600 font-bold uppercase">Жалобы</p>
          <p className="text-lg font-bold text-red-700 leading-none mt-1">
            6 <span className="text-xs font-normal text-red-500">всего</span>
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
          <p className="text-[10px] text-gray-500 font-bold uppercase">Нерешено</p>
          <p className="text-lg font-bold text-[#111118] leading-none mt-1">
            2 <span className="text-xs font-normal text-gray-400">active</span>
          </p>
        </div>
      </div>
    </div>
  );
}
