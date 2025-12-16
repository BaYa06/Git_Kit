import { useState } from 'react';

export default function PerformanceChart() {
  const [activeMetric, setActiveMetric] = useState('sales');

  const metrics = [
    { id: 'sales', label: 'Продажи' },
    { id: 'revenue', label: 'Выручка' },
    { id: 'conversion', label: 'Конверсия' },
  ];

  return (
    <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-[#e0e0e4] shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-[#111118]">Общая эффективность</h3>
          <p className="text-xs text-[#616189]">Сравнение с прошлым периодом</p>
        </div>
        <div className="flex bg-[#f6f6f8] rounded-lg p-1">
          {metrics.map((metric) => (
            <button
              key={metric.id}
              onClick={() => setActiveMetric(metric.id)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                activeMetric === metric.id
                  ? 'bg-white text-[#111118] font-bold shadow-sm'
                  : 'text-[#616189] hover:text-[#111118]'
              }`}
            >
              {metric.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-[240px] w-full mt-auto">
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between">
          <div className="w-full h-px bg-[#f0f0f4]" />
          <div className="w-full h-px bg-[#f0f0f4]" />
          <div className="w-full h-px bg-[#f0f0f4]" />
          <div className="w-full h-px bg-[#f0f0f4]" />
          <div className="w-full h-px bg-[#f0f0f4]" />
        </div>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] text-[#9ca3af] -translate-x-full pr-2">
          <span>200</span>
          <span>150</span>
          <span>100</span>
          <span>50</span>
          <span>0</span>
        </div>

        {/* Chart SVG */}
        <svg
          className="absolute inset-0 w-full h-full overflow-visible"
          preserveAspectRatio="none"
          viewBox="0 0 800 240"
        >
          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradientPrimary" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#1313ec', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#1313ec', stopOpacity: 0 }} />
            </linearGradient>
          </defs>

          {/* Current period line */}
          <path
            d="M0,200 L100,180 L200,140 L300,150 L400,100 L500,80 L600,40 L700,60 L800,30"
            fill="none"
            stroke="#1313ec"
            strokeLinecap="round"
            strokeWidth="3"
            vectorEffect="non-scaling-stroke"
          />

          {/* Area fill */}
          <path
            d="M0,240 L0,200 L100,180 L200,140 L300,150 L400,100 L500,80 L600,40 L700,60 L800,30 L800,240 Z"
            fill="url(#gradientPrimary)"
            opacity="0.1"
          />

          {/* Previous period line (dashed) */}
          <path
            d="M0,220 L100,210 L200,190 L300,180 L400,160 L500,170 L600,150 L700,140 L800,120"
            fill="none"
            stroke="#cbd5e1"
            strokeDasharray="4,4"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* X-axis labels */}
        <div className="absolute -bottom-6 inset-x-0 flex justify-between text-[10px] text-[#9ca3af]">
          <span>Week 1</span>
          <span>Week 2</span>
          <span>Week 3</span>
          <span>Week 4</span>
        </div>
      </div>
    </div>
  );
}
