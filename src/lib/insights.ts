import { fmt } from "@/lib/format";

export interface Insight {
  id: string;
  type: "burn-pace" | "projected-negative" | "uncategorized-triage";
  severity: "info" | "warning" | "error";
  icon: "flame" | "alert-octagon" | "inbox";
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  cycleId: string;
}

interface InsightParams {
  finalProjectedBalance: number;
  negativeDate: string | null; // ISO date string or null
  currentBurn: number;         // cumulative spend so far this cycle
  prevBurn: number;            // cumulative spend at same day last cycle
  prevTotal: number;           // total spend last cycle
  daysElapsed: number;         // days into the current cycle (0-indexed)
  uncategorizedCount: number;
  cycleId: string;             // e.g. "2026-06"
}

const MAX_INSIGHTS = 2;

/**
 * Pure function — takes pre-computed metrics from the dashboard data layer
 * and returns up to MAX_INSIGHTS insights, sorted by priority (highest first).
 * No side effects, no API calls.
 */
export function generateInsights(params: InsightParams): Insight[] {
  const insights: Insight[] = [];

  // --- 1. Projected Negative Balance (Priority: highest) ---
  if (params.finalProjectedBalance < 0 && params.negativeDate) {
    const dateObj = new Date(params.negativeDate);
    const formatted = dateObj.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
    insights.push({
      id: "projected-negative",
      type: "projected-negative",
      severity: "error",
      icon: "alert-octagon",
      title: "Balance projected to go negative",
      description: `Your current account will drop below £0 by ${formatted} if all upcoming payments go through. Projected: ${fmt(params.finalProjectedBalance)}`,
      actionLabel: "View Upcoming",
      actionHref: "/#upcoming",
      cycleId: params.cycleId,
    });
  }

  // --- 2. Burn Pace Alert (Priority: high) ---
  // Only show after day 7 of the cycle to avoid early noise
  if (params.daysElapsed >= 7 && params.prevBurn >= 5) {
    const diff = params.currentBurn - params.prevBurn;
    const absDiff = Math.abs(diff);
    const pctDiff = (diff / params.prevBurn) * 100;

    // Only trigger if difference is meaningful: >15% AND >£20
    if (Math.abs(pctDiff) >= 15 && absDiff >= 20) {
      const isOver = diff > 0;
      insights.push({
        id: "burn-pace",
        type: "burn-pace",
        severity: isOver ? "warning" : "info",
        icon: "flame",
        title: isOver
          ? `Spending ${Math.round(Math.abs(pctDiff))}% ahead of last month`
          : `Spending ${Math.round(Math.abs(pctDiff))}% behind last month`,
        description: isOver
          ? `${fmt(params.currentBurn)} so far vs ${fmt(params.prevBurn)} at this point last cycle. On track to exceed last month's ${fmt(params.prevTotal)}.`
          : `${fmt(params.currentBurn)} so far vs ${fmt(params.prevBurn)} at this point last cycle. You're on track to underspend.`,
        actionLabel: "View Spending",
        actionHref: "/dashboard",
        cycleId: params.cycleId,
      });
    }
  }

  // --- 3. Uncategorized Triage (Priority: lower) ---
  if (params.uncategorizedCount > 3) {
    const estimate = Math.max(1, Math.ceil(params.uncategorizedCount * 0.3));
    insights.push({
      id: "uncategorized-triage",
      type: "uncategorized-triage",
      severity: "info",
      icon: "inbox",
      title: `${params.uncategorizedCount} uncategorized transactions`,
      description: `From the last 30 days — takes about ${estimate} min to sort.`,
      actionLabel: "Sort Now",
      actionHref: "/uncategorized",
      cycleId: params.cycleId,
    });
  }

  // Return at most MAX_INSIGHTS, already in priority order
  return insights.slice(0, MAX_INSIGHTS);
}
