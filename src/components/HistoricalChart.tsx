"use client";

import { useMemo } from "react";
import { chartTheme, chartHelpers } from "@/lib/chartjs-setup";
import dynamic from 'next/dynamic';
const Bar = dynamic(() => import('react-chartjs-2').then((mod) => mod.Bar), { ssr: false });
import { useRouter } from 'next/navigation';

interface HistoricalChartProps {
  data: {
    id: string;
    label: string;
    income: number;
    expenses: number;
  }[];
}

export function HistoricalChart({ data }: HistoricalChartProps) {
  const router = useRouter();

  const chartData = useMemo(() => ({
    labels: data.map(d => d.label),
    datasets: [
      {
        label: 'Income',
        data: data.map(d => d.income),
        backgroundColor: 'rgba(34, 197, 94, 0.8)', // success
        borderRadius: 4,
      },
      {
        label: 'Expenses',
        data: data.map(d => d.expenses),
        backgroundColor: 'rgba(239, 68, 68, 0.8)', // error
        borderRadius: 4,
      },
    ],
  }), [data]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        ...chartTheme.plugins.legend,
        position: 'top' as const,
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
          display: false,
        },
      },
      y: {
        ...chartTheme.scales.y,
        ticks: {
          ...chartTheme.scales.y.ticks,
          callback: function(value: any) {
            return '£' + value;
          }
        }
      }
    },
    onClick: (event: any, elements: any[]) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const datasetIndex = elements[0].datasetIndex; // 0 = Income, 1 = Expenses
        const cycleId = data[index].id;
        const type = datasetIndex === 0 ? 'income' : 'expenses';
        router.push(`/dashboard/${cycleId}?type=${type}`);
      }
    },
    onHover: chartHelpers.onHoverPointer,
  }), [data, router]);

  return (
    <div className="w-full" style={{ position: 'relative', height: '16rem' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}
