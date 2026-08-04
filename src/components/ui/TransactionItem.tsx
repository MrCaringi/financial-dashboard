"use client";

import React from "react";
import { useCurrency } from "../CurrencyContext";
import { Tag, ChevronDown, Sparkles, RefreshCw, Loader2, ReceiptText, Check } from "lucide-react";
import { CategoryCombobox } from "../CategoryCombobox";
import { getCategoryStyle } from "@/lib/category-icons";
import { useEditTransaction } from "../EditTransactionContext";

export interface Transaction {
  id: string;
  journalId: string;
  name: string;
  category: string;
  amount: number;
  date: string;
}

interface TransactionItemProps {
  transaction: Transaction;
  categories: string[];
  isEditing: boolean;
  onToggleExpand: () => void;
  onMarkAsSubscription: (tx: Transaction) => void;
  onConvertToCCTransfer: (tx: Transaction) => void;
  isConverting: boolean;
  onUpdateCategory: (transactionId: string, newCategory: string) => void;
  onCloseCategoryPicker: () => void;
  isSucceeded?: boolean;
  isRemoved?: boolean;
  isUncategorizedView?: boolean;
  closeOnSelect?: boolean;
}

export const TransactionItem = React.memo(function TransactionItem({
  transaction,
  categories,
  isEditing,
  onToggleExpand,
  onMarkAsSubscription,
  onConvertToCCTransfer,
  isConverting,
  onUpdateCategory,
  onCloseCategoryPicker,
  isSucceeded = false,
  isRemoved = false,
  isUncategorizedView = false,
  closeOnSelect = true,
}: TransactionItemProps) {
  const { fmt } = useCurrency();
  const style = getCategoryStyle(transaction.category);
  const IconComponent = style.icon;
  const { openEditTransaction } = useEditTransaction();

  // Decide classes for the container (animations, etc.)
  const containerClasses = React.useMemo(() => {
    let classes = "glass-card overflow-hidden transition-all duration-300 transform ";
    if (isRemoved) {
      classes += "opacity-0 max-h-0 scale-95 py-0 border-y-0 my-0 translate-x-4 pointer-events-none";
    } else if (isSucceeded) {
      classes += "animate-success-flash scale-100 opacity-100 border-emerald-500/50";
    } else {
      classes += "max-h-[500px] opacity-100 scale-100 flex-shrink-0";
    }
    return classes;
  }, [isRemoved, isSucceeded]);

  // Handle header click
  const handleHeaderClick = () => {
    if (!isSucceeded) {
      onToggleExpand();
    }
  };

  // Handle amount click (intercept and open edit drawer)
  const handleAmountClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isSucceeded) {
      openEditTransaction(transaction.id, {
        name: transaction.name,
        amount: transaction.amount,
        date: transaction.date,
        category: transaction.category
      });
    }
  };

  return (
    <div className={containerClasses}>
      <button
        type="button"
        className={`w-full text-left cursor-pointer hover:bg-zinc-900/20 active:bg-zinc-900/30 transition-colors disabled:pointer-events-none ${
          isUncategorizedView ? "py-3.5 px-4" : "py-2.5 px-3"
        }`}
        onClick={handleHeaderClick}
        disabled={isSucceeded}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            {isUncategorizedView ? (
              <div
                className={`w-9 h-9 rounded-full border flex-shrink-0 flex items-center justify-center transition-colors duration-300 ${
                  isSucceeded
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-zinc-900 border-zinc-800/80 text-zinc-400"
                }`}
              >
                {isSucceeded ? <Check size={16} /> : <ReceiptText size={16} />}
              </div>
            ) : (
              <div
                className={`w-8 h-8 rounded-full border flex-shrink-0 flex items-center justify-center transition-all ${style.bgClass} ${style.borderClass}`}
              >
                <IconComponent size={14} className={style.colorClass} />
              </div>
            )}

            <div className="min-w-0">
              <p className="font-semibold text-[15px] line-clamp-1 text-zinc-100">{transaction.name}</p>
              {isUncategorizedView ? (
                <div
                  className={`
                    mt-1 inline-flex items-center gap-1 text-xs rounded-full px-2.5 py-0.5
                    transition-all duration-150 border
                    ${
                      isEditing
                        ? "bg-white/10 text-zinc-50 border-zinc-400"
                        : isSucceeded
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }
                  `}
                >
                  <Tag size={10} />
                  <span>
                    {isEditing ? "Selecting..." : isSucceeded ? "Categorized" : "Uncategorized"}
                  </span>
                  {!isSucceeded && (
                    <ChevronDown
                      size={10}
                      className={`transition-transform ${isEditing ? "rotate-180" : ""}`}
                    />
                  )}
                </div>
              ) : (
                <div
                  className={`
                    mt-1 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold rounded-full px-2.5 py-0.5
                    transition-all duration-150 border
                    ${
                      isEditing
                        ? "bg-white/10 text-zinc-50 border-zinc-400"
                        : `${style.bgClass} ${style.colorClass} ${style.borderClass}`
                    }
                  `}
                >
                  <IconComponent size={9} />
                  <span>{transaction.category}</span>
                  <ChevronDown
                    size={10}
                    className={`transition-transform ${isEditing ? "rotate-180" : ""}`}
                  />
                </div>
              )}
            </div>
          </div>

          <div 
            onClick={handleAmountClick}
            className="text-right flex-shrink-0 ml-2 cursor-pointer hover:bg-zinc-800/40 p-1.5 rounded-lg active:scale-95 transition-all select-none"
          >
            <span
              className={`font-bold text-base ${
                transaction.amount > 0 ? "text-emerald-500" : isUncategorizedView ? "text-zinc-100" : ""
              }`}
            >
              {transaction.amount > 0 ? "+" : ""}
              {fmt(transaction.amount)}
            </span>
            <p className="text-xs text-muted-foreground mt-0.5">{transaction.date}</p>
          </div>
        </div>
      </button>

      {/* Quick Actions & Inline CategoryCombobox */}
      {isEditing && !isSucceeded && (
        <div className="px-3 pb-3 border-t border-zinc-900/40 pt-3">
          <div className="flex items-center gap-2 mb-3">
            <button
              type="button"
              onClick={() => onMarkAsSubscription(transaction)}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 font-medium transition-all"
            >
              <Sparkles size={12} />
              Mark as Subscription
            </button>
            <button
              type="button"
              onClick={() => onConvertToCCTransfer(transaction)}
              disabled={isConverting}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 font-medium transition-all disabled:opacity-50"
            >
              {isConverting ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <RefreshCw size={12} />
              )}
              Convert to CC Transfer
            </button>
          </div>

          <CategoryCombobox
            transactionId={transaction.id}
            journalId={transaction.journalId}
            currentCategory={transaction.category}
            categories={categories}
            onUpdate={(newCat) => onUpdateCategory(transaction.id, newCat)}
            onClose={onCloseCategoryPicker}
            showCurrentIcon={!isUncategorizedView}
            initialQuery={isUncategorizedView ? "" : transaction.category}
            selectOnFocus={!isUncategorizedView}
            closeOnSelect={closeOnSelect}
            transactionName={transaction.name}
            transactionAmount={transaction.amount}
          />
        </div>
      )}
    </div>
  );
});
