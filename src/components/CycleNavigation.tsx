import Link from "next/link";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

interface CycleInfo {
  id: string;
  label: string;
}

interface CycleNavigationProps {
  prevCycle: CycleInfo | null;
  nextCycle: CycleInfo | null;
  currentCycleId: string;
  currentLabel: string;
  isCurrentPeriod: boolean;
  isIncome: boolean;
  category?: string;
}

export function CycleNavigation({
  prevCycle,
  nextCycle,
  currentCycleId,
  currentLabel,
  isCurrentPeriod,
  isIncome,
  category,
}: CycleNavigationProps) {
  const getHref = (cycleId: string) => {
    const typeParam = `type=${isIncome ? "income" : "expenses"}`;
    if (category) {
      return `/dashboard/${cycleId}/${category}?${typeParam}`;
    }
    return `/dashboard/${cycleId}?${typeParam}`;
  };

  return (
    <div className="flex items-center gap-1.5 bg-zinc-900/60 border border-zinc-800/80 rounded-full p-1 backdrop-blur-md">
      {prevCycle ? (
        <Link
          href={getHref(prevCycle.id)}
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
        {currentLabel}
      </span>

      {nextCycle ? (
        <Link
          href={getHref(nextCycle.id)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-white/5 active:scale-95 transition-all"
          title={`Next: ${nextCycle.label}`}
        >
          <ChevronRight size={18} />
        </Link>
      ) : (
        <span className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-600 cursor-not-allowed" title="No next cycle (future)">
          <ChevronRight size={18} />
        </span>
      )}

      {!isCurrentPeriod && (
        <>
          <div className="w-[1px] h-4 bg-zinc-800 my-auto mx-0.5" />
          <Link
            href={getHref(currentCycleId)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-white/5 active:scale-95 transition-all"
            title="Jump to latest month"
          >
            <CalendarDays size={16} />
          </Link>
        </>
      )}
    </div>
  );
}
