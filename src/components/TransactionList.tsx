"use client";

import { useState, useCallback, useEffect } from "react";
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

interface TransactionListProps {
  transactions: Transaction[];
  categories: string[];
  className?: string;
}

export function TransactionList({ transactions, categories, className }: TransactionListProps) {
  const [txList, setTxList] = useState(transactions);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [subModalTx, setSubModalTx] = useState<Transaction | null>(null);
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    type: "success" | "error" | "info" | "warning";
    title: string;
    message: string;
  } | null>(null);

  // Sync internal list when the prop changes (e.g. parent applies filters)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTxList(transactions);
    setEditingId(null);
  }, [transactions]);

  const handleUpdate = useCallback((transactionId: string, newCategory: string) => {
    setTxList((prev) =>
      prev.map((tx) => (tx.id === transactionId ? { ...tx, category: newCategory } : tx))
    );
  }, []);

  const handleClose = useCallback(() => setEditingId(null), []);

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
        setEditingId(null);
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

  return (
    <div className={className || "max-h-[330px] overflow-y-auto pr-1 flex flex-col gap-2"}>
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
        />
      ))}

      <CreateSubscriptionModal
        isOpen={subModalTx !== null}
        onClose={() => setSubModalTx(null)}
        transactionName={subModalTx?.name || ""}
        transactionAmount={subModalTx?.amount || 0}
        onSuccess={() => setEditingId(null)}
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
