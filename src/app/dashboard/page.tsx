import { getPastCyclesFrom, getDashboardCycle, getCycleForMonth, getAdjacentCycles, formatDateString } from "@/lib/payday";
import { getCycleSummary } from "@/lib/firefly";
import { PageHeader } from "@/components/PageHeader";
import { HistoricalChart } from "@/components/HistoricalChart";
import { BarChart3, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import Link from "next/link";
import { fmt } from "@/lib/format";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ end?: string }>;
}

export default async function DashboardPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const end = searchParams.end;

  const today = new Date();
  const currentCycle = getDashboardCycle(today);
  const currentCycleId = `${currentCycle.startDate.getFullYear()}-${String(currentCycle.startDate.getMonth() + 1).padStart(2, '0')}`;
  
  const endCycleId = end || currentCycleId;
  const isCurrentPeriod = endCycleId === currentCycleId;

  // Resolve year and month of endCycleId
  const match = endCycleId.match(/^(\d{4})-(\d{2})$/);
  let year = today.getFullYear();
  let month = today.getMonth() + 1;
  if (match) {
    year = parseInt(match[1], 10);
    month = parseInt(match[2], 10);
  }
  const endCycle = getCycleForMonth(year, month);
  const endCycleLabel = endCycle.label;

  // Fetch adjacent cycles
  const { prev: prevCycle, next: nextCycle } = getAdjacentCycles(endCycleId);

  // Fetch summary for 6 cycles ending at endCycleId
  const pastCycles = getPastCyclesFrom(endCycleId, 6);
  
  const cyclesData = await Promise.all(
    pastCycles.map(async (cycle) => {
      let income = 0;
      let expenses = 0;
      try {
        const summary = await getCycleSummary(
          formatDateString(cycle.startDate),
          formatDateString(cycle.endDate)
        );
        income = summary.income;
        expenses = summary.expenses;
      } catch (e) {
        console.error("Failed to fetch cycle summary", e);
      }
      
      return {
        id: cycle.id,
        label: cycle.label,
        income,
        expenses,
        startDate: formatDateString(cycle.startDate),
        endDate: formatDateString(cycle.endDate)
      };
    })
  );

  const getDashboardHref = (cycleId: string) => `/dashboard?end=${cycleId}`;

  const navSection = (
    <div className="flex items-center gap-1.5 bg-zinc-900/60 border border-zinc-800/80 rounded-full p-1 backdrop-blur-md">
      {prevCycle ? (
        <Link
          href={getDashboardHref(prevCycle.id)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-white/5 active:scale-95 transition-all"
          title={`Previous: ${prevCycle.label}`}
        >
          <ChevronLeft size={18} />
        </Link>
      ) : (
        <span className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-600 cursor-not-allowed">
          <ChevronLeft size={18} />
        </span>
      )}

      <span className="text-xs font-semibold px-1.5 text-zinc-300 select-none">
        {endCycleLabel}
      </span>

      {nextCycle ? (
        <Link
          href={getDashboardHref(nextCycle.id)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-white/5 active:scale-95 transition-all"
          title={`Next: ${nextCycle.label}`}
        >
          <ChevronRight size={18} />
        </Link>
      ) : (
        <span className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-600 cursor-not-allowed" title="No next cycle">
          <ChevronRight size={18} />
        </span>
      )}

      {!isCurrentPeriod && (
        <>
          <div className="w-[1px] h-4 bg-zinc-800 my-auto mx-0.5" />
          <Link
            href="/dashboard"
            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-white/5 active:scale-95 transition-all"
            title="Jump to current cycle"
          >
            <CalendarDays size={16} />
          </Link>
        </>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-6 p-4 pt-12 pb-32">
      <PageHeader 
        subtitle="Analysis" 
        title="Cycle History" 
        rightSection={navSection}
      />

      <section className="glass-card p-4">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="text-primary" size={20} />
          <h3 className="text-lg font-bold text-zinc-100">Income vs Expenditure</h3>
        </div>
        
        <p className="text-sm text-muted-foreground mb-6">
          Compare your total income against your spending across the last 6 payday cycles. Tap a bar to deep dive into that period.
        </p>

        <HistoricalChart data={cyclesData} />
      </section>

      <section>
        <h3 className="text-lg font-bold text-zinc-100 mb-4 px-2">Cycle Overview</h3>
        <div className="flex flex-col gap-3">
          {cyclesData.slice().reverse().map((cycle) => (
            <Link href={`/dashboard/${cycle.id}`} key={cycle.id} className="glass-card p-4 active:scale-[0.98] transition-transform">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-lg text-zinc-100">{cycle.label}</h4>
                  <p className="text-xs text-muted-foreground">{new Date(cycle.startDate).toLocaleDateString("en-GB", { day: 'numeric', month: 'short' })} - {new Date(cycle.endDate).toLocaleDateString("en-GB", { day: 'numeric', month: 'short' })}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Net</p>
                  <p className={`font-bold ${cycle.income - cycle.expenses >= 0 ? "text-success" : "text-error"}`}>
                    {cycle.income - cycle.expenses >= 0 ? "+" : ""}
                    {fmt(cycle.income - cycle.expenses)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
