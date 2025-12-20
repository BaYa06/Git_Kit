const typeTone = {
  blue: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  purple: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  orange: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  gray: 'bg-white/5 text-gray-400 border border-gray-500/20',
};

const statusTone = {
  emerald: 'text-emerald-400',
  warning: 'text-yellow-400',
  gray: 'text-gray-400',
};

export default function WorkHistory({ history }) {
  return (
    <div className="glass-card rounded-[20px] p-6 mb-8 overflow-hidden">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <h3 className="text-lg font-bold text-white">История работы</h3>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative grow sm:grow-0">
            <select className="w-full sm:w-40 appearance-none bg-surface-dark border border-white/10 rounded-lg py-2 pl-3 pr-8 text-sm text-gray-300 focus:ring-1 focus:ring-primary focus:border-primary outline-none">
              <option>Все события</option>
              <option>Туры</option>
              <option>Задачи</option>
              <option>Система</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-2.5 text-gray-500 pointer-events-none text-[18px]">
              expand_more
            </span>
          </div>
          <div className="relative grow sm:grow-0">
            <select className="w-full sm:w-40 appearance-none bg-surface-dark border border-white/10 rounded-lg py-2 pl-3 pr-8 text-sm text-gray-300 focus:ring-1 focus:ring-primary focus:border-primary outline-none">
              <option>За месяц</option>
              <option>За неделю</option>
              <option>За год</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-2.5 text-gray-500 pointer-events-none text-[18px]">
              expand_more
            </span>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="pb-4 pl-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Дата</th>
              <th className="pb-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Тип</th>
              <th className="pb-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Объект</th>
              <th className="pb-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Описание</th>
              <th className="pb-4 pr-2 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Статус</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {history.map((row, idx) => (
              <tr
                key={`${row.date}-${idx}`}
                className="group border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="py-4 pl-2 text-gray-300 font-medium">{row.date}</td>
                <td className="py-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${typeTone[row.typeTone] || typeTone.gray}`}>
                    {row.type}
                  </span>
                </td>
                <td className="py-4 text-primary hover:underline cursor-pointer">{row.object}</td>
                <td className="py-4 text-gray-400 max-w-xs truncate">{row.desc}</td>
                <td className="py-4 pr-2 text-right">
                  <span className={`inline-flex items-center gap-1 ${statusTone[row.statusTone] || 'text-gray-400'} text-xs font-medium`}>
                    <span className="material-symbols-outlined text-[14px]">
                      {row.statusTone === 'warning' ? 'schedule' : row.statusTone === 'emerald' ? 'check_circle' : 'info'}
                    </span>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
        <span className="text-xs text-gray-500">Показано 1-4 из 124 событий</span>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-gray-400 text-xs transition disabled:opacity-50" disabled>
            Назад
          </button>
          <button className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs shadow-lg shadow-primary/20">1</button>
          <button className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-gray-400 text-xs transition">
            2
          </button>
          <button className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-gray-400 text-xs transition">
            3
          </button>
          <span className="text-gray-600 self-center">...</span>
          <button className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-gray-400 text-xs transition">
            Вперед
          </button>
        </div>
      </div>
    </div>
  );
}
