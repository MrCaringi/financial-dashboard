"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Save, Loader2, Check, AlertCircle, ToggleLeft, ToggleRight,
  CalendarDays, Sparkles, ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { Bill } from "@/lib/api/bills";
import { Rule } from "@/lib/api/rules";
import { PageHeader } from "@/components/PageHeader";
import { updateBillAction } from "@/app/settings/actions";
import { fmt } from "@/lib/format";
import { useCurrency } from "@/components/CurrencyContext";

interface SubscriptionEditClientProps {
  bill: Bill;
  linkedRules: Rule[];
}

const FREQ_OPTIONS = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "half-year", label: "Half Year" },
  { value: "yearly", label: "Yearly" },
];

export function SubscriptionEditClient({ bill, linkedRules }: SubscriptionEditClientProps) {
  const { symbol, fmt } = useCurrency();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(bill.name);
  const [amountMin, setAmountMin] = useState(String(bill.amountMin ?? bill.amount));
  const [amountMax, setAmountMax] = useState(String(bill.amountMax ?? bill.amount));
  const [repeatFreq, setRepeatFreq] = useState(bill.repeatFreq ?? "monthly");
  const [date, setDate] = useState(bill.date ?? "");
  const [active, setActive] = useState(bill.active ?? true);
  const [status, setStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    const minVal = parseFloat(amountMin);
    const maxVal = parseFloat(amountMax);

    if (isNaN(minVal) || minVal <= 0) {
      setStatus({ success: false, message: "Minimum amount must be greater than 0" });
      return;
    }
    if (isNaN(maxVal) || maxVal < minVal) {
      setStatus({ success: false, message: "Maximum amount must be ≥ minimum amount" });
      return;
    }
    if (!name.trim()) {
      setStatus({ success: false, message: "Name is required" });
      return;
    }

    startTransition(async () => {
      const res = await updateBillAction(bill.id, {
        name: name.trim(),
        amountMin: minVal,
        amountMax: maxVal,
        repeatFreq,
        active,
        date: date || undefined,
      });
      if (res.success) {
        setStatus({ success: true, message: "Subscription updated successfully!" });
        setTimeout(() => router.push("/settings/subscriptions"), 1200);
      } else {
        setStatus({ success: false, message: res.error || "Failed to update subscription" });
      }
    });
  };

  const minVal = parseFloat(amountMin);
  const maxVal = parseFloat(amountMax);
  const avgAmount = isNaN(minVal) || isNaN(maxVal) ? 0 : (minVal + maxVal) / 2;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        backHref="/settings/subscriptions"
        subtitle="Edit name, amount and billing frequency"
        title={bill.name}
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Details */}
        <div className="glass-card p-4 flex flex-col gap-4">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Details</h3>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="sub-name" className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
              Name
            </label>
            <input
              id="sub-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
              required
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700 disabled:opacity-50"
              placeholder="e.g. Netflix"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Frequency</label>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {FREQ_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRepeatFreq(opt.value)}
                  disabled={isPending}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all active:scale-[0.98] ${
                    repeatFreq === opt.value
                      ? "bg-zinc-100 text-zinc-900 border-zinc-100"
                      : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="sub-date" className="text-xs font-bold text-zinc-400 uppercase tracking-wide flex items-center gap-1.5">
              <CalendarDays size={11} />
              Start Date
            </label>
            <p className="text-[11px] text-zinc-500 -mt-0.5">
              Anchor date used to calculate upcoming due dates. Set this to the day your first payment was (or will be) taken.
            </p>
            <input
              id="sub-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={isPending}
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700 disabled:opacity-50"
            />
          </div>
        </div>

        {/* Amount */}
        <div className="glass-card p-4 flex flex-col gap-4">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Expected Amount</h3>
          <p className="text-xs text-zinc-500 -mt-2">
            Set a range if the amount varies.{" "}
            {avgAmount > 0 && <span>Currently averaging {fmt(avgAmount)}.</span>}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="sub-min" className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Min ({symbol})</label>
              <input
                id="sub-min"
                type="number"
                step="0.01"
                min="0.01"
                value={amountMin}
                onChange={(e) => setAmountMin(e.target.value)}
                disabled={isPending}
                required
                className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700 disabled:opacity-50"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="sub-max" className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Max ({symbol})</label>
              <input
                id="sub-max"
                type="number"
                step="0.01"
                min="0.01"
                value={amountMax}
                onChange={(e) => setAmountMax(e.target.value)}
                disabled={isPending}
                required
                className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700 disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Linked Automation Rules */}
        {linkedRules.length > 0 && (
          <div className="glass-card p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Sparkles size={13} className="text-violet-400" />
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Linked Automation Rules</h3>
            </div>
            <p className="text-[11px] text-zinc-500 -mt-1">
              These rules automatically tag transactions for this subscription.
            </p>
            <div className="flex flex-col gap-2">
              {linkedRules.map((rule) => (
                <Link
                  key={rule.id}
                  href={`/settings/rules/${rule.id}`}
                  className="flex items-center justify-between gap-3 bg-zinc-900/60 border border-zinc-800/60 rounded-xl px-3 py-2.5 hover:border-zinc-700/60 hover:bg-zinc-900/80 transition-all group"
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm font-semibold text-zinc-100 truncate">{rule.title}</span>
                    {rule.ruleGroupTitle && (
                      <span className="text-[10px] text-zinc-500 font-medium">{rule.ruleGroupTitle}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`w-1.5 h-1.5 rounded-full ${rule.active ? "bg-emerald-500" : "bg-zinc-600"}`} />
                    <ChevronRight size={13} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Active toggle */}
        <div className="glass-card p-4 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">Active</h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              {active ? "Subscription is active and tracked" : "Subscription is paused and hidden from overview"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActive(!active)}
            disabled={isPending}
            className="flex-shrink-0 transition-colors"
            aria-label="Toggle active"
          >
            {active
              ? <ToggleRight size={36} className="text-emerald-400" />
              : <ToggleLeft size={36} className="text-zinc-600" />
            }
          </button>
        </div>

        {/* Save */}
        <div className="flex justify-end gap-2 mt-2">
          <button
            type="submit"
            disabled={isPending}
            className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200 active:scale-[0.98] transition-all px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
          >
            {isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>Save Changes</span>
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
    </div>
  );
}
