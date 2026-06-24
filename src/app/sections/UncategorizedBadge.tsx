import React from "react";
import { getUncategorizedTransactions } from "@/lib/firefly";

export async function UncategorizedBadge() {
  const uncategorizedTx = await getUncategorizedTransactions(30).catch(() => []);
  if (uncategorizedTx.length === 0) return null;
  return (
    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-zinc-950 text-[10px] font-bold flex items-center justify-center border-2 border-zinc-950">
      {uncategorizedTx.length}
    </span>
  );
}
