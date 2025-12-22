const typeConfig = {
  meeting: { label: "Встреча", icon: "📍", color: "#10b981", bg: "#10b98115" },
  first_meeting: { label: "Первая встреча", icon: "🚩", color: "#3b82f6", bg: "#3b82f615" },
  location: { label: "Место", icon: "📍", color: "#3b82f6", bg: "#3b82f615" },
  transfer: { label: "Трансфер", icon: "🚗", color: "#06b6d4", bg: "#06b6d415" },
  breakfast: { label: "Завтрак", icon: "🍳", color: "#22c55e", bg: "#22c55e15" },
  lunch: { label: "Обед", icon: "🍽️", color: "#f97316", bg: "#f9731615" },
  dinner: { label: "Ужин", icon: "🌙", color: "#f59e0b", bg: "#f59e0b15" },
  excursion: { label: "Экскурсия", icon: "🏛️", color: "#a855f7", bg: "#a855f715" },
  hotel: { label: "Отель", icon: "🏨", color: "#6366f1", bg: "#6366f115" },
  free_time: { label: "Свободное время", icon: "⏰", color: "#64748b", bg: "#64748b15" },
};

const getConfig = (type) => typeConfig[type] || { label: type, icon: "📌", color: "#6b7280", bg: "#6b728015" };

export default function TimingViewOnly({ timing = [] }) {
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
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <span className="text-5xl mb-3 opacity-50">📅</span>
        <p className="text-base">Тайминг тура пока не настроен</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {parsedTiming.map((day, dayIndex) => (
        <div 
          key={day.id || dayIndex} 
          className="bg-[#1a1625] rounded-2xl overflow-hidden border border-white/5"
        >
          {/* Day Header */}
          <div className="bg-gradient-to-r from-violet-600/20 to-purple-600/10 px-4 py-3 border-b border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                  <span className="text-lg font-bold text-violet-400">{day.id || dayIndex + 1}</span>
                </div>
                <h4 className="text-lg font-semibold text-white">{day.id || dayIndex + 1}-День</h4>
              </div>
              <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-full">
                {day.items?.length || 0} событий
              </span>
            </div>
          </div>

          {/* Events List */}
          <div className="p-3">
            {day.items && day.items.length > 0 ? (
              <div className="flex flex-col gap-2">
                {day.items.map((item, itemIndex) => {
                  const cfg = getConfig(item.type);
                  return (
                    <div 
                      key={item.id || itemIndex} 
                      className="flex gap-3 p-3 rounded-xl bg-[#13111a] hover:bg-[#1a1728] transition-colors"
                    >
                      {/* Icon */}
                      <div 
                        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                        style={{ backgroundColor: cfg.bg }}
                      >
                        {cfg.icon}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span 
                            className="text-xs font-medium px-2 py-0.5 rounded-md"
                            style={{ color: cfg.color, backgroundColor: cfg.bg }}
                          >
                            {cfg.label}
                          </span>
                          {item.time && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              ⏰ {item.time}
                            </span>
                          )}
                        </div>
                        
                        {item.title && (
                          <p className="text-sm font-medium text-white break-words whitespace-normal leading-snug">
                            {item.title}
                          </p>
                        )}
                        
                        {item.comment && (
                          <p className="text-xs text-gray-400 mt-1 break-words whitespace-normal leading-snug">
                            {item.comment}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-gray-500 text-center py-6">
                Нет событий в этот день
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
