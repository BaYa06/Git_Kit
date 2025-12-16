import { useState } from 'react';

const chartData = [
  { day: 'Mon', value: 320, height: 40 },
  { day: 'Tue', value: 450, height: 55 },
  { day: 'Wed', value: 380, height: 45 },
  { day: 'Thu', value: 620, height: 70 },
  { day: 'Fri', value: 520, height: 60 },
  { day: 'Sat', value: 780, height: 85 },
  { day: 'Sun', value: 920, height: 95, isToday: true },
];

export default function RevenueChart() {
  const [activeTab, setActiveTab] = useState('revenue');
  
  const tabs = [
    { key: 'revenue', label: 'Выручка' },
    { key: 'profit', label: 'Прибыль' },
    { key: 'pax', label: 'PAX' },
  ];
  
  return (
    <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#f0f0f4] p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[#111118] text-lg font-bold">Динамика выручки</h3>
        <div className="flex bg-[#f0f0f4] rounded-lg p-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1 rounded-md text-xs transition-colors ${
                activeTab === tab.key
                  ? 'bg-white text-[#111118] font-bold shadow-sm'
                  : 'text-[#616189] hover:text-[#111118] font-medium'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Chart */}
      <div className="h-[250px] w-full flex items-end gap-2 relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-[#616189] pr-2 border-r border-dashed border-gray-200 h-full w-10">
          <span>1M</span>
          <span>750k</span>
          <span>500k</span>
          <span>250k</span>
          <span>0</span>
        </div>
        
        {/* Chart Area */}
        <div className="ml-12 flex-1 h-full flex items-end justify-between gap-1 pb-6 pt-4">
          {chartData.map((bar, index) => (
            <div
              key={index}
              className={`flex-1 rounded-t-sm transition-all relative group cursor-pointer ${
                bar.isToday
                  ? 'bg-[#1313ec] hover:bg-[#1313ec]/90 shadow-lg shadow-[#1313ec]/30'
                  : 'bg-[#1313ec]/10 hover:bg-[#1313ec]/20'
              }`}
              style={{ height: `${bar.height}%` }}
            >
              <div className={`absolute -top-10 left-1/2 -translate-x-1/2 bg-[#111118] text-white text-xs px-2 py-1 rounded whitespace-nowrap ${
                bar.isToday ? 'font-bold' : 'opacity-0 group-hover:opacity-100'
              }`}>
                {bar.value}k{bar.isToday ? ' Today' : ''}
              </div>
            </div>
          ))}
        </div>
        
        {/* X-axis labels */}
        <div className="absolute bottom-0 left-12 right-0 flex justify-between text-xs text-[#616189] px-2">
          {chartData.map((bar, index) => (
            <span 
              key={index}
              className={bar.isToday ? 'font-bold text-[#1313ec]' : ''}
            >
              {bar.day}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
