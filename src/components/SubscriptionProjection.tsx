"use client";

import { useMemo } from "react";
import { chartTheme } from "@/lib/chartjs-setup";
import { fmt } from "@/lib/format";
import dynamic from 'next/dynamic';
const Line = dynamic(() => import('react-chartjs-2').then((mod) => mod.Line), { ssr: false });

interface Bill {
  name: string;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  expectedInCycle: boolean;
}

interface CreditCardPayment {
  name: string;
  balance: number;
  dueDate: string | null;
  isConfigured: boolean;
  isPaid?: boolean;
}

export function SubscriptionProjection({
  bills,
  cards
}: {
  bills: Bill[];
  cards: CreditCardPayment[];
}) {
  const unpaidBills = bills.filter(b => !b.isPaid && b.expectedInCycle);
  const unpaidCards = (cards || []).filter(c => c.dueDate !== null && c.balance > 0 && !c.isPaid);
  
  // Merge dates to create a unified chronological x-axis
  const allDatesSet = new Set<string>();
  unpaidBills.forEach(b => allDatesSet.add(b.dueDate));
  unpaidCards.forEach(c => c.dueDate && allDatesSet.add(c.dueDate));
  
  // Sort dates chronologically (YYYY-MM-DD strings sort perfectly alphabetically)
  const sortedDateStrings = Array.from(allDatesSet).sort();
  
  // Create labels for display (e.g. "11 May")
  const labels = sortedDateStrings.map(dateStr => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  });

  // Data points corresponding to the unified x-axis labels
  const billDataPoints = sortedDateStrings.map(dateStr => {
    return unpaidBills
      .filter(b => b.dueDate === dateStr)
      .reduce((sum, b) => sum + b.amount, 0);
  });

  const cardDataPoints = sortedDateStrings.map(dateStr => {
    return unpaidCards
      .filter(c => c.dueDate === dateStr)
      .reduce((sum, c) => sum + c.balance, 0);
  });

  const data = useMemo(() => ({
    labels: labels.length > 0 ? labels : ["No upcoming"],
    datasets: [
      {
        fill: true,
        label: "Subscriptions",
        data: billDataPoints.length > 0 ? billDataPoints : [0],
        borderColor: "rgba(245, 158, 11, 0.95)", // amber-500
        backgroundColor: "rgba(245, 158, 11, 0.15)",
        tension: 0.4,
      },
      {
        fill: true,
        label: "Card Payments",
        data: cardDataPoints.length > 0 ? cardDataPoints : [0],
        borderColor: "rgba(244, 63, 94, 0.95)", // rose-500
        backgroundColor: "rgba(244, 63, 94, 0.15)",
        tension: 0.4,
      },
    ],
  }), [labels, billDataPoints, cardDataPoints]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        ...chartTheme.plugins.legend,
        display: true,
        position: "top" as const,
        align: "end" as const,
        labels: {
          ...chartTheme.plugins.legend.labels,
          boxWidth: 8,
          boxHeight: 8,
          padding: 12,
          usePointStyle: true,
          pointStyle: "circle" as const,
        }
      },
      tooltip: {
        ...chartTheme.plugins.tooltip,
        mode: "index" as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += fmt(context.parsed.y);
            }
            return label;
          }
        }
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
        min: 0,
      },
    },
    interaction: {
      mode: "nearest" as const,
      axis: "x" as const,
      intersect: false,
    },
  }), []);

  const billsTotal = unpaidBills.reduce((sum, b) => sum + b.amount, 0);
  const cardsTotal = unpaidCards.reduce((sum, c) => sum + c.balance, 0);
  const totalCombined = billsTotal + cardsTotal;

  return (
    <div className="glass-card p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">
          Payment Projection
        </h3>
        <div className="flex gap-2">
          {billsTotal > 0 && (
            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
              {fmt(billsTotal, { maximumFractionDigits: 0 })} Bills
            </span>
          )}
          {cardsTotal > 0 && (
            <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
              {fmt(cardsTotal, { maximumFractionDigits: 0 })} Cards
            </span>
          )}
        </div>
      </div>

      {totalCombined === 0 ? (
        <div className="h-32 w-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          <p className="text-sm opacity-60">No upcoming subscriptions or card payments.</p>
        </div>
      ) : (
        <div className="h-40 w-full mt-2">
          <Line data={data} options={options} />
        </div>
      )}
    </div>
  );
}
