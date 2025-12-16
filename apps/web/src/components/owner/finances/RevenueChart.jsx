import { useState } from 'react';

export default function RevenueChart() {
  const [activeTab, setActiveTab] = useState('revenue');

  const tabs = [
    { id: 'revenue', label: 'Выручка' },
    { id: 'income', label: 'Поступления' },
    { id: 'receivables', label: 'Дебиторка' },
  ];

  const summaryData = [
    { label: 'Max Day', value: '3.2 M', unit: 'KGS' },
    { label: 'Avg Day', value: '840 K', unit: 'KGS' },
    { label: 'Best Direction', value: 'Issyk-Kul', isHighlight: true },
  ];

  return (
    <div className="lg:col-span-8 bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#f0f0f4] p-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h3 className="text-[#111118] text-lg font-bold">Динамика</h3>
          <p className="text-xs text-[#616189]">Финансовые показатели по дням</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          {/* Tabs */}
          <div className="flex bg-[#f0f0f4] rounded-lg p-0.5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-[#111118] font-bold shadow-sm'
                    : 'text-[#616189] hover:text-[#111118]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          {/* Legend */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span className="text-xs text-[#616189]">Текущий</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-300 border border-dashed border-gray-400" />
              <span className="text-xs text-[#616189]">Прошлый</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 min-h-[300px] w-full relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-8 w-10 flex flex-col justify-between text-[10px] text-[#9ca3af] font-medium text-right pr-2 border-r border-dashed border-gray-100">
          <span>20M</span>
          <span>15M</span>
          <span>10M</span>
          <span>5M</span>
          <span>0</span>
        </div>

        {/* Chart */}
        <div className="absolute left-10 right-0 top-0 bottom-0 pl-4">
          {/* Grid lines */}
          <div className="w-full h-full flex flex-col justify-between pointer-events-none">
            <div className="w-full h-px bg-gray-50" />
            <div className="w-full h-px bg-gray-50" />
            <div className="w-full h-px bg-gray-50" />
            <div className="w-full h-px bg-gray-50" />
            <div className="w-full h-px bg-gray-200" />
          </div>

          {/* SVG Chart */}
          <svg 
            className="absolute inset-0 w-full h-[calc(100%-32px)] overflow-visible" 
            preserveAspectRatio="none"
            viewBox="0 0 750 250"
          >
            {/* Previous period line (dashed) */}
            <path
              d="M0,220 C50,210 100,240 150,200 C200,160 250,180 300,150 C350,120 400,140 450,130 C500,120 550,180 600,160 C650,140 700,120 750,100"
              fill="none"
              stroke="#e2e8f0"
              strokeDasharray="4 4"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
            
            {/* Gradient */}
            <defs>
              <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#1313ec', stopOpacity: 0.1 }} />
                <stop offset="100%" style={{ stopColor: '#1313ec', stopOpacity: 0 }} />
              </linearGradient>
            </defs>
            
            {/* Area fill */}
            <path
              d="M0,200 C50,180 100,150 150,170 C200,190 250,120 300,100 C350,80 400,110 450,90 C500,70 550,60 600,80 C650,100 700,50 750,40 L750,250 L0,250 Z"
              fill="url(#revenueGradient)"
              stroke="none"
            />
            
            {/* Current period line */}
            <path
              d="M0,200 C50,180 100,150 150,170 C200,190 250,120 300,100 C350,80 400,110 450,90 C500,70 550,60 600,80 C650,100 700,50 750,40"
              fill="none"
              stroke="#1313ec"
              strokeLinecap="round"
              strokeWidth="3"
              vectorEffect="non-scaling-stroke"
            />
            
            {/* Data points */}
            <circle cx="150" cy="170" r="4" fill="white" stroke="#1313ec" strokeWidth="2" />
            <circle cx="450" cy="90" r="4" fill="white" stroke="#1313ec" strokeWidth="2" />
            <circle cx="750" cy="40" r="6" fill="#1313ec" stroke="white" strokeWidth="2" />
          </svg>

          {/* X-axis labels */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-[#9ca3af] pt-2">
            <span>01 Dec</span>
            <span>05 Dec</span>
            <span>10 Dec</span>
            <span>15 Dec</span>
            <span>20 Dec</span>
            <span>25 Dec</span>
            <span>Today</span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 pt-6 mt-4 border-t border-[#f0f0f4]">
        {summaryData.map((item, index) => (
          <div key={index}>
            <p className="text-xs text-[#616189] uppercase font-semibold">{item.label}</p>
            <p className={`text-lg font-bold ${item.isHighlight ? 'text-emerald-600' : 'text-[#111118]'}`}>
              {item.value}
              {item.unit && <span className="text-xs font-normal text-[#616189] ml-1">{item.unit}</span>}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
