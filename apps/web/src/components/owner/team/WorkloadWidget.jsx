export default function WorkloadWidget() {
  const metrics = [
    {
      label: 'Туров / Гид',
      value: '4.2',
      status: 'Норма',
      statusColor: 'text-emerald-600',
    },
    {
      label: 'Лидов / Менеджер',
      value: '35',
      status: 'Высокая',
      statusColor: 'text-amber-600 font-medium',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-[#e0e0e4] shadow-sm p-5 flex-1 flex flex-col">
      <h3 className="text-base font-bold text-[#111118] mb-4">Нагрузка</h3>

      <div className="flex gap-6 items-center">
        {metrics.map((metric, index) => (
          <div key={index} className="flex flex-col gap-1">
            {index > 0 && <div className="h-10 w-px bg-[#f0f0f4]" />}
            <span className="text-[10px] uppercase font-bold text-[#616189]">{metric.label}</span>
            <span className="text-2xl font-bold text-[#111118]">{metric.value}</span>
            <span className={`text-xs ${metric.statusColor}`}>{metric.status}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-[#f0f0f4]">
        <p className="text-xs text-[#616189]">
          Пиковые дни: <span className="text-[#111118] font-semibold">Пятница, Суббота</span>
        </p>
      </div>
    </div>
  );
}
