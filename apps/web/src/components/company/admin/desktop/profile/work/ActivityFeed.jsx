const toneMap = {
  primary: 'bg-primary/20 text-primary border border-primary/20',
  purple: 'bg-purple-500/20 text-purple-400 border border-purple-500/20',
  emerald: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20',
  orange: 'bg-orange-500/20 text-orange-400 border border-orange-500/20',
  gray: 'bg-gray-700/50 text-gray-400 border border-white/10',
};

export default function ActivityFeed({ activities }) {
  return (
    <div className="glass-card rounded-[20px] p-6 flex-1">
      <h3 className="text-lg font-bold text-white mb-6">Последние действия</h3>
      <div className="relative pl-2">
        {activities.map((item, idx) => (
          <div className="flex gap-4 mb-6 relative z-10" key={`${item.title}-${idx}`}>
            <div className="flex flex-col items-center">
              <div
                className={`size-8 rounded-full flex items-center justify-center shrink-0 ${
                  toneMap[item.tone] || toneMap.gray
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
              </div>
              {idx !== activities.length - 1 && (
                <div className="w-px h-full bg-white/10 mt-2 absolute top-8 left-[15px] -z-10"></div>
              )}
            </div>
            <div className="pt-1">
              <p className="text-sm text-white font-medium">{item.title}</p>
              <span className="text-xs text-gray-500">{item.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
