"use client";

import React from "react";

// ─── Area / Line Chart ────────────────────────────────────────────────────────
interface AreaChartProps {
  data: { month: string; value: number }[];
  color?: string;
  height?: number;
}

export function AreaChart({ data, color = "#F5E050", height = 120 }: AreaChartProps) {
  const W = 600;
  const H = height;
  const pad = { l: 8, r: 8, t: 10, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const vals = data.map((d) => d.value);
  const min = Math.min(...vals) * 0.85;
  const max = Math.max(...vals) * 1.05;
  const range = max - min || 1;

  const toX = (i: number) => pad.l + (i / (data.length - 1)) * innerW;
  const toY = (v: number) => pad.t + innerH - ((v - min) / range) * innerH;

  const pts = data.map((d, i) => ({ x: toX(i), y: toY(d.value) }));
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const area = `${line} L${pts[pts.length - 1].x},${H - pad.b} L${pts[0].x},${H - pad.b} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={`ag-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Area fill */}
      <path d={area} fill={`url(#ag-${color.replace("#","")})`} />
      {/* Line */}
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Dots */}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={color} />
      ))}
      {/* X labels */}
      {data.map((d, i) => (
        <text
          key={i}
          x={toX(i)}
          y={H - 6}
          textAnchor="middle"
          fontSize="10"
          fill="#73736E"
          fontFamily="inherit"
        >
          {d.month}
        </text>
      ))}
    </svg>
  );
}

// ─── Multi-line chart (income vs expense) ─────────────────────────────────────
interface MultiLineChartProps {
  data: { month: string; income: number; expense: number }[];
  height?: number;
}

export function MultiLineChart({ data, height = 160 }: MultiLineChartProps) {
  const W = 600;
  const H = height;
  const pad = { l: 8, r: 8, t: 10, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const allVals = data.flatMap((d) => [d.income, d.expense]);
  const min = Math.min(...allVals) * 0.8;
  const max = Math.max(...allVals) * 1.05;
  const range = max - min || 1;

  const toX = (i: number) => pad.l + (i / (data.length - 1)) * innerW;
  const toY = (v: number) => pad.t + innerH - ((v - min) / range) * innerH;

  const incomePts  = data.map((d, i) => ({ x: toX(i), y: toY(d.income) }));
  const expensePts = data.map((d, i) => ({ x: toX(i), y: toY(d.expense) }));

  const mkLine = (pts: {x:number;y:number}[]) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const mkArea = (pts: {x:number;y:number}[], line: string) =>
    `${line} L${pts[pts.length-1].x},${H - pad.b} L${pts[0].x},${H - pad.b} Z`;

  const iLine = mkLine(incomePts);
  const eLine = mkLine(expensePts);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id="income-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F5E050" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#F5E050" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="expense-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={mkArea(incomePts, iLine)} fill="url(#income-grad)" />
      <path d={mkArea(expensePts, eLine)} fill="url(#expense-grad)" />
      <path d={iLine} fill="none" stroke="#F5E050" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d={eLine} fill="none" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.4" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => (
        <text key={i} x={toX(i)} y={H - 6} textAnchor="middle" fontSize="10" fill="#73736E" fontFamily="inherit">
          {d.month}
        </text>
      ))}
    </svg>
  );
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────
interface DonutSegment { name: string; percent: number; color: string }
interface DonutChartProps { segments: DonutSegment[]; centerLabel?: string; centerSub?: string; size?: number }

export function DonutChart({ segments, centerLabel, centerSub, size = 160 }: DonutChartProps) {
  const r = 52;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;

  let offset = 0;
  const arcs = segments.map((s) => {
    const dash = (s.percent / 100) * circ;
    const gap  = circ - dash;
    const arc  = { ...s, dash, gap, offset };
    offset += dash + 2.5;
    return arc;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="transparent" stroke="#1f1f1f" strokeWidth="14" />
      {arcs.map((arc, i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={r}
          fill="transparent"
          stroke={arc.color}
          strokeWidth="14"
          strokeDasharray={`${arc.dash} ${arc.gap + 100}`}
          strokeDashoffset={-arc.offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: "all 0.4s ease" }}
        />
      ))}
      {centerLabel && (
        <>
          <text x={cx} y={cy - 6} textAnchor="middle" fontSize="15" fontWeight="800" fill="#ffffff" fontFamily="inherit">
            {centerLabel}
          </text>
          {centerSub && (
            <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" fill="#73736E" fontFamily="inherit">
              {centerSub}
            </text>
          )}
        </>
      )}
    </svg>
  );
}

// ─── Bar Chart ────────────────────────────────────────────────────────────────
interface BarChartProps {
  data: { month: string; income: number; expense: number }[];
  height?: number;
}

export function BarChart({ data, height = 140 }: BarChartProps) {
  const W = 560;
  const H = height;
  const pad = { l: 8, r: 8, t: 8, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const groupW = innerW / data.length;
  const barW = groupW * 0.28;

  const max = Math.max(...data.flatMap((d) => [d.income, d.expense])) * 1.1;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      {data.map((d, i) => {
        const gx = pad.l + i * groupW + groupW / 2;
        const ih = (d.income / max) * innerH;
        const eh = (d.expense / max) * innerH;
        return (
          <g key={i}>
            {/* Income bar */}
            <rect
              x={gx - barW - 2}
              y={pad.t + innerH - ih}
              width={barW}
              height={ih}
              rx="3"
              fill="#F5E050"
              opacity="0.85"
            />
            {/* Expense bar */}
            <rect
              x={gx + 2}
              y={pad.t + innerH - eh}
              width={barW}
              height={eh}
              rx="3"
              fill="#ffffff"
              opacity="0.18"
            />
            <text x={gx} y={H - 6} textAnchor="middle" fontSize="10" fill="#73736E" fontFamily="inherit">
              {d.month}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Sparkline (tiny inline chart) ───────────────────────────────────────────
export function Sparkline({ data, color = "#F5E050", w = 80, h = 32 }: { data: number[]; color?: string; w?: number; h?: number }) {
  const min = Math.min(...data);
  const max = Math.max(...data) || 1;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: h - ((v - min) / (max - min || 1)) * (h - 4) - 2,
  }));
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <path d={line} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
