"use client";

import { useMemo } from "react";
import { chartTheme, chartHelpers } from "@/lib/chartjs-setup";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { getCategoryStyle } from "@/lib/category-icons";

const Bar = dynamic(() => import("react-chartjs-2").then((mod) => mod.Bar), { ssr: false });

interface CategoryBarChartProps {
  data: {
    id: string;
    label: string;
    amount: number;
  }[];
  category: string;
  isIncome: boolean;
}

export function CategoryBarChart({ data, category, isIncome }: CategoryBarChartProps) {
  const router = useRouter();

  const chartData = useMemo(() => {
    const style = getCategoryStyle(category);
    const color = `rgba(${style.chartColor}, 0.75)`;
    const hoverColor = `rgb(${style.chartColor})`;
    return {
      labels: data.map((d) => d.label),
      datasets: [
        {
          label: isIncome ? "Received" : "Spent",
          data: data.map((d) => d.amount),
          backgroundColor: color,
          hoverBackgroundColor: hoverColor,
          borderRadius: 4,
          borderSkipped: false,
        },
      ],
    };
  }, [data, category, isIncome]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
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
        grid: {
          display: false,
        },
      },
      y: {
        ...chartTheme.scales.y,
        ticks: {
          ...chartTheme.scales.y.ticks,
          callback: function (value: any) {
            return "£" + value;
          },
        },
      },
    },
    onClick: (event: any, elements: any[]) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const cycleId = data[index].id;
        const type = isIncome ? "income" : "expenses";
        router.push(`/dashboard/${cycleId}/${encodeURIComponent(category)}?type=${type}`);
      }
    },
    onHover: chartHelpers.onHoverPointer,
  }), [data, category, isIncome, router]);

  return (
    <div className="w-full" style={{ position: "relative", height: "14rem" }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}
