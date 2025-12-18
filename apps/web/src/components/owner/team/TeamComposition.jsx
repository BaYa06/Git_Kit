const formatNumber = (value) => {
  const num = Number(value || 0);
  try {
    return new Intl.NumberFormat('ru-RU').format(num);
  } catch {
    return String(num);
  }
};

export default function TeamComposition({ admins = 0, managers = 0, guides = 0 }) {
  const items = [
    { role: 'Админы', count: Number(admins || 0), color: 'bg-indigo-500' },
    { role: 'Менеджеры', count: Number(managers || 0), color: 'bg-primary' },
    { role: 'Гиды', count: Number(guides || 0), color: 'bg-emerald-500' },
  ];

  const total = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="bg-white rounded-xl border border-[#e0e0e4] shadow-sm p-5 flex-1 flex flex-col">
      <h3 className="text-base font-bold text-[#111118] mb-4">Состав команды</h3>
      
      <div className="flex-1 flex flex-col justify-center gap-4">
        {items.map((item, index) => {
          const percent = total > 0 ? Math.round((item.count / total) * 100) : 0;
          return (
          <div key={index}>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium">{item.role}</span>
              <span className="text-[#616189]">
                {formatNumber(item.count)} чел. · {percent}%
              </span>
            </div>
            <div className="h-2 w-full bg-[#f0f0f4] rounded-full overflow-hidden">
              <div
                className={`h-full ${item.color} rounded-full`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}
