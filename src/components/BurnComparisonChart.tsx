"use client";

import React, { useMemo } from "react";
import { chartTheme, chartHelpers } from "@/lib/chartjs-setup";
import { fmt } from "@/lib/format";
import dynamic from "next/dynamic";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

const Line = dynamic(() => import("react-chartjs-2").then((mod) => mod.Line), {
  ssr: false,
});

interface BurnComparisonChartProps {
  currentCumulative: number[];
  prevCumulative: number[];
  prevTotal: number;
  isMock?: boolean;
}

export function BurnComparisonChart({
  currentCumulative,
  prevCumulative,
  prevTotal,
  isMock = false,
}: BurnComparisonChartProps) {

  const todayIndex = Math.max(0, currentCumulative.length - 1);
  const currentSoFar = currentCumulative[todayIndex] || 0;
  const prevAtSameDay = prevCumulative[todayIndex] || 0;
  const diffSoFar = currentSoFar - prevAtSameDay;
  const isUnder = diffSoFar <= 0;

  // Determine chart labels (Day 1, Day 2, etc.)
  const maxDays = Math.max(currentCumulative.length, prevCumulative.length, 30);
  const labels = Array.from({ length: maxDays }, (_, i) => `Day ${i + 1}`);

  // Create chart data config
  const chartData = useMemo(() => ({
    labels,
    datasets: [
      {
        label: "This Cycle",
        data: currentCumulative,
        borderColor: "rgba(99, 102, 241, 0.95)", // Indigo-500
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        borderWidth: 2.5,
        pointRadius: (ctx: any) => (ctx.dataIndex === todayIndex ? 6 : 0),
        pointHoverRadius: 6,
        pointBackgroundColor: "rgba(99, 102, 241, 1)",
        pointBorderColor: "#fff",
        pointBorderWidth: 1.5,
        tension: 0.3,
        fill: true,
      },
      {
        label: "Previous Cycle",
        data: prevCumulative,
        borderColor: "rgba(161, 161, 170, 0.4)", // Zinc-400
        backgroundColor: "transparent",
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.3,
        fill: false,
      },
    ],
  }), [labels, currentCumulative, prevCumulative, todayIndex]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        ...chartTheme.plugins.legend,
        display: true,
        position: "top" as const,
      },
      tooltip: {
        ...chartTheme.plugins.tooltip,
        callbacks: {
          label: chartHelpers.tooltipCurrencyLabelCallback,
        },
      },
    },
    scales: {
      x: {
        ...chartTheme.scales.x,
        ticks: {
          ...chartTheme.scales.x.ticks,
          maxTicksLimit: 8,
        },
      },
      y: {
        ...chartTheme.scales.y,
        ticks: {
          ...chartTheme.scales.y.ticks,
          callback: (value: any) => `£${value}`,
        },
      },
    },
  }), []);

  return (
    <div className="glass-card p-4 flex flex-col gap-4">
      {/* Header Info */}
      <div className="flex justify-between items-start border-b border-white/5 pb-3">
        <div>
          <div className="flex items-center gap-1.5 text-zinc-400">
            <h3 className="text-xs font-bold tracking-widest uppercase">
              Burn Comparison
            </h3>
            {isMock && (
              <span className="text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700/80 px-1 py-0.2 rounded-full font-bold">
                Mock
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-xl font-bold text-white">
              {fmt(currentSoFar)}
            </p>
            <span className="text-xs text-zinc-400">vs {fmt(prevAtSameDay)} last month</span>
          </div>
        </div>

        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border text-xs font-bold ${
          isUnder
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            : "bg-amber-500/10 border-amber-500/20 text-amber-400"
        }`}>
          {isUnder ? (
            <ArrowDownRight size={14} strokeWidth={2.5} />
          ) : (
            <ArrowUpRight size={14} strokeWidth={2.5} />
          )}
          <span>
            {isUnder ? "Under by " : "Over by "}
            {fmt(Math.abs(diffSoFar))}
          </span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-56 relative w-full">
        <Line data={chartData} options={chartOptions} />
      </div>

      {/* Legend Footer */}
      <div className="flex justify-between items-center text-xs text-zinc-500 mt-1">
        <span>Day {todayIndex + 1} of cycle</span>
        <span>Total Last Cycle: {fmt(prevTotal)}</span>
      </div>
    </div>
  );
}
