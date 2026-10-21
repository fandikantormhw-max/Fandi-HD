import React, { useState } from 'react';
import { formatRupiah, formatNumber } from '../utils/formatters';

interface BarDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
  highlight?: boolean;
}

interface BarChartProps {
  data: BarDataPoint[];
  title?: string;
  isCurrency?: boolean;
  primaryLabel?: string;
  secondaryLabel?: string;
  height?: number;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  isCurrency = false,
  primaryLabel = 'Nilai Utama',
  secondaryLabel = 'Nilai Sekunder',
  height = 200,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex h-44 items-center justify-center text-xs text-slate-400">
        Belum ada data visualisasi
      </div>
    );
  }

  const allValues = data.flatMap(d => [d.value, d.secondaryValue || 0]);
  const maxValue = Math.max(...allValues, 1);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between pb-2 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-indigo-600"></span>
            <span>{primaryLabel}</span>
          </div>
          {data.some(d => d.secondaryValue !== undefined) && (
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-xs bg-rose-500"></span>
              <span>{secondaryLabel}</span>
            </div>
          )}
        </div>
        {hoveredIdx !== null && data[hoveredIdx] && (
          <div className="font-mono text-slate-700">
            {data[hoveredIdx].label}: {isCurrency ? formatRupiah(data[hoveredIdx].value) : formatNumber(data[hoveredIdx].value)}
            {data[hoveredIdx].secondaryValue !== undefined && (
              <span className="text-rose-600"> / {isCurrency ? formatRupiah(data[hoveredIdx].secondaryValue!) : formatNumber(data[hoveredIdx].secondaryValue!)}</span>
            )}
          </div>
        )}
      </div>

      <div className="relative flex items-end gap-2 border-b border-slate-200 pt-6" style={{ height: `${height}px` }}>
        {data.map((item, idx) => {
          const primaryHeightPct = Math.min(100, Math.max(4, (item.value / maxValue) * 100));
          const secHeightPct = item.secondaryValue !== undefined
            ? Math.min(100, Math.max(4, (item.secondaryValue / maxValue) * 100))
            : 0;

          return (
            <div
              key={idx}
              className="group relative flex flex-1 flex-col items-center justify-end h-full"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Tooltip */}
              <div className="pointer-events-none absolute -top-12 z-20 hidden whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1 text-[11px] text-white shadow-md group-hover:block">
                <div className="font-medium">{item.label}</div>
                <div className="font-mono text-[10px] text-slate-300">
                  {primaryLabel}: {isCurrency ? formatRupiah(item.value) : formatNumber(item.value)}
                </div>
                {item.secondaryValue !== undefined && (
                  <div className="font-mono text-[10px] text-rose-300">
                    {secondaryLabel}: {isCurrency ? formatRupiah(item.secondaryValue) : formatNumber(item.secondaryValue)}
                  </div>
                )}
              </div>

              <div className="flex w-full items-end justify-center gap-1 h-full pb-1">
                <div
                  className={`w-full max-w-[20px] rounded-t-sm transition-all duration-200 ${
                    item.highlight ? 'bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-500'
                  }`}
                  style={{ height: `${primaryHeightPct}%` }}
                />
                {item.secondaryValue !== undefined && (
                  <div
                    className="w-full max-w-[20px] rounded-t-sm bg-rose-500 transition-all duration-200 hover:bg-rose-400"
                    style={{ height: `${secHeightPct}%` }}
                  />
                )}
              </div>

              <span className="mt-1 block text-center text-[10px] font-medium text-slate-600 truncate w-full">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface LineChartProps {
  labels: string[];
  values: number[];
  height?: number;
  unit?: string;
  color?: string;
}

export const LineChart: React.FC<LineChartProps> = ({
  labels,
  values,
  height = 180,
  unit = 'Jam',
  color = '#4f46e5'
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (values.length === 0) {
    return <div className="flex h-36 items-center justify-center text-xs text-slate-400">Belum ada data</div>;
  }

  const maxVal = Math.max(...values, 5);
  const minVal = 0;
  const range = maxVal - minVal || 1;
  const width = 600;
  const paddingX = 30;
  const paddingY = 25;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const points = values.map((val, idx) => {
    const x = paddingX + (idx / Math.max(values.length - 1, 1)) * chartWidth;
    const y = height - paddingY - ((val - minVal) / range) * chartHeight;
    return { x, y, val, label: labels[idx] };
  });

  const pathD = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between pb-1 text-xs text-slate-500">
        <span className="font-medium text-slate-700">Tren Fluktuasi Harian</span>
        {hoveredIdx !== null ? (
          <span className="font-mono text-indigo-700 font-semibold">
            {labels[hoveredIdx]}: {values[hoveredIdx]} {unit}
          </span>
        ) : (
          <span className="font-mono text-slate-400">Arahkan kursor ke titik data</span>
        )}
      </div>

      <div className="relative w-full overflow-hidden" style={{ height: `${height}px` }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="#e2e8f0" strokeDasharray="3 3" />
          <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke="#e2e8f0" strokeDasharray="3 3" />
          <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#cbd5e1" />

          {/* Area under curve */}
          <path d={areaD} fill="url(#areaGrad)" />

          {/* Line path */}
          <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Interactive points */}
          {points.map((p, idx) => (
            <g key={idx} className="cursor-pointer">
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIdx === idx ? 6 : 3.5}
                fill={hoveredIdx === idx ? '#ffffff' : color}
                stroke={color}
                strokeWidth={hoveredIdx === idx ? 3 : 1.5}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            </g>
          ))}
        </svg>
      </div>

      <div className="flex justify-between pt-1 text-[10px] text-slate-400">
        <span>{labels[0]}</span>
        <span>{labels[Math.floor(labels.length / 2)]}</span>
        <span>{labels[labels.length - 1]}</span>
      </div>
    </div>
  );
};

interface DonutSlice {
  label: string;
  count: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSlice[];
  totalLabel?: string;
  size?: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  totalLabel = 'Total Laporan',
  size = 170
}) => {
  const total = data.reduce((acc, d) => acc + d.count, 0);

  if (total === 0) {
    return <div className="flex h-36 items-center justify-center text-xs text-slate-400">Belum ada distribusi data</div>;
  }

  const radius = 60;
  const strokeWidth = 24;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedAngle = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          {data.map((slice, idx) => {
            const fraction = slice.count / total;
            const strokeDasharray = `${fraction * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedAngle * circumference;
            accumulatedAngle += fraction;

            return (
              <circle
                key={idx}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-300"
              />
            );
          })}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-mono text-2xl font-bold text-slate-800 tabular-nums">{total}</span>
          <span className="text-[11px] text-slate-500">{totalLabel}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 text-xs w-full">
        {data.map((slice, idx) => {
          const pct = Math.round((slice.count / total) * 100) || 0;
          return (
            <div key={idx} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 truncate">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: slice.color }}></span>
                <span className="text-slate-600 truncate">{slice.label}</span>
              </div>
              <div className="flex items-center gap-2 font-mono tabular-nums text-slate-800 font-medium">
                <span>{slice.count}</span>
                <span className="text-slate-400 text-[11px] w-8 text-right">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
