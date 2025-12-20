const toneMap = {
  emerald: 'text-emerald-400 bg-emerald-400/10',
  danger: 'text-red-400 bg-red-400/10',
  neutral: 'text-gray-400 bg-white/5',
};

export default function SmallStats({ stats }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat) => (
        <div className="glass-card rounded-xl p-4 flex flex-col" key={stat.title}>
          <span className="text-xs text-gray-500 mb-1">{stat.title}</span>
          <div className="flex items-end justify-between mt-1">
            <span className="text-2xl font-bold text-white">{stat.value}</span>
            <span
              className={`flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded ${
                toneMap[stat.tone] || 'text-gray-400 bg-white/5'
              }`}
            >
              {stat.delta}
              {stat.delta && (
                <span className="material-symbols-outlined text-[12px] ml-0.5">
                  {stat.delta.startsWith('-') ? 'trending_down' : 'trending_up'}
                </span>
              )}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
