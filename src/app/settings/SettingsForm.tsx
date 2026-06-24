"use client";

import React, { useTransition } from "react";
import { useRouter } from "next/navigation";
import { forceRefresh } from "./actions";
import {
  Sliders,
  CreditCard,
  ChevronDown,
  Loader2,
  Check,
  RefreshCw,
  Globe,
  Calendar,
  Wallet,
  AlertTriangle,
  MonitorPlay
} from "lucide-react";

import Link from "next/link";

interface SettingsFormProps {
  apiUrl: string;
  isMock: boolean;
  demoModeActive?: boolean;
}

export function SettingsForm({
  apiUrl,
  isMock,
  demoModeActive = false,
}: SettingsFormProps) {
  const router = useRouter();

  // --- Force Refresh State ---
  const [isRefreshPending, startRefreshTransition] = useTransition();
  const [refreshStatus, setRefreshStatus] = useState<string | null>(null);

  const handleForceRefresh = () => {
    setRefreshStatus(null);
    startRefreshTransition(async () => {
      await forceRefresh();
      setRefreshStatus("Dashboard cache cleared successfully!");
      router.refresh();
      setTimeout(() => setRefreshStatus(null), 3000);
    });
  };

  const [isDemoPending, startDemoTransition] = useTransition();
  const handleDemoToggle = () => {
    startDemoTransition(async () => {
      const { toggleDemoMode } = await import("./actions");
      await toggleDemoMode(!demoModeActive);
      router.refresh();
    });
  };

  function useState<T>(initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    return React.useState(initialValue);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Account Settings Navigation Card */}
      <div className="glass-card overflow-hidden">
        <Link
          href="/settings/accounts"
          className="w-full text-left p-4 flex items-center justify-between gap-4 hover:bg-white/5 active:bg-white/10 transition-colors block"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-400">
              <Wallet size={20} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">Account Settings</h3>
              <p className="text-xs text-zinc-450 mt-0.5">
                Set primary cash account source and customize credit card strategies.
              </p>
            </div>
          </div>
          <div className="text-zinc-400">
            <ChevronDown size={16} className="-rotate-90" />
          </div>
        </Link>
      </div>

      {/* 2. Cycle & Payday Navigation Card */}
      <div className="glass-card overflow-hidden">
        <Link
          href="/settings/payday"
          className="w-full text-left p-4 flex items-center justify-between gap-4 hover:bg-white/5 active:bg-white/10 transition-colors block"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-violet-500/10 text-violet-400">
              <Calendar size={20} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">Cycle & Payday</h3>
              <p className="text-xs text-zinc-450 mt-0.5">
                Configure your monthly payday rules and cycle start dates.
              </p>
            </div>
          </div>
          <div className="text-zinc-400">
            <ChevronDown size={16} className="-rotate-90" />
          </div>
        </Link>
      </div>

      {/* 2. Automation Rules Navigation Card */}
      <div className="glass-card overflow-hidden">
        <Link
          href="/settings/rules"
          className="w-full text-left p-4 flex items-center justify-between gap-4 hover:bg-white/5 active:bg-white/10 transition-colors block"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-500/10 text-indigo-400">
              <Sliders size={20} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">Automation Rules</h3>
              <p className="text-xs text-zinc-450 mt-0.5">
                Manage auto-categorization keywords, CC transfer rules, and subscriptions.
              </p>
            </div>
          </div>
          <div className="text-zinc-400">
            <ChevronDown size={16} className="-rotate-90" />
          </div>
        </Link>
      </div>

      {/* 3. Subscriptions Navigation Card */}
      <div className="glass-card overflow-hidden">
        <Link
          href="/settings/subscriptions"
          className="w-full text-left p-4 flex items-center justify-between gap-4 hover:bg-white/5 active:bg-white/10 transition-colors block"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-cyan-500/10 text-cyan-400">
              <Calendar size={20} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">Subscriptions</h3>
              <p className="text-xs text-zinc-450 mt-0.5">
                Manage expected bills, recurring subscriptions, and track their pricing details.
              </p>
            </div>
          </div>
          <div className="text-zinc-400">
            <ChevronDown size={16} className="-rotate-90" />
          </div>
        </Link>
      </div>

      {/* 4. API Connection Card */}
      <div className="glass-card overflow-hidden">
        <Link
          href="/settings/connection"
          className="w-full text-left p-4 flex items-center justify-between gap-4 hover:bg-white/5 active:bg-white/10 transition-colors block"
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isMock ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-400"
            }`}>
              <Globe size={20} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">API Connection & Keys</h3>
              <p className="text-xs text-zinc-450 mt-0.5 truncate max-w-[200px] xs:max-w-xs md:max-w-md">
                {apiUrl}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${
                isMock ? "bg-amber-500 animate-pulse" : "bg-emerald-500 animate-pulse"
              }`} />
              <span className={`text-xs font-semibold ${
                isMock ? "text-amber-500" : "text-emerald-400"
              }`}>
                {isMock ? "Mock / Offline" : "Connected"}
              </span>
            </div>
            <div className="text-zinc-400">
              <ChevronDown size={16} className="-rotate-90" />
            </div>
          </div>
        </Link>
      </div>

      {/* 5. Demo Mode Toggle Card */}
      <div className="glass-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            demoModeActive ? "bg-fuchsia-500/20 text-fuchsia-400" : "bg-zinc-500/10 text-zinc-400"
          }`}>
            <MonitorPlay size={20} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">Demo Mode</h3>
            <p className="text-xs text-zinc-450 mt-0.5 max-w-[280px]">
              Obscures bank names and amounts. Data mutations are mocked without modifying your actual backend.
            </p>
          </div>
        </div>

        <button
          onClick={handleDemoToggle}
          disabled={isDemoPending}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            demoModeActive ? "bg-fuchsia-500" : "bg-zinc-700"
          } ${isDemoPending ? "opacity-50" : ""}`}
        >
          <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
            demoModeActive ? "translate-x-6" : "translate-x-0"
          }`} />
        </button>
      </div>

      {/* 6. Cache Clear / Refresh Card */}
      <section className="flex flex-col gap-3 mt-4">
        <div className="flex items-center gap-2 px-2 text-rose-500">
          <AlertTriangle size={14} />
          <h3 className="font-bold text-xs uppercase tracking-wider">
            Danger Zone
          </h3>
        </div>

        <div className="glass-card p-4 border border-rose-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-semibold text-zinc-200">Force Cache Refresh</h4>
            <p className="text-xs text-zinc-450 mt-1 max-w-md">
              Bypass local Next.js cache and force a complete fetch from Firefly III.
            </p>
          </div>

          <button
            onClick={handleForceRefresh}
            disabled={isRefreshPending}
            className="w-full sm:w-auto bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 active:scale-[0.98] transition-all px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isRefreshPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
            <span>Force Refresh</span>
          </button>
        </div>

        {refreshStatus && (
          <div className="mx-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-3 py-2 rounded-xl flex items-center gap-2 animate-fade-in">
            <Check size={14} />
            <span>{refreshStatus}</span>
          </div>
        )}
      </section>
    </div>
  );
}
