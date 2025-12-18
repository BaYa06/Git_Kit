export default function AttentionZones({ zones }) {
  const data = Array.isArray(zones) ? zones : [];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-rose-500';
      case 'warning':
        return 'bg-amber-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#e0e0e4] shadow-sm flex flex-col">
      <div className="px-6 py-4 border-b border-[#f0f0f4]">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-600">check_circle</span>
          <h3 className="text-lg font-bold text-[#111118]">Зоны внимания</h3>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <div className="inline-flex items-center justify-center size-12 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 mb-3">
            <span className="material-symbols-outlined">verified</span>
          </div>
          <p className="text-sm font-semibold text-[#111118]">Пока всё хорошо</p>
          <p className="text-xs text-[#616189] mt-1">
            Критических и предупреждающих зон сейчас нет
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[#f0f0f4]">
          {data.map((zone) => (
            <div
              key={zone.id}
              className="px-6 py-4 flex items-start gap-4 hover:bg-[#fafafa] transition-colors group"
            >
              <div className={`mt-1 h-full w-1 rounded-full ${getSeverityColor(zone.severity)} flex-shrink-0`} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#111118]">{zone.title}</p>
                <p className="text-xs text-[#616189] mt-0.5">{zone.subtitle}</p>
              </div>
              <button className="text-xs font-semibold text-primary bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors">
                Посмотреть
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
