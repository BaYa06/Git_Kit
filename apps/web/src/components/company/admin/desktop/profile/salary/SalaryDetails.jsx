const typeTone = {
  blue: 'bg-blue-500/10 text-blue-400 border border-blue-500/10',
  emerald: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10',
  red: 'bg-red-500/10 text-red-400 border border-red-500/10',
};

const amountTone = {
  white: 'text-white',
  emerald: 'text-emerald-400',
  red: 'text-red-400',
};

const toneMap = {
  white: 'text-white',
  emerald: 'text-emerald-400',
  red: 'text-red-400',
  primary: 'text-white',
};

export default function SalaryDetails({ salary }) {
  return (
    <>
      {/* Текущий период и статистика */}
      <div className="glass-card rounded-[20px] p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 relative z-10">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              Текущий период: {salary.periodLabel}
              <span className="px-2.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-500 text-xs font-semibold border border-yellow-500/20 uppercase tracking-wide">
                {salary.status}
              </span>
            </h3>
            <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">calendar_today</span>
              Ожидаемая дата выплаты: {salary.payoutDate}
            </p>
          </div>
          <span className="text-xs text-gray-500 flex items-center gap-1.5 bg-surface-dark/80 px-3 py-1.5 rounded-lg border border-white/5">
            <span className="material-symbols-outlined text-[14px]">visibility</span>
            {salary.visibilityNote}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 relative z-10">
          {salary.cards.map((card) => (
            <div
              key={card.label}
              className={`rounded-xl p-4 border ${
                card.tone === 'primary' ? 'bg-primary/10 border-primary/20 ring-1 ring-primary/10' : 'bg-surface-dark/40 border-white/5'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className={`text-sm ${card.tone === 'primary' ? 'text-primary/80' : 'text-gray-400'} font-medium block mb-1`}>
                  {card.label}
                </span>
                {card.updated ? (
                  <span className="text-[10px] text-primary/60 bg-primary/10 px-1.5 py-0.5 rounded">{card.updated}</span>
                ) : null}
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-bold ${toneMap[card.tone] || 'text-white'}`}>{card.value}</span>
                <span className="text-sm text-gray-400 font-medium">{card.currency}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="relative z-10">
          <div className="flex justify-between text-xs text-gray-400 mb-2 font-medium">
            <span>Структура выплаты</span>
            <span className="text-white">100%</span>
          </div>
          <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden flex">
            {salary.breakdown.map((item) => (
              <div
                key={item.label}
                className={`h-full ${
                  item.tone === 'blue'
                    ? 'bg-blue-500'
                    : item.tone === 'emerald'
                    ? 'bg-emerald-500'
                    : item.tone === 'red'
                    ? 'bg-red-500/50'
                    : 'bg-gray-500'
                }`}
                style={{ width: item.width }}
              />
            ))}
          </div>
          <div className="flex gap-6 mt-3">
            {salary.breakdown.map((item) => (
              <div className="flex items-center gap-2" key={item.label}>
                <span
                  className={`size-2 rounded-full ${
                    item.tone === 'blue'
                      ? 'bg-blue-500'
                      : item.tone === 'emerald'
                      ? 'bg-emerald-500'
                      : item.tone === 'red'
                      ? 'bg-red-500/50'
                      : 'bg-gray-500'
                  }`}
                />
                <span className="text-xs text-gray-400">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Детализация и реквизиты */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="glass-card rounded-[20px] p-6 xl:col-span-2 flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">Детализация</h3>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs text-gray-300 hover:bg-white/10 transition">
            <span className="material-symbols-outlined text-[16px]">calendar_month</span>
            {salary.detailsMonth}
            <span className="material-symbols-outlined text-[16px]">expand_more</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs text-gray-500 uppercase tracking-wider">
                <th className="pb-3 font-medium pl-2">Дата</th>
                <th className="pb-3 font-medium">Тип</th>
                <th className="pb-3 font-medium">Описание</th>
                <th className="pb-3 font-medium text-right">Сумма</th>
                <th className="pb-3 font-medium text-right pr-2">Комментарий</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {salary.details.map((row, idx) => (
                <tr className="border-b border-white/5 group hover:bg-white/5 transition-colors" key={`${row.date}-${idx}`}>
                  <td className="py-4 pl-2 text-gray-400">{row.date}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded text-xs ${typeTone[row.typeTone] || 'bg-white/5 text-gray-300 border border-white/10'}`}>
                      {row.type}
                    </span>
                  </td>
                  <td className="py-4 text-white font-medium">{row.title}</td>
                  <td className={`py-4 text-right ${amountTone[row.amountTone] || 'text-white'}`}>{row.amount}</td>
                  <td className="py-4 text-right pr-2 text-gray-500 text-xs">{row.note}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-white/[0.02]">
                <td className="py-4 pl-2 text-white font-bold" colSpan={3}>
                  Итого к выплате
                </td>
                <td className="py-4 text-right text-white font-bold text-lg">
                  {salary.total} <span className="text-sm font-normal text-gray-500">KGS</span>
                </td>
                <td className="py-4" />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-6 xl:col-span-1">
        <div className="glass-card rounded-[20px] p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Реквизиты для выплат</h3>
          </div>
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-xs text-gray-500 block mb-1">Получатель</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-white font-medium">{salary.payment.recipient}</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-xs text-gray-500 block mb-1">Банк / Кошелек</span>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-yellow-500 text-[18px]">account_balance</span>
                <span className="text-sm text-white font-medium">{salary.payment.bank}</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-xs text-gray-500 block mb-1">Номер счета / Карты</span>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white font-mono tracking-wider">{salary.payment.maskedAccount}</span>
                <span className="text-xs text-primary cursor-pointer hover:underline">Показать</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-xs text-gray-500 block mb-1">Валюта</span>
              <span className="text-sm text-white font-medium">{salary.payment.currency}</span>
            </div>
            <button className="w-full py-2.5 rounded-xl border border-white/10 bg-transparent hover:bg-white/5 text-sm font-medium text-white transition mt-2" type="button">
              Обновить реквизиты
            </button>
          </div>
        </div>

        <div className="glass-card rounded-[20px] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Правила бонусов</h3>
          </div>
          <ul className="space-y-3 mb-4">
            {salary.bonusRules.map((rule, idx) => (
              <li className="flex gap-3 text-sm text-gray-400" key={`${rule}-${idx}`}>
                <span className="material-symbols-outlined text-primary text-[18px] shrink-0">check_circle</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
          <a className="text-primary text-sm font-medium hover:text-white transition flex items-center gap-1" href="#">
            Подробнее о компенсациях
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </a>
        </div>
      </div>
      </div>
    </>
  );
}
