import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getRecentActivityData } from "@/lib/dashboard-data";
import { TransactionList } from "@/components/TransactionList";

export async function TransactionsSection() {
  const data = await getRecentActivityData();
  return (
    <section>
      <div className="flex justify-between items-center mb-3 px-2">
        <h3 className="text-lg font-bold text-zinc-100">Recent Activity</h3>
        <Link 
          href="/transactions" 
          className="text-xs text-zinc-400 hover:text-zinc-100 flex items-center gap-1 transition-colors"
        >
          <span>View All</span>
          <ArrowRight size={13} />
        </Link>
      </div>
      <TransactionList transactions={data.recentTransactions} categories={data.categories} />
    </section>
  );
}
