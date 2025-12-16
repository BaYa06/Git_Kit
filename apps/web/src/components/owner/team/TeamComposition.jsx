export default function TeamComposition() {
  const composition = [
    { role: 'Менеджеры', count: 12, percent: 45, color: 'bg-primary' },
    { role: 'Гиды', count: 18, percent: 65, color: 'bg-indigo-400' },
    { role: 'Координаторы', count: 4, percent: 20, color: 'bg-indigo-300' },
  ];

  return (
    <div className="bg-white rounded-xl border border-[#e0e0e4] shadow-sm p-5 flex-1 flex flex-col">
      <h3 className="text-base font-bold text-[#111118] mb-4">Состав команды</h3>
      
      <div className="flex-1 flex flex-col justify-center gap-4">
        {composition.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium">{item.role}</span>
              <span className="text-[#616189]">{item.count} чел.</span>
            </div>
            <div className="h-2 w-full bg-[#f0f0f4] rounded-full overflow-hidden">
              <div
                className={`h-full ${item.color} rounded-full`}
                style={{ width: `${item.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
