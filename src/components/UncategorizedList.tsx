"use client";

import { useState, useCallback } from "react";
import { CheckCircle2, ArrowLeft, Inbox } from "lucide-react";
import Link from "next/link";
import { Confetti } from "@/components/ui/Confetti";
import { TransactionItem } from "./ui/TransactionItem";
import { CreateSubscriptionModal } from "./CreateSubscriptionModal";
import { createCreditCardTransferRule } from "@/app/actions/automations";
import { GlassDialog } from "./ui/GlassDialog";

interface Transaction {
  id: string;
  journalId: string;
  name: string;
  category: string;
  amount: number;
  date: string;
}

interface UncategorizedListProps {
  transactions: Transaction[];
  categories: string[];
}

export function UncategorizedList({ transactions, categories }: UncategorizedListProps) {
  const [txList, setTxList] = useState<Transaction[]>(transactions);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [succeededIds, setSucceededIds] = useState<Set<string>>(new Set());
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [initialCount] = useState(transactions.length);
  const [subModalTx, setSubModalTx] = useState<Transaction | null>(null);
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    type: "success" | "error" | "info" | "warning";
    title: string;
    message: string;
  } | null>(null);

  const handleUpdate = useCallback((transactionId: string, _newCategory: string) => {
    setEditingId(null);

    // 1. Mark as succeeded to trigger micro-feedback (glow, checkmark icon)
    setSucceededIds((prev) => {
      const next = new Set(prev);
      next.add(transactionId);
      return next;
    });

    // 2. Mark as removed to trigger slide-out animation (after 400ms success glow)
    setTimeout(() => {
      setRemovedIds((prev) => {
        const next = new Set(prev);
        next.add(transactionId);
        return next;
      });
    }, 400);

    // 3. Actually remove from state after slide-out animation completes (400ms + 300ms = 700ms)
    setTimeout(() => {
      setTxList((prev) => prev.filter((tx) => tx.id !== transactionId));
    }, 700);
  }, []);

  async function handleCCTransfer(tx: Transaction) {
    setConvertingId(tx.id);
    try {
      const res = await createCreditCardTransferRule(tx.name, tx.category);
      if (!res.success) {
        setDialog({
          isOpen: true,
          type: "error",
          title: "Rule Creation Failed",
          message: res.error || "Failed to create CC Transfer rule",
        });
      } else {
        setDialog({
          isOpen: true,
          type: "success",
          title: "Rule Created",
          message: "Transactions like this will now convert to transfer under 'Credit Card Clearing'!",
        });
        handleUpdate(tx.id, tx.category); // also trigger the categorized animation flow
      }
    } catch (e: any) {
      setDialog({
        isOpen: true,
        type: "error",
        title: "Error",
        message: e.message || "An unexpected error occurred",
      });
    } finally {
      setConvertingId(null);
    }
  }

  const handleClose = useCallback(() => setEditingId(null), []);

  // Compute stats based on immediate success state (for instant UI response)
  const activeTxList = txList.filter((tx) => !succeededIds.has(tx.id));
  const remainingCount = activeTxList.length;
  const done = initialCount - remainingCount;
  const progress = initialCount > 0 ? done / initialCount : 0;

  // Determine encouragement messages
  let milestoneMessage = "";
  if (remainingCount > 0 && initialCount > 0) {
    const percent = (done / initialCount) * 100;
    if (remainingCount === 1) {
      milestoneMessage = "Last one — finish it off!";
    } else if (percent >= 75) {
      milestoneMessage = "Almost done!";
    } else if (percent >= 50) {
      milestoneMessage = "Halfway there 🔥";
    } else if (percent >= 25) {
      milestoneMessage = "Nice start!";
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Celebration Effect */}
      {remainingCount === 0 && initialCount > 0 && <Confetti />}

      {/* Header */}
      <header className="flex items-center gap-3 px-2">
        <Link
          href="/"
          className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800/80 flex items-center justify-center text-zinc-300 hover:text-zinc-100 transition-transform active:scale-95"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1 min-w-0">
          <h2 className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">Action Needed</h2>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            Uncategorized
            {remainingCount > 0 && (
              <span
                key={remainingCount}
                className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-medium inline-block animate-count-bounce"
              >
                {remainingCount}
              </span>
            )}
          </h1>
        </div>
      </header>

      {/* Progress Tracker */}
      {initialCount > 0 && remainingCount > 0 && (
        <div className="px-2 flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs text-zinc-400 font-semibold">
            <span>
              {done} of {initialCount} categorized
            </span>
            <span className="text-emerald-400 transition-all duration-300">
              {milestoneMessage}
            </span>
          </div>
          {/* Progress bar container */}
          <div
            role="progressbar"
            aria-valuenow={done}
            aria-valuemin={0}
            aria-valuemax={initialCount}
            className="w-full h-1.5 bg-zinc-800/50 rounded-full overflow-hidden border border-zinc-800/20"
          >
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progress * 100}%`,
                background: `linear-gradient(90deg, #f59e0b 0%, ${progress >= 0.5 ? "#10b981" : "#f59e0b"} 100%)`,
              }}
            />
          </div>
        </div>
      )}

      {/* Intro info box */}
      {remainingCount > 0 && (
        <section className="glass-card p-4 flex gap-3 items-start border-l-4 border-l-amber-500 transition-all duration-300">
          <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
            <Inbox size={16} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-100">Review Recent Imports</h4>
            <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
              These transactions imported in the last 30 days do not have categories assigned in Firefly III. Assign them below to keep your budget tracking accurate.
            </p>
          </div>
        </section>
      )}

      {/* Main List & Zero State */}
      {remainingCount > 0 ? (
        <div className="flex flex-col gap-3">
          {txList.map((tx) => (
            <TransactionItem
              key={tx.id}
              transaction={tx}
              categories={categories}
              isEditing={editingId === tx.id}
              onToggleExpand={() => setEditingId(editingId === tx.id ? null : tx.id)}
              onMarkAsSubscription={setSubModalTx}
              onConvertToCCTransfer={handleCCTransfer}
              isConverting={convertingId === tx.id}
              onUpdateCategory={handleUpdate}
              onCloseCategoryPicker={handleClose}
              isSucceeded={succeededIds.has(tx.id)}
              isRemoved={removedIds.has(tx.id)}
              isUncategorizedView={true}
              closeOnSelect={false}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 text-center glass-card min-h-[300px] animate-celebrate-in">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mb-4 text-emerald-400">
            <CheckCircle2 size={32} />
          </div>
          <h3 className="text-lg font-semibold text-zinc-100 mb-1">All Caught Up!</h3>
          <p className="text-sm text-zinc-400 max-w-xs mb-4">
            All transactions from the last 30 days have been successfully categorized.
          </p>
          {initialCount > 0 && (
            <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
              You categorized {initialCount} transaction{initialCount > 1 ? "s" : ""} this session
            </div>
          )}
        </div>
      )}

      <CreateSubscriptionModal
        isOpen={subModalTx !== null}
        onClose={() => setSubModalTx(null)}
        transactionName={subModalTx?.name || ""}
        transactionAmount={subModalTx?.amount || 0}
        onSuccess={() => handleUpdate(subModalTx!.id, subModalTx!.category)}
      />

      {dialog && (
        <GlassDialog
          isOpen={dialog.isOpen}
          onClose={() => setDialog(null)}
          title={dialog.title}
          message={dialog.message}
          type={dialog.type}
        />
      )}
    </div>
  );
}
