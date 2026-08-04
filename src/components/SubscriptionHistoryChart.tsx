"use client";

import { useMemo } from "react";
import { chartTheme, chartHelpers } from "@/lib/chartjs-setup";
import dynamic from 'next/dynamic';

const Line = dynamic(() => import('react-chartjs-2').then((mod) => mod.Line), { ssr: false });

import { useCurrency } from "@/components/CurrencyContext";

interface TransactionItem {
  id: string;
  name: string;
  category: string;
  amount: number;
  date: string;
}

export function SubscriptionHistoryChart({ transactions }: { transactions: TransactionItem[] }) {
  const { symbol } = useCurrency();

  // Extract dates and absolute amounts for the chart (usually subscriptions are expenses, so amounts are negative)
  // We want to show the positive payment values chronologically (oldest to newest)
  const sortedData = useMemo(() => {
    return [...transactions]
      .reverse() // from oldest to newest
      .map(tx => ({
        date: tx.date,
        amount: Math.abs(tx.amount)
      }));
  }, [transactions]);

  const chartData = useMemo(() => {
    return {
      labels: sortedData.map(d => d.date),
      datasets: [
        {
          fill: true,
          label: "Payment Amount",
          data: sortedData.map(d => d.amount),
          borderColor: "rgba(34, 211, 238, 0.95)", // cyan-400
          backgroundColor: "rgba(34, 211, 238, 0.1)",
          borderWidth: 2,
          pointBackgroundColor: "rgba(34, 211, 238, 1)",
          pointRadius: sortedData.length > 10 ? 2 : 4,
          tension: 0.3,
        }
      ]
    };
  }, [sortedData]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        ...chartTheme.plugins.tooltip,
        callbacks: {
          label: chartHelpers.tooltipCurrencyLabelCallback,
        }
      }
    },
    scales: {
      x: {
        ...chartTheme.scales.x,
        grid: {
          display: false
        }
      },
      y: {
        ...chartTheme.scales.y,
        ticks: {
          ...chartTheme.scales.y.ticks,
          callback: function(value: any) {
            return symbol + value;
          }
        }
      }
    }
  }), [symbol]);

  if (transactions.length === 0) {
    return (
      <div className="h-48 w-full flex flex-col items-center justify-center gap-2 text-muted-foreground bg-zinc-900/30 rounded-2xl border border-white/5">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
        <p className="text-sm opacity-60">No payment history available</p>
      </div>
    );
  }

  return (
    <div className="h-56 w-full mt-2">
      <Line data={chartData} options={options} />
    </div>
  );
}
