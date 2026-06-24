import { getCycleForMonth, getAdjacentCycles, formatDateString, getDashboardCycle, getPastCyclesFrom } from "@/lib/payday";
import { getCategoryTransactions, getCategorySpendingHistory, getCategories } from "@/lib/firefly";
import { fmt } from "@/lib/format";
import { ReceiptText, TrendingUp, Info } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { CycleNavigation } from "@/components/CycleNavigation";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryBarChart } from "@/components/CategoryBarChart";
import { TransactionList } from "@/components/TransactionList";


export const dynamic = "force-dynamic";

export default async function CategoryLedgerPage({
  params,
  searchParams,
}: {
  params: Promise<{ period: string; category: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { period, category } = await params;
  const { type } = await searchParams;

  const isIncome = type === "income";
  const decodedCategory = decodeURIComponent(category);

  // Parse period and find the cycle
  const match = period.match(/^(\d{4})-(\d{2})$/);
  if (!match) {
    notFound();
  }
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  if (month < 1 || month > 12) {
    notFound();
  }

  const cycle = getCycleForMonth(year, month);
  
  // Check if cycle is in the future
  const today = new Date();
  const currentCycle = getDashboardCycle(today);
  if (cycle.startDate.getTime() > currentCycle.startDate.getTime()) {
    notFound();
  }

  const currentCycleId = `${currentCycle.startDate.getFullYear()}-${String(currentCycle.startDate.getMonth() + 1).padStart(2, '0')}`;
  const isCurrentPeriod = period === currentCycleId;

  const { prev: prevCycle, next: nextCycle } = getAdjacentCycles(period);

  const startDateStr = formatDateString(cycle.startDate);
  const endDateStr = formatDateString(cycle.endDate);

  // Fetch data in parallel to avoid sequential waterfalls
  const spendingHistory = await getCategorySpendingHistory(
    decodedCategory,
    isIncome ? "income" : "expenses",
    getPastCyclesFrom(period, 12)
  ).catch(() => []);

  // Compute overall 12-month date boundary
  const hasHistory = spendingHistory.length > 0;
  const historyCycles = getPastCyclesFrom(period, 12);
  // Sort history cycles to identify the absolute boundaries
  const sortedCycles = [...historyCycles].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  
  // Start from the earliest cycle's start date and go up to the selected cycle's end date
  const earliestStartDateStr = sortedCycles.length > 0 ? formatDateString(sortedCycles[0].startDate) : startDateStr;
  const selectedEndDateStr = endDateStr;

  const [transactions, categories] = await Promise.all([
    getCategoryTransactions(
      earliestStartDateStr,
      selectedEndDateStr,
      decodedCategory,
      isIncome ? "income" : "expenses"
    ).catch(() => []),
    getCategories().catch(() => []),
  ]);

  const total = transactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  // Group transactions by month/cycle for cleaner presentation of the 12-month ledger
  const groups: Record<string, { label: string; transactions: any[] }> = {};
  
  // Sort all cycles descending (newest first) to show newest months first
  const descendingCycles = [...historyCycles].sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
  
  descendingCycles.forEach(c => {
    groups[c.id] = {
      label: c.label,
      transactions: [] as typeof transactions
    };
  });

  transactions.forEach(tx => {
    // Find which cycle this transaction belongs to using the string dateStr directly
    const txDate = new Date(tx.dateStr || tx.date);
    const matchingCycle = historyCycles.find(c => txDate >= c.startDate && txDate <= c.endDate);
    if (matchingCycle) {
      groups[matchingCycle.id].transactions.push(tx);
    }
  });

  const groupedTransactions = Object.entries(groups)
    .filter(([_, group]) => group.transactions.length > 0);

  const backHref = `/dashboard/${period}?type=${isIncome ? "income" : "expenses"}`;

  return (
    <div className="flex flex-col gap-6 p-4 pt-12 pb-32">
      <PageHeader
        backHref={backHref}
        subtitle={`${cycle.label} · ${isIncome ? "Income" : "Expenses"}`}
        title={decodedCategory}
        rightSection={
          <CycleNavigation
            prevCycle={prevCycle}
            nextCycle={nextCycle}
            currentCycleId={currentCycleId}
            currentLabel={cycle.label}
            isCurrentPeriod={isCurrentPeriod}
            isIncome={isIncome}
            category={category}
          />
        }
      />

      {/* 12-Month Category Spending Trend Chart */}
      {spendingHistory.length > 0 && (
        <section className="glass-card p-4 flex flex-col gap-4">
          <h3 className="font-semibold text-xs tracking-wider text-zinc-400 uppercase">
            {isIncome ? "12-Month Income Trend" : "12-Month Spending Trend"}
          </h3>
          <CategoryBarChart
            data={spendingHistory}
            category={decodedCategory}
            isIncome={isIncome}
          />
        </section>
      )}

      <section className="glass-card p-4">
        <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
          <h3 className="font-semibold text-lg text-zinc-100">
            {isIncome ? "12-Month Total Received" : "12-Month Total Spent"}
          </h3>
          <span className={`text-xl font-bold ${isIncome ? "text-success" : "text-zinc-100"}`}>
            {fmt(total)}
          </span>
        </div>

        <div className="space-y-6">
          {groupedTransactions.length > 0 ? (
            groupedTransactions.map(([key, group]) => (
              <div key={key} className="flex flex-col gap-2">
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-1">
                  {group.label}
                </h4>
                <TransactionList
                  key={`${decodedCategory}-${key}`}
                  transactions={group.transactions}
                  categories={categories}
                  className="flex flex-col gap-2"
                />
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
              <Info size={32} className="opacity-50" />
              <p>No transactions found in this 12-month period.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
