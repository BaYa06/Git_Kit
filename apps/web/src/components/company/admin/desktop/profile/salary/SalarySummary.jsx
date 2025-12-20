const toneMap = {
  white: 'text-white',
  emerald: 'text-emerald-400',
  red: 'text-red-400',
  primary: 'text-white',
};

export default function SalarySummary({ profile, salary }) {
  return (
    <div className="glass-card rounded-[20px] p-5">
      <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
        <div className="flex items-center gap-5 w-full md:w-auto">
          <div
            className="size-16 rounded-xl bg-cover bg-center shadow-lg ring-2 ring-white/5 shrink-0"
            style={{ backgroundImage: `url(${profile.avatar || ''})` }}
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white">{profile.name}</h2>
              <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-wider border border-purple-500/20">
                {profile.role}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">business</span>
                {profile.company}
              </span>
              <span className="size-1 bg-gray-600 rounded-full" />
              <span className="font-mono text-gray-500">{profile.id}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 w-full md:w-auto justify-between md:justify-end">
          <div className="flex flex-col items-end">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-semibold border border-red-500/10 mb-1">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              Конфиденциально
            </span>
            <span className="text-[11px] text-gray-500 flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">visibility_off</span>
              Доступ ограничен
            </span>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 mt-5" />
      <div className="mt-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
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
                    : 'bg-red-500/50'
                }`}
                style={{ width: `${item.percent}%` }}
              />
            ))}
          </div>
          <div className="flex gap-6 mt-3 flex-wrap">
            {salary.breakdown.map((item) => (
              <div className="flex items-center gap-2" key={item.label}>
                <span
                  className={`size-2 rounded-full ${
                    item.tone === 'blue'
                      ? 'bg-blue-500'
                      : item.tone === 'emerald'
                      ? 'bg-emerald-500'
                      : 'bg-red-500/50'
                  }`}
                />
                <span className="text-xs text-gray-400">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
