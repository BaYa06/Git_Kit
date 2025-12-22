const typeConfig = {
  meeting: { label: "Встреча", icon: "📍", color: "#10b981" },
  first_meeting: { label: "Первая встреча", icon: "🚩", color: "#3b82f6" },
  location: { label: "Место", icon: "📍", color: "#3b82f6" },
  transfer: { label: "Трансфер", icon: "🚗", color: "#06b6d4" },
  breakfast: { label: "Завтрак", icon: "🍳", color: "#22c55e" },
  lunch: { label: "Обед", icon: "🍽️", color: "#f97316" },
  dinner: { label: "Ужин", icon: "🌙", color: "#f59e0b" },
  excursion: { label: "Экскурсия", icon: "🏛️", color: "#a855f7" },
  hotel: { label: "Отель", icon: "🏨", color: "#6366f1" },
  free_time: { label: "Свободное время", icon: "⏰", color: "#64748b" },
};

const getConfig = (type) => typeConfig[type] || { label: type, icon: "📌", color: "#6b7280" };

export default function TimingPreview({ timing = [] }) {
  // Парсим JSON если это строка
  let parsedTiming = timing;
  if (typeof timing === 'string') {
    try {
      parsedTiming = JSON.parse(timing);
    } catch (e) {
      parsedTiming = [];
    }
  }

  if (!parsedTiming || parsedTiming.length === 0) {
    return (
      <div className="flex flex-col items-center py-6 text-gray-500">
        <span className="text-3xl mb-2 opacity-40">📅</span>
        <p className="text-xs">Тайминг не настроен</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pr-1">
      {parsedTiming.map((day, dayIndex) => (
        <div key={day.id || dayIndex} className="bg-[#13111a] rounded-xl overflow-hidden">
          {/* Day Header */}
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-600/15 to-transparent border-b border-white/5">
            <div className="w-7 h-7 rounded-lg bg-violet-500/20 flex items-center justify-center">
              <span className="text-sm font-bold text-violet-400">{day.id || dayIndex + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white">{day.id || dayIndex + 1}-День</p>
              <p className="text-[10px] text-gray-500">{day.items?.length || 0} событий</p>
            </div>
          </div>

          {/* Events */}
          {day.items && day.items.length > 0 ? (
            <div className="p-2 flex flex-col gap-1.5">
              {day.items.map((item, itemIndex) => {
                const cfg = getConfig(item.type);
                return (
                  <div 
                    key={item.id || itemIndex}
                    className="flex items-start gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <span className="text-base mt-0.5">
                      {cfg.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-gray-500">{item.time || "—"}</span>
                        <span 
                          className="text-[10px] font-medium"
                          style={{ color: cfg.color }}
                        >
                      {cfg.label}
                    </span>
                  </div>
                  {item.title && (
                    <p className="text-xs text-white break-words whitespace-normal leading-snug">
                      {item.title}
                    </p>
                  )}
                </div>
              </div>
            );
              })}
            </div>
          ) : (
            <div className="text-[10px] text-gray-500 text-center py-3">
              Нет событий
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
