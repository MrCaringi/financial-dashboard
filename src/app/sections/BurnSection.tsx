import React from "react";
import { getBurnComparisonData } from "@/lib/dashboard-data";
import { BurnComparisonChart } from "@/components/BurnComparisonChart";

interface BurnSectionProps {
  now: Date;
}

export async function BurnSection({ now }: BurnSectionProps) {
  const data = await getBurnComparisonData(now);
  return (
    <BurnComparisonChart
      currentCumulative={data.currentCumulative}
      prevCumulative={data.prevCumulative}
      prevTotal={data.prevExpenses}
      isMock={data.isMock}
    />
  );
}
