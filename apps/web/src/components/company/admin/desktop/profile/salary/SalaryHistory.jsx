export default function SalaryHistory({ history }) {
  return (
    <div className="glass-card rounded-[20px] p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h3 className="text-lg font-bold text-white">История начислений</h3>
        <div className="flex flex-wrap gap-2">
          <button className="px-3 py-1.5 rounded-lg bg-white/5 text-xs text-gray-300 hover:bg-white/10 transition border border-white/10" type="button">
            Последние 3 месяца
          </button>
          <button className="px-3 py-1.5 rounded-lg bg-white/5 text-xs text-gray-300 hover:bg-white/10 transition border border-white/10" type="button">
            2025
          </button>
          <button className="px-3 py-1.5 rounded-lg bg-white/5 text-xs text-gray-300 hover:bg-white/10 transition border border-white/10 flex items-center gap-1" type="button">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Только Paid
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-xs text-gray-500 uppercase tracking-wider">
              <th className="pb-3 font-medium pl-2">Период</th>
              <th className="pb-3 font-medium">Оклад</th>
              <th className="pb-3 font-medium">Бонус</th>
              <th className="pb-3 font-medium">Удержания</th>
              <th className="pb-3 font-medium">Итого</th>
              <th className="pb-3 font-medium">Статус</th>
              <th className="pb-3 font-medium text-right pr-2">Действия</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {history.map((row) => (
              <tr className="border-b border-white/5 group hover:bg-white/5 transition-colors" key={row.period}>
                <td className="py-4 pl-2 text-white font-medium">{row.period}</td>
                <td className="py-4 text-gray-300">{row.salary}</td>
                <td className="py-4 text-emerald-400">{row.bonus}</td>
                <td className="py-4 text-red-400">{row.deductions}</td>
                <td className="py-4 text-white font-bold">{row.total}</td>
                <td className="py-4">
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/10">
                    <span className="size-1.5 rounded-full bg-emerald-400" />
                    {row.status}
                  </span>
                </td>
                <td className="py-4 text-right pr-2">
                  <button className="text-gray-400 hover:text-white transition p-1" type="button">
                    <span className="material-symbols-outlined text-[20px]">download</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
        <span className="text-xs text-gray-500">Показано 3 из 24 записей</span>
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded-lg border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 text-xs disabled:opacity-50 disabled:cursor-not-allowed" disabled type="button">
            Назад
          </button>
          <button className="px-3 py-1 rounded-lg border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 text-xs" type="button">
            Вперед
          </button>
        </div>
      </div>
    </div>
  );
}
