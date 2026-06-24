"use client";

import { useState } from "react";
import { ReceiptText, Settings as SettingsIcon, ArrowRight } from "lucide-react";
import Link from "next/link";

interface AccountTabsProps {
  activityTab: React.ReactNode;
  settingsTab: React.ReactNode;
  accountName: string;
  initialTab?: string;
}

export function AccountTabs({ activityTab, settingsTab, accountName, initialTab }: AccountTabsProps) {
  const [activeTab, setActiveTab] = useState<"activity" | "settings">(
    initialTab === "settings" ? "settings" : "activity"
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Tab Selectors */}
      <div role="tablist" aria-label="Account details sections" className="flex bg-zinc-950 p-1 rounded-xl border border-white/5">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "activity"}
          aria-controls="activity-panel"
          id="tab-activity"
          onClick={() => setActiveTab("activity")}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === "activity"
              ? "bg-zinc-900 text-white shadow border border-white/10"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <ReceiptText size={14} />
          <span>Activity</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "settings"}
          aria-controls="settings-panel"
          id="tab-settings"
          onClick={() => setActiveTab("settings")}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === "settings"
              ? "bg-zinc-900 text-white shadow border border-white/10"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <SettingsIcon size={14} />
          <span>Settings</span>
        </button>
      </div>

      {/* Tab Panels with fade transition */}
      <div className="transition-all duration-300">
        {activeTab === "activity" ? (
          <div
            id="activity-panel"
            role="tabpanel"
            aria-labelledby="tab-activity"
            className="animate-fade-in flex flex-col gap-4"
          >
            <div className="flex justify-between items-center px-1 mb-1">
              <h3 className="text-sm font-semibold tracking-wider text-zinc-400 uppercase">
                Recent Transactions
              </h3>
              <Link
                href={`/transactions?account=${encodeURIComponent(accountName)}`}
                className="text-xs text-zinc-400 hover:text-zinc-100 flex items-center gap-1 transition-colors"
              >
                <span>View All</span>
                <ArrowRight size={13} />
              </Link>
            </div>
            {activityTab}
          </div>
        ) : (
          <div
            id="settings-panel"
            role="tabpanel"
            aria-labelledby="tab-settings"
            className="animate-fade-in"
          >
            {settingsTab}
          </div>
        )}
      </div>
    </div>
  );
}
