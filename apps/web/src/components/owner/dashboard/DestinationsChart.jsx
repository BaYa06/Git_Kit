const destinations = [
  { name: 'Иссык-Куль', percent: 45, color: 'bg-[#1313ec]' },
  { name: 'Узбекистан', percent: 25, color: 'bg-[#6366f1]' },
  { name: 'Алматы', percent: 20, color: 'bg-[#a5b4fc]' },
  { name: 'Другое', percent: 10, color: 'bg-[#e0e7ff]' },
];

export default function DestinationsChart({ totalTours = 142 }) {
  // Calculate conic gradient
  let cumulative = 0;
  const gradientParts = destinations.map((d) => {
    const start = cumulative;
    cumulative += d.percent;
    return `${d.color.replace('bg-', '')} ${start}% ${cumulative}%`;
  });
  
  return (
    <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#f0f0f4] p-6 flex flex-col">
      <h3 className="text-[#111118] text-lg font-bold mb-4">Структура направлений</h3>
      
      <div className="flex-1 flex flex-col items-center justify-center relative min-h-[200px]">
        {/* CSS Donut Chart */}
        <div 
          className="size-48 rounded-full relative"
          style={{ 
            background: 'conic-gradient(#1313ec 0% 45%, #6366f1 45% 70%, #a5b4fc 70% 90%, #e0e7ff 90% 100%)' 
          }}
        >
          <div className="size-32 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center">
            <span className="text-xs text-[#616189]">Всего туров</span>
            <span className="text-2xl font-bold text-[#111118]">{totalTours}</span>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        {destinations.map((dest, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className={`size-2 rounded-full ${dest.color}`}></div>
            <span className="text-[#616189]">{dest.name} ({dest.percent}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}
