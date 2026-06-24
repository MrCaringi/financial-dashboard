"use client";

import { useState, useEffect } from "react";
import { X, Calendar, DollarSign, Loader2, Sparkles } from "lucide-react";
import { createSubscriptionRule } from "@/app/actions/automations";
import { cleanTransactionDescription } from "@/lib/utils/string";

interface CreateSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionName: string;
  transactionAmount: number;
  onSuccess?: () => void;
}

export function CreateSubscriptionModal({
  isOpen,
  onClose,
  transactionName,
  transactionAmount,
  onSuccess,
}: CreateSubscriptionModalProps) {
  const [billName, setBillName] = useState("");
  const [amount, setAmount] = useState(0);
  const [frequency, setFrequency] = useState("monthly");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize values when modal opens
  useEffect(() => {
    if (isOpen) {
      const cleaned = cleanTransactionDescription(transactionName);
      setBillName(cleaned);
      setAmount(Math.abs(transactionAmount));
      setError(null);
    }
  }, [isOpen, transactionName, transactionAmount]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!billName.trim()) {
      setError("Subscription name is required");
      return;
    }
    if (amount <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await createSubscriptionRule(
        transactionName,
        billName.trim(),
        amount,
        frequency
      );

      if (!res.success) {
        throw new Error(res.error || "Failed to create subscription and rule");
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-md bg-zinc-950/90 border border-zinc-800/80 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden animate-zoom-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/50">
          <div className="flex items-center gap-2 text-indigo-400">
            <Sparkles size={16} />
            <h3 className="text-base font-semibold text-zinc-100">Create Subscription</h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-zinc-400 hover:text-zinc-200 transition-colors rounded-lg p-1 hover:bg-zinc-900"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 text-sm">
          {error && (
            <div className="p-3 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg">
              {error}
            </div>
          )}

          {/* Subscription Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Subscription (Bill) Name
            </label>
            <input
              type="text"
              value={billName}
              onChange={(e) => setBillName(e.target.value)}
              placeholder="e.g. Netflix, Spotify"
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 outline-none focus:border-indigo-500 transition-colors"
              disabled={saving}
              required
            />
          </div>

          {/* Amount */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Expected Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-zinc-500">
                <DollarSign size={14} />
              </span>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 outline-none focus:border-indigo-500 transition-colors"
                disabled={saving}
                required
              />
            </div>
          </div>

          {/* Frequency */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Billing Frequency
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-zinc-500">
                <Calendar size={14} />
              </span>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer"
                disabled={saving}
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="half-year">Half Year</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          {/* Footer Information */}
          <p className="text-xs text-zinc-500 mt-1">
            This will create a new inactive bill in Firefly III and create a rule matching similar future transactions to link them to this bill automatically.
          </p>

          {/* Submit/Cancel Buttons */}
          <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-zinc-800/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-zinc-400 hover:text-zinc-200 transition-colors rounded-lg"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-zinc-100 hover:bg-indigo-500 font-medium rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
              disabled={saving}
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
