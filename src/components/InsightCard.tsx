"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Flame, AlertOctagon, Inbox, X, ArrowRight } from "lucide-react";
import type { Insight } from "@/lib/insights";

const ICON_MAP = {
  flame: Flame,
  "alert-octagon": AlertOctagon,
  inbox: Inbox,
} as const;

const SEVERITY_STYLES = {
  error: {
    border: "border-l-rose-500",
    iconBg: "bg-rose-500/10",
    iconColor: "text-rose-400",
  },
  warning: {
    border: "border-l-amber-500",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-400",
  },
  info: {
    border: "border-l-cyan-500",
    iconBg: "bg-cyan-500/10",
    iconColor: "text-cyan-400",
  },
} as const;

function getDismissKey(insight: Insight): string {
  return `insight-dismissed:${insight.id}:${insight.cycleId}`;
}

export function InsightCard({ insight }: { insight: Insight }) {
  const [visible, setVisible] = useState(false);
  const [dismissing, setDismissing] = useState(false);

  useEffect(() => {
    const key = getDismissKey(insight);
    if (!localStorage.getItem(key)) {
      let active = true;
      queueMicrotask(() => {
        if (active) setVisible(true);
      });
      return () => {
        active = false;
      };
    }
  }, [insight]);

  const handleDismiss = useCallback(() => {
    setDismissing(true);
    const key = getDismissKey(insight);
    localStorage.setItem(key, Date.now().toString());
    // Wait for the dismiss animation to complete before removing from DOM
    setTimeout(() => setVisible(false), 300);
  }, [insight]);

  // Don't render anything if not visible (handles SSR + dismissed state)
  if (!visible) return null;

  const Icon = ICON_MAP[insight.icon];
  const styles = SEVERITY_STYLES[insight.severity];

  return (
    <div
      className={`glass-card py-3 px-4 border-y-0 border-r-0 rounded-l-none border-l-4 ${styles.border} ${
        dismissing ? "animate-insight-out" : "animate-insight-in"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`w-8 h-8 rounded-full ${styles.iconBg} flex-shrink-0 flex items-center justify-center ${styles.iconColor}`}
        >
          <Icon size={15} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-semibold text-zinc-100 leading-snug">
              {insight.title}
            </h4>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60 transition-colors active:scale-90"
              aria-label="Dismiss insight"
            >
              <X size={13} />
            </button>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
            {insight.description}
          </p>
          {insight.actionLabel && insight.actionHref && (
            <Link
              href={insight.actionHref}
              className="inline-flex items-center gap-1 text-xs font-semibold mt-2 text-zinc-300 hover:text-zinc-100 transition-colors"
            >
              <span>{insight.actionLabel}</span>
              <ArrowRight size={11} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
