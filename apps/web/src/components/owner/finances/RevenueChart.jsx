import { useMemo, useState } from 'react';

const metrics = [
  { id: 'revenue', label: 'Выручка', color: '#1313ec' },
  { id: 'income', label: 'Поступления', color: '#10b981' },
  { id: 'receivables', label: 'Дебиторка', color: '#ef4444' },
];

const formatCompact = (value) => {
  if (!Number.isFinite(value)) return '0';
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(Math.round(value));
};

const pickAxisLabels = (series) => {
  const n = series.length;
  if (n === 0) return ['—', '—', '—', '—'];
  const idx = [0, Math.floor((n - 1) / 3), Math.floor(((n - 1) * 2) / 3), n - 1];
  const format = (dateStr) => {
    const date = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' });
  };
  return idx.map((i) => format(series[i]?.date));
};

const toPath = ({ values, width, height, paddingTop, paddingBottom, maxValue }) => {
  const n = values.length;
  if (n === 0) return '';
  const max = Math.max(1, maxValue);
  const usableHeight = height - paddingTop - paddingBottom;
  return values
    .map((value, index) => {
      const x = n === 1 ? 0 : (index / (n - 1)) * width;
      const y = paddingTop + (1 - value / max) * usableHeight;
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
};

const toArea = ({ values, width, height, paddingTop, paddingBottom, maxValue }) => {
  const n = values.length;
  if (n === 0) return '';
  const max = Math.max(1, maxValue);
  const usableHeight = height - paddingTop - paddingBottom;
  const bottom = height;

  const points = values.map((value, index) => {
    const x = n === 1 ? 0 : (index / (n - 1)) * width;
    const y = paddingTop + (1 - value / max) * usableHeight;
    return { x, y };
  });

  const start = `M0,${bottom} L0,${points[0].y.toFixed(2)}`;
  const line = points
    .slice(1)
    .map((p) => `L${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(' ');
  const end = ` L${width},${bottom} Z`;
  return `${start} ${line}${end}`;
};

export default function RevenueChart({ series = [], prevSeries = [], summary, loading }) {
  const [activeMetric, setActiveMetric] = useState('revenue');

  const safeSeries = Array.isArray(series) ? series : [];
  const safePrev = Array.isArray(prevSeries) ? prevSeries : [];

  const values = useMemo(
    () => safeSeries.map((p) => Number(p[activeMetric] || 0)),
    [safeSeries, activeMetric]
  );
  const prevValues = useMemo(
    () => safePrev.map((p) => Number(p[activeMetric] || 0)),
    [safePrev, activeMetric]
  );

  const yMax = useMemo(() => Math.max(1, ...values, ...prevValues), [values, prevValues]);
  const yTicks = useMemo(() => {
    const steps = [1, 0.75, 0.5, 0.25, 0];
    return steps.map((k) => yMax * k);
  }, [yMax]);

  const width = 820;
  const height = 240;
  const paddingTop = 20;
  const paddingBottom = 24;

  const path = useMemo(
    () =>
      toPath({
        values: values.length ? values : [0],
        width,
        height,
        paddingTop,
        paddingBottom,
        maxValue: yMax,
      }),
    [values, yMax]
  );
  const areaPath = useMemo(
    () =>
      toArea({
        values: values.length ? values : [0],
        width,
        height,
        paddingTop,
        paddingBottom,
        maxValue: yMax,
      }),
    [values, yMax]
  );
  const prevPath = useMemo(
    () =>
      toPath({
        values: prevValues.length ? prevValues : [0],
        width,
        height,
        paddingTop,
        paddingBottom,
        maxValue: yMax,
      }),
    [prevValues, yMax]
  );

  const axisLabels = useMemo(() => pickAxisLabels(safeSeries), [safeSeries]);
  const activeColor = useMemo(
    () => metrics.find((m) => m.id === activeMetric)?.color || '#1313ec',
    [activeMetric]
  );

  const maxDay = values.length
    ? Math.max(...values)
    : summary?.maxDay ?? 0;
  const avgDay = values.length
    ? values.reduce((a, b) => a + b, 0) / values.length
    : summary?.avgDay ?? 0;

  return (
    <div className="lg:col-span-8 bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#f0f0f4] p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h3 className="text-[#111118] text-lg font-bold">Динамика</h3>
          <p className="text-xs text-[#616189]">Финансовые показатели по дням</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-[#f0f0f4] rounded-lg p-0.5">
            {metrics.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveMetric(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeMetric === tab.id
                    ? 'bg-white text-[#111118] font-bold shadow-sm'
                    : 'text-[#616189] hover:text-[#111118]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeColor }} />
              <span className="text-xs text-[#616189]">Текущий</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-300 border border-dashed border-gray-400" />
              <span className="text-xs text-[#616189]">Прошлый</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-[300px] w-full relative">
        <div className="absolute left-0 top-0 bottom-8 w-10 flex flex-col justify-between text-[10px] text-[#9ca3af] font-medium text-right pr-2 border-r border-dashed border-gray-100">
          {yTicks.map((tick, idx) => (
            <span key={idx}>{formatCompact(tick)}</span>
          ))}
        </div>

        <div className="absolute left-10 right-0 top-0 bottom-0 pl-4">
          <div className="w-full h-full flex flex-col justify-between pointer-events-none">
            <div className="w-full h-px bg-gray-50" />
            <div className="w-full h-px bg-gray-50" />
            <div className="w-full h-px bg-gray-50" />
            <div className="w-full h-px bg-gray-50" />
            <div className="w-full h-px bg-gray-200" />
          </div>

          <svg
            className="absolute inset-0 w-full h-[calc(100%-32px)] overflow-visible"
            preserveAspectRatio="none"
            viewBox={`0 0 ${width} ${height}`}
          >
            <defs>
              <linearGradient id="revGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: activeColor, stopOpacity: 0.12 }} />
                <stop offset="100%" style={{ stopColor: activeColor, stopOpacity: 0 }} />
              </linearGradient>
            </defs>

            <path d={prevPath} fill="none" stroke="#e2e8f0" strokeDasharray="4 4" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            <path d={areaPath} fill="url(#revGradient)" stroke="none" />
            <path d={path} fill="none" stroke={activeColor} strokeLinecap="round" strokeWidth="3" vectorEffect="non-scaling-stroke" />
          </svg>

          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-[#9ca3af] pt-2">
            {axisLabels.map((label, idx) => (
              <span key={idx}>{label}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 pt-6 mt-4 border-t border-[#f0f0f4]">
        <div>
          <p className="text-xs text-[#616189] uppercase font-semibold">Max Day</p>
          <p className="text-lg font-bold text-[#111118]">{formatCompact(maxDay)} <span className="text-xs text-[#9ca3af]">KGS</span></p>
        </div>
        <div>
          <p className="text-xs text-[#616189] uppercase font-semibold">Avg Day</p>
          <p className="text-lg font-bold text-[#111118]">{formatCompact(avgDay)} <span className="text-xs text-[#9ca3af]">KGS</span></p>
        </div>
        <div>
          <p className="text-xs text-[#616189] uppercase font-semibold">Тренд</p>
          <p className="text-lg font-bold text-emerald-600">
            {values.length ? 'В росте' : '—'}
          </p>
        </div>
      </div>
    </div>
  );
}
