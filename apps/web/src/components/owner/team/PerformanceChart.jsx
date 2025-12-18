import { useMemo, useState } from 'react';

const formatCompact = (value) => {
  if (!Number.isFinite(value)) return '0';
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(Math.round(value));
};

const toChartPath = ({
  values,
  width,
  height,
  paddingTop,
  paddingBottom,
  maxValue,
}) => {
  const n = values.length;
  if (n === 0) return '';

  const max = Math.max(1, Number(maxValue || 0));
  const usableHeight = height - paddingTop - paddingBottom;

  const points = values.map((value, index) => {
    const x = n === 1 ? 0 : (index / (n - 1)) * width;
    const y = paddingTop + (1 - value / max) * usableHeight;
    return { x, y };
  });

  return points
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(' ');
};

const toAreaPath = ({
  values,
  width,
  height,
  paddingTop,
  paddingBottom,
  maxValue,
}) => {
  const n = values.length;
  if (n === 0) return '';

  const max = Math.max(1, Number(maxValue || 0));
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

const pickAxisLabels = (series) => {
  const n = series.length;
  if (n === 0) return ['—', '—', '—', '—'];

  const idx = [
    0,
    Math.floor((n - 1) / 3),
    Math.floor(((n - 1) * 2) / 3),
    n - 1,
  ];

  const format = (dateStr) => {
    const date = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' });
  };

  return idx.map((i) => format(series[i]?.date));
};

export default function PerformanceChart({ series, prevSeries }) {
  const [activeMetric, setActiveMetric] = useState('sales');

  const metrics = useMemo(
    () => [
      { id: 'sales', label: 'Продажи' },
      { id: 'revenue', label: 'Выручка' },
    ],
    []
  );

  const safeSeries = Array.isArray(series) ? series : [];
  const safePrevSeries = Array.isArray(prevSeries) ? prevSeries : [];

  const currentValues = useMemo(() => {
    if (safeSeries.length === 0) return [];
    if (activeMetric === 'revenue') {
      return safeSeries.map((p) => Number(p.revenue || 0));
    }
    return safeSeries.map((p) => Number(p.people || 0));
  }, [activeMetric, safeSeries]);

  const prevValues = useMemo(() => {
    if (safePrevSeries.length === 0) return [];
    if (activeMetric === 'revenue') {
      return safePrevSeries.map((p) => Number(p.revenue || 0));
    }
    return safePrevSeries.map((p) => Number(p.people || 0));
  }, [activeMetric, safePrevSeries]);

  const axisLabels = useMemo(() => pickAxisLabels(safeSeries), [safeSeries]);

  const yMax = useMemo(() => {
    const max = Math.max(0, ...currentValues, ...prevValues);
    return max > 0 ? max : 1;
  }, [currentValues, prevValues]);

  const yTicks = useMemo(() => {
    const steps = [1, 0.75, 0.5, 0.25, 0];
    return steps.map((k) => yMax * k);
  }, [yMax]);

  const width = 800;
  const height = 240;
  const paddingTop = 20;
  const paddingBottom = 20;

  const currentPath = useMemo(
    () =>
      toChartPath({
        values: currentValues.length ? currentValues : [0],
        width,
        height,
        paddingTop,
        paddingBottom,
        maxValue: yMax,
      }),
    [currentValues, yMax]
  );
  const currentArea = useMemo(
    () =>
      toAreaPath({
        values: currentValues.length ? currentValues : [0],
        width,
        height,
        paddingTop,
        paddingBottom,
        maxValue: yMax,
      }),
    [currentValues, yMax]
  );
  const prevPath = useMemo(
    () =>
      toChartPath({
        values: prevValues.length ? prevValues : [0],
        width,
        height,
        paddingTop,
        paddingBottom,
        maxValue: yMax,
      }),
    [prevValues, yMax]
  );

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
          {yTicks.map((value, idx) => (
            <span key={idx}>
              {activeMetric === 'revenue' ? formatCompact(value) : formatCompact(value)}
            </span>
          ))}
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
            d={currentPath}
            fill="none"
            stroke="#1313ec"
            strokeLinecap="round"
            strokeWidth="3"
            vectorEffect="non-scaling-stroke"
          />

          {/* Area fill */}
          <path d={currentArea} fill="url(#gradientPrimary)" opacity="0.1" />

          {/* Previous period line (dashed) */}
          <path
            d={prevPath}
            fill="none"
            stroke="#cbd5e1"
            strokeDasharray="4,4"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* X-axis labels */}
        <div className="absolute -bottom-6 inset-x-0 flex justify-between text-[10px] text-[#9ca3af]">
          {axisLabels.map((label, idx) => (
            <span key={idx}>{label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
