"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { GroupedAccount, CreditCardConfig } from "@/lib/firefly";
import { setPrimaryAccount, updateCreditCardConfig } from "../actions";
import { Sliders, CreditCard, Loader2, Check, AlertCircle, Save, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";

import { useCurrency } from "@/components/CurrencyContext";

interface AccountsSettingsClientProps {
  currentAccounts: GroupedAccount[];
  creditCardAccounts: GroupedAccount[];
  initialPrimaryAccountId: string | null;
}

export function AccountsSettingsClient({
  currentAccounts,
  creditCardAccounts,
  initialPrimaryAccountId,
}: AccountsSettingsClientProps) {
  const router = useRouter();
  const { symbol } = useCurrency();

  // --- Primary Account State ---
  const [primaryAccountId, setPrimaryAccountId] = useState<string>(
    initialPrimaryAccountId || (currentAccounts[0]?.id ?? "")
  );
  const [isPrimaryPending, startPrimaryTransition] = useTransition();
  const [primaryStatus, setPrimaryStatus] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  const handleSavePrimary = () => {
    setPrimaryStatus(null);
    if (!primaryAccountId) return;

    startPrimaryTransition(async () => {
      const result = await setPrimaryAccount(primaryAccountId);
      if (result.success) {
        setPrimaryStatus({ success: true, message: "Primary account updated successfully!" });
        router.refresh();
      } else {
        setPrimaryStatus({ success: false, message: result.error || "Failed to update primary account" });
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Primary Cash Source Section */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2 px-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center bg-zinc-800 text-zinc-300">
            <Sliders size={12} />
          </div>
          <h3 className="font-bold text-xs text-zinc-300 uppercase tracking-wider">
            Primary Cash Source
          </h3>
        </div>

        <div className="glass-card p-4 flex flex-col gap-4">
          <p className="text-xs text-zinc-400 leading-relaxed">
            Choose the primary current account used for calculating your Safe-to-Spend balance and tracking daily cash flows.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={primaryAccountId}
              onChange={(e) => setPrimaryAccountId(e.target.value)}
              disabled={isPrimaryPending || currentAccounts.length === 0}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700 disabled:opacity-50"
            >
              {currentAccounts.length === 0 ? (
                <option value="">No current accounts available</option>
              ) : (
                currentAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.currencySymbol}
                    {acc.displayBalance.toFixed(2)})
                  </option>
                ))
              )}
            </select>

            <button
              onClick={handleSavePrimary}
              disabled={isPrimaryPending || currentAccounts.length === 0}
              className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200 active:scale-[0.98] transition-all px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPrimaryPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              <span>Save</span>
            </button>
          </div>

          {primaryStatus && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 mt-1 ${
              primaryStatus.success
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-rose-500/10 border-rose-500/20 text-rose-400"
            }`}>
              {primaryStatus.success ? <Check size={14} /> : <AlertCircle size={14} />}
              <span>{primaryStatus.message}</span>
            </div>
          )}
        </div>
      </section>

      {/* 2. Credit Card Rules Section */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2 px-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center bg-zinc-800 text-zinc-300">
            <CreditCard size={12} />
          </div>
          <h3 className="font-bold text-xs text-zinc-300 uppercase tracking-wider">
            Credit Card Payment Rules
          </h3>
        </div>

        <div className="flex flex-col gap-3">
          {creditCardAccounts.length === 0 ? (
            <div className="glass-card p-4 text-center">
              <p className="text-xs text-zinc-500">No active credit card accounts found.</p>
            </div>
          ) : (
            creditCardAccounts.map((card) => (
              <CreditCardFormCard key={card.id} card={card} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function CreditCardFormCard({
  card,
}: {
  card: GroupedAccount;
}) {
  const router = useRouter();
  const { symbol } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  // Form inputs state
  const [statementDay, setStatementDay] = useState<string>(
    card.paymentConfig?.statementDay?.toString() || "15"
  );
  const [dueDay, setDueDay] = useState<string>(
    card.paymentConfig?.dueDay?.toString() || "11"
  );
  const [calcType, setCalcType] = useState<"full" | "min">(
    (card.paymentConfig?.calcType as "full" | "min") || "full"
  );
  const [minPercent, setMinPercent] = useState<string>(
    card.paymentConfig?.minPercent !== undefined
      ? card.paymentConfig.minPercent.toString()
      : "0.025"
  );
  const [minFloor, setMinFloor] = useState<string>(
    card.paymentConfig?.minFloor !== undefined
      ? card.paymentConfig.minFloor.toString()
      : "5.00"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    const stmt = parseInt(statementDay, 10);
    const due = parseInt(dueDay, 10);

    if (isNaN(stmt) || stmt < 1 || stmt > 31) {
      setStatus({ success: false, message: "Statement Day must be between 1 and 31" });
      return;
    }
    if (isNaN(due) || due < 1 || due > 31) {
      setStatus({ success: false, message: "Due Day must be between 1 and 31" });
      return;
    }

    let minPctNum: number | undefined = undefined;
    let minFlrNum: number | undefined = undefined;

    if (calcType === "min") {
      minPctNum = parseFloat(minPercent);
      minFlrNum = parseFloat(minFloor);

      if (isNaN(minPctNum) || minPctNum < 0 || minPctNum > 1) {
        setStatus({
          success: false,
          message: "Minimum payment percentage must be between 0 and 1 (e.g. 0.025)",
        });
        return;
      }
      if (isNaN(minFlrNum) || minFlrNum < 0) {
        setStatus({ success: false, message: "Minimum floor must be a positive number" });
        return;
      }
    }

    startTransition(async () => {
      const config: CreditCardConfig = {
        calc_type: calcType,
        statement_day: stmt,
        due_day: due,
        min_percent: minPctNum,
        min_floor: minFlrNum,
      };

      const result = await updateCreditCardConfig(card.id, config);
      if (result.success) {
        setStatus({ success: true, message: "Rule updated successfully!" });
        router.refresh();
        setTimeout(() => setStatus(null), 4000);
      } else {
        setStatus({ success: false, message: result.error || "Failed to update configuration" });
      }
    });
  };

  const isConfigured = !!card.paymentConfig;

  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-4 flex items-center justify-between hover:bg-white/5 active:bg-white/10 transition-colors"
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-zinc-100">{card.name}</span>
            {isConfigured ? (
              <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Configured
              </span>
            ) : (
              <span className="text-xs bg-zinc-800 text-zinc-400 border border-zinc-700/80 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                No Rule
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400">
            {isConfigured && card.paymentConfig
              ? `${card.paymentConfig.calcType === "full" ? "Statement Balance" : "Minimum Payment"} • Statement ${card.paymentConfig.statementDay}th • Due ${card.paymentConfig.dueDay}th`
              : "Uses default behavior (full balance, no due date filtering)"}
          </p>
        </div>

        <div className="text-zinc-400">
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {isOpen && (
        <form
          onSubmit={handleSubmit}
          className="border-t border-white/5 p-4 bg-zinc-950/40 flex flex-col gap-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={`stmt-day-${card.id}`} className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
                Statement Day
              </label>
              <input
                id={`stmt-day-${card.id}`}
                type="number"
                min="1"
                max="31"
                value={statementDay}
                onChange={(e) => setStatementDay(e.target.value)}
                disabled={isPending}
                className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700 disabled:opacity-50"
                placeholder="15"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor={`due-day-${card.id}`} className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
                Due Day
              </label>
              <input
                id={`due-day-${card.id}`}
                type="number"
                min="1"
                max="31"
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
                disabled={isPending}
                className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700 disabled:opacity-50"
                placeholder="11"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
              Payment Calculation Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCalcType("full")}
                disabled={isPending}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all active:scale-[0.98] ${
                  calcType === "full"
                    ? "bg-zinc-100 text-zinc-900 border-zinc-100"
                    : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                Pay Full Statement
              </button>
              <button
                type="button"
                onClick={() => setCalcType("min")}
                disabled={isPending}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all active:scale-[0.98] ${
                  calcType === "min"
                    ? "bg-zinc-100 text-zinc-900 border-zinc-100"
                    : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                Pay Minimum Amount
              </button>
            </div>
          </div>

          {calcType === "min" && (
            <div className="grid grid-cols-2 gap-4 p-3 bg-zinc-900/40 rounded-xl border border-zinc-800/50">
              <div className="flex flex-col gap-1.5">
                <label htmlFor={`min-percent-${card.id}`} className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
                  Min Percentage
                </label>
                <input
                  id={`min-percent-${card.id}`}
                  type="number"
                  step="0.001"
                  min="0"
                  max="1"
                  value={minPercent}
                  onChange={(e) => setMinPercent(e.target.value)}
                  disabled={isPending}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700"
                  placeholder="0.025"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor={`min-floor-${card.id}`} className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
                  Min Floor ({symbol})
                </label>
                <input
                  id={`min-floor-${card.id}`}
                  type="number"
                  step="0.01"
                  min="0"
                  value={minFloor}
                  onChange={(e) => setMinFloor(e.target.value)}
                  disabled={isPending}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700"
                  placeholder="5.00"
                  required
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 items-center mt-2">
            <button
              type="submit"
              disabled={isPending}
              className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200 active:scale-[0.98] transition-all px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
            >
              {isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              <span>Save Rules</span>
            </button>
          </div>

          {status && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              status.success
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-rose-500/10 border-rose-500/20 text-rose-400"
            }`}>
              {status.success ? <Check size={14} /> : <AlertCircle size={14} />}
              <span>{status.message}</span>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
