"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Coins, Check, Loader2, Info } from "lucide-react";
import { FireflyCurrency } from "@/lib/api/currencies";
import { DisplayCurrency } from "@/lib/currency-types";
import { setDisplayCurrencyAction } from "../actions";
import { useCurrency } from "@/components/CurrencyContext";
import { formatCurrency } from "@/lib/format";

interface CurrencySettingsClientProps {
  currencies: FireflyCurrency[];
  currentDisplayCurrency: DisplayCurrency;
}

export function CurrencySettingsClient({
  currencies,
  currentDisplayCurrency,
}: CurrencySettingsClientProps) {
  const router = useRouter();
  const { setCurrency: updateContextCurrency } = useCurrency();
  const [selectedCode, setSelectedCode] = useState<string>(currentDisplayCurrency.code);
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const activeCurrency = currencies.find(c => c.code === selectedCode) || {
    id: "",
    code: currentDisplayCurrency.code,
    name: currentDisplayCurrency.name,
    symbol: currentDisplayCurrency.symbol,
    decimal_places: currentDisplayCurrency.decimalPlaces,
    enabled: true,
    default: false,
  };

  const handleSave = () => {
    setStatusMessage(null);
    startTransition(async () => {
      const payload = {
        id: activeCurrency.id,
        code: activeCurrency.code,
        symbol: activeCurrency.symbol,
        name: activeCurrency.name,
        decimalPlaces: activeCurrency.decimal_places,
      };

      const res = await setDisplayCurrencyAction(payload);
      if (res.success) {
        updateContextCurrency({
          code: activeCurrency.code,
          symbol: activeCurrency.symbol,
          name: activeCurrency.name,
          decimalPlaces: activeCurrency.decimal_places,
        });
        setStatusMessage({ type: "success", text: `Display currency updated to ${activeCurrency.name} (${activeCurrency.symbol})` });
        router.refresh();
        setTimeout(() => setStatusMessage(null), 4000);
      } else {
        setStatusMessage({ type: "error", text: res.error || "Failed to update display currency" });
      }
    });
  };

  const sampleAmount = 4161.03;

  return (
    <div className="flex flex-col gap-6">
      {/* Intro Card */}
      <div className="glass-card p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
          <Coins size={20} />
        </div>
        <div>
          <h2 className="text-base font-semibold text-zinc-100">Default Display Currency</h2>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            Select your preferred currency for dashboard values, charts, net worth totals, and accounts. Synced with Firefly III default currency when connected.
          </p>
        </div>
      </div>

      {/* Live Preview Card */}
      <div className="glass-card p-4 border border-white/10 bg-white/[0.02]">
        <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Live Format Preview</div>
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-zinc-300">Sample Account Balance:</span>
          <span className="text-xl font-bold text-emerald-400 tracking-tight">
            {formatCurrency(sampleAmount, activeCurrency.code)}
          </span>
        </div>
      </div>

      {/* Selection Grid / List */}
      <div className="flex flex-col gap-3">
        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide px-1">
          Available Currencies ({currencies.length})
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currencies.map((curr) => {
            const isSelected = selectedCode === curr.code;
            return (
              <button
                key={curr.code}
                type="button"
                onClick={() => setSelectedCode(curr.code)}
                className={`glass-card p-4 text-left flex items-center justify-between transition-all cursor-pointer ${
                  isSelected
                    ? "border-amber-500/50 bg-amber-500/10 shadow-lg shadow-amber-500/5"
                    : "hover:bg-white/5 active:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base transition-colors ${
                    isSelected ? "bg-amber-500 text-zinc-950" : "bg-zinc-800 text-zinc-300"
                  }`}>
                    {curr.symbol}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
                      <span>{curr.name}</span>
                      <span className="text-xs text-zinc-450 uppercase font-mono">({curr.code})</span>
                    </div>
                    <div className="text-xs text-zinc-450 mt-0.5">
                      Preview: {formatCurrency(1234.56, curr.code)}
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center shrink-0">
                    <Check size={14} strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action / Save Bar */}
      <div className="flex flex-col gap-3 mt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending || selectedCode === currentDisplayCurrency.code}
          className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold py-3 px-4 rounded-xl active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 cursor-pointer"
        >
          {isPending ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Check size={18} />
          )}
          <span>
            {selectedCode === currentDisplayCurrency.code ? "Currently Selected" : "Save Display Currency"}
          </span>
        </button>

        {statusMessage && (
          <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 animate-fade-in ${
            statusMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
          }`}>
            {statusMessage.type === "success" ? <Check size={14} /> : <Info size={14} />}
            <span>{statusMessage.text}</span>
          </div>
        )}
      </div>
    </div>
  );
}
