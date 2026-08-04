"use client";

import { useState } from "react";
import { saveAccountConfig } from "./actions";
import { GroupedAccount } from "@/lib/firefly";
import { Save, Loader2, Check, AlertCircle, Sparkles } from "lucide-react";

import { useCurrency } from "@/components/CurrencyContext";

interface AccountSettingsFormProps {
  account: GroupedAccount;
}

export function AccountSettingsForm({ account }: AccountSettingsFormProps) {
  const { symbol } = useCurrency();
  const isCc = account.role === "ccAsset" || account.role === "ccLiability";
  
  // States
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Asset Settings State
  const [primarySource, setPrimarySource] = useState(account.isPrimarySource);

  // Credit Card Settings State
  const [calcType, setCalcType] = useState<"full" | "min">(
    (account.paymentConfig?.calcType as "full" | "min") || "full"
  );
  const [statementDay, setStatementDay] = useState(
    account.paymentConfig?.statementDay || 15
  );
  const [dueDay, setDueDay] = useState(account.paymentConfig?.dueDay || 11);
  const [minPercent, setMinPercent] = useState(
    account.paymentConfig?.minPercent ? account.paymentConfig.minPercent * 100 : 2.5
  );
  const [minFloor, setMinFloor] = useState(
    account.paymentConfig?.minFloor || 5.00
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    let patch: Record<string, any> = {};

    if (isCc) {
      patch = {
        calc_type: calcType,
        statement_day: Number(statementDay),
        due_day: Number(dueDay),
        min_percent: calcType === "min" ? Number(minPercent) / 100 : undefined,
        min_floor: calcType === "min" ? Number(minFloor) : undefined,
      };
    } else {
      patch = {
        current_source: primarySource ? true : undefined,
      };
    }

    const res = await saveAccountConfig(account.id, patch);
    setLoading(false);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(res.error || "An error occurred");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="glass-card p-5 flex flex-col gap-6 relative overflow-hidden">
        {/* Decorative corner glow */}
        <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-primary/10 blur-xl pointer-events-none" />

        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <Sparkles size={16} className="text-primary animate-pulse" />
          <h3 className="text-sm font-semibold tracking-wider text-zinc-300 uppercase">
            Account Preferences
          </h3>
        </div>

        {/* Dynamic Fields */}
        {!isCc ? (
          /* Asset Account Settings */
          <div className="flex items-center justify-between py-2">
            <div className="flex flex-col gap-1 pr-4">
              <span className="text-sm font-semibold text-zinc-200">Set as Primary Source</span>
              <p className="text-xs text-zinc-500">
                Designate this account as the default funding source for upcoming cycle bills and payday safe-to-spend calculation.
              </p>
            </div>
            
            <button
              type="button"
              onClick={() => setPrimarySource(!primarySource)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                primarySource ? "bg-emerald-500" : "bg-zinc-800"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  primarySource ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        ) : (
          /* Credit Card Settings */
          <div className="flex flex-col gap-5">
            {/* Payment Rule Toggle */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Payment Rule
              </label>
              <div className="grid grid-cols-2 gap-2 bg-zinc-950 p-1 rounded-xl border border-white/5">
                <button
                  type="button"
                  onClick={() => setCalcType("full")}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                    calcType === "full"
                      ? "bg-zinc-900 text-white shadow border border-white/10"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Pay Statement In Full
                </button>
                <button
                  type="button"
                  onClick={() => setCalcType("min")}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                    calcType === "min"
                      ? "bg-zinc-900 text-white shadow border border-white/10"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Pay Minimum Amount
                </button>
              </div>
            </div>

            {/* Statement and Due Days */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="statement-day" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Statement Day
                </label>
                <div className="relative">
                  <select
                    id="statement-day"
                    value={statementDay}
                    onChange={(e) => setStatementDay(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-sm text-zinc-100 outline-none focus:border-primary/50 transition-colors appearance-none cursor-pointer"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <option key={day} value={day}>
                        {day}
                        {day === 1 ? "st" : day === 2 ? "nd" : day === 3 ? "rd" : "th"} of the month
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-500">
                    ▼
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="due-day" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Due Day
                </label>
                <div className="relative">
                  <select
                    id="due-day"
                    value={dueDay}
                    onChange={(e) => setDueDay(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-sm text-zinc-100 outline-none focus:border-primary/50 transition-colors appearance-none cursor-pointer"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <option key={day} value={day}>
                        {day}
                        {day === 1 ? "st" : day === 2 ? "nd" : day === 3 ? "rd" : "th"} of the month
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-500">
                    ▼
                  </div>
                </div>
              </div>
            </div>

            {/* Pay Minimum configuration fields */}
            {calcType === "min" && (
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5 animate-fade-in">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="min-percent" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Minimum Percent
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="min-percent"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={minPercent}
                      onChange={(e) => setMinPercent(parseFloat(e.target.value) || 0)}
                      className="w-full bg-zinc-950 border border-white/10 rounded-xl pl-3 pr-8 py-2 text-sm text-zinc-100 outline-none focus:border-primary/50 transition-colors"
                    />
                    <span className="absolute right-3 text-sm text-zinc-500 pointer-events-none">%</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="min-floor" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Minimum Floor
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-sm text-zinc-500 pointer-events-none">{symbol}</span>
                    <input
                      id="min-floor"
                      type="number"
                      step="0.01"
                      min="0"
                      value={minFloor}
                      onChange={(e) => setMinFloor(parseFloat(e.target.value) || 0)}
                      className="w-full bg-zinc-950 border border-white/10 rounded-xl pl-6 pr-3 py-2 text-sm text-zinc-100 outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Save Button & Error feedback */}
      <div className="flex flex-col gap-2">
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl p-3 flex items-center gap-2">
            <AlertCircle size={14} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || success}
          className={`w-full py-3 px-4 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 ${
            success
              ? "bg-emerald-500 text-zinc-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              : "bg-zinc-100 text-zinc-950 hover:bg-white disabled:opacity-55"
          }`}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Saving Preferences...</span>
            </>
          ) : success ? (
            <>
              <Check size={16} strokeWidth={3} className="animate-count-bounce" />
              <span>Configuration Saved!</span>
            </>
          ) : (
            <>
              <Save size={16} />
              <span>Save Preferences</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
