"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { Search, SlidersHorizontal, ArrowUpDown, ChevronDown, RefreshCw, X, Clock, Check } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { TransactionList } from "@/components/TransactionList";
import { BottomSheetDrawer } from "@/components/ui/BottomSheetDrawer";
import { RichTransaction } from "@/lib/api/transactions";
import { useCurrency } from "@/components/CurrencyContext";
import { useRouter, useSearchParams } from "next/navigation";

const PERIOD_OPTIONS = [
  { label: "3 months", days: 90 },
  { label: "6 months", days: 180 },
  { label: "1 year", days: 365 },
];

interface AllTransactionsViewProps {
  initialTransactions: RichTransaction[];
  categories: string[];
  accountNames: string[];
  currentDays: number;
  initialAccount?: string;
}

type SortField = "date" | "amount" | "name";
type SortOrder = "asc" | "desc";

export function AllTransactionsView({ 
  initialTransactions, 
  categories, 
  accountNames, 
  currentDays,
  initialAccount
}: AllTransactionsViewProps) {
  const { symbol, fmt } = useCurrency();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedAccount, setSelectedAccount] = useState<string>(initialAccount || "All");
  const [selectedType, setSelectedType] = useState<"all" | "withdrawal" | "deposit" | "transfer">("all");
  const [amountRange, setAmountRange] = useState<"all" | "<10" | "10-50" | "50-100" | ">100">("all");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(!!initialAccount);
  const [isAccountSheetOpen, setIsAccountSheetOpen] = useState(false);
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);

  // Sorting State
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Pagination State
  const [visibleCount, setVisibleCount] = useState(50);


  // Derived filter reset check
  const hasActiveFilters = useMemo(() => {
    return (
      selectedCategory !== "All" ||
      selectedAccount !== "All" ||
      selectedType !== "all" ||
      amountRange !== "all" ||
      minAmount !== "" ||
      maxAmount !== ""
    );
  }, [selectedCategory, selectedAccount, selectedType, amountRange, minAmount, maxAmount]);

  const handleResetFilters = () => {
    setSelectedCategory("All");
    setSelectedAccount("All");
    setSelectedType("all");
    setAmountRange("all");
    setMinAmount("");
    setMaxAmount("");
  };

  // Filter & Sort Logic
  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...initialTransactions];

    // 1. Search Query Filter (name or category)
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (tx) =>
          tx.name.toLowerCase().includes(q) ||
          tx.category.toLowerCase().includes(q)
      );
    }

    // 2. Category Filter
    if (selectedCategory !== "All") {
      result = result.filter((tx) => tx.category === selectedCategory);
    }

    // 3. Account Filter (either source or destination matches)
    if (selectedAccount !== "All") {
      result = result.filter(
        (tx) =>
          tx.sourceAccount === selectedAccount ||
          tx.destinationAccount === selectedAccount
      );
    }

    // 4. Transaction Type Filter
    if (selectedType !== "all") {
      result = result.filter((tx) => tx.type === selectedType);
    }

    // 5. Amount Filter (Pills or Manual Inputs)
    const activeMin = minAmount !== "" ? parseFloat(minAmount) : null;
    const activeMax = maxAmount !== "" ? parseFloat(maxAmount) : null;

    result = result.filter((tx) => {
      const absAmount = Math.abs(tx.amount);
      
      // If manual min/max is provided, override the pills
      if (activeMin !== null && absAmount < activeMin) return false;
      if (activeMax !== null && absAmount > activeMax) return false;

      // Otherwise, filter by pill if active and no manual input overrides it
      if (activeMin === null && activeMax === null && amountRange !== "all") {
        if (amountRange === "<10" && absAmount >= 10) return false;
        if (amountRange === "10-50" && (absAmount < 10 || absAmount > 50)) return false;
        if (amountRange === "50-100" && (absAmount < 50 || absAmount > 100)) return false;
        if (amountRange === ">100" && absAmount <= 100) return false;
      }

      return true;
    });

    // 6. Sorting
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === "date") {
        comparison = new Date(a.rawDate || a.date).getTime() - new Date(b.rawDate || b.date).getTime();
      } else if (sortField === "amount") {
        comparison = a.amount - b.amount;
      } else if (sortField === "name") {
        comparison = a.name.localeCompare(b.name);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [initialTransactions, searchQuery, selectedCategory, selectedAccount, selectedType, amountRange, minAmount, maxAmount, sortField, sortOrder]);

  useEffect(() => {
    if (searchParams.get("search") === "true") {
      setTimeout(() => {
        searchInputRef.current?.focus();
        const url = new URL(window.location.href);
        url.searchParams.delete("search");
        window.history.replaceState({}, "", url.toString());
      }, 100);
    }
  }, [searchParams]);

  // Reset pagination when filter criteria change
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) setVisibleCount(50);
    });
    return () => {
      active = false;
    };
  }, [searchQuery, selectedCategory, selectedAccount, selectedType, amountRange, minAmount, maxAmount, sortField, sortOrder]);

  const displayedTransactions = useMemo(() => {
    return filteredAndSortedTransactions.slice(0, visibleCount);
  }, [filteredAndSortedTransactions, visibleCount]);

  const loadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 50, filteredAndSortedTransactions.length));
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("desc"); // Default to desc when switching fields
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        backHref="/"
        subtitle="Ledger"
        title="All Transactions"
        rightSection={
          hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20 active:scale-95"
            >
              <X size={12} />
              Reset
            </button>
          )
        }
      />

      {/* Sticky Search & Filter Bar */}
      <div className="flex gap-2 items-center px-1">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-2xl py-2.5 pl-10 pr-4 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-700/60 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-100"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-all active:scale-95 relative ${
            isFilterOpen || hasActiveFilters
              ? "bg-white/10 border-zinc-500 text-white"
              : "bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-100"
          }`}
          aria-label="Toggle filters"
        >
          <SlidersHorizontal size={16} />
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-500 rounded-full border-2 border-background animate-pulse" />
          )}
        </button>
      </div>

      {/* Expandable Filter Drawer */}
      {isFilterOpen && (
        <div className="glass-card p-4 mx-1 flex flex-col gap-4 border border-zinc-800/80 animate-drawer-slide">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Filters</span>
            <button onClick={() => setIsFilterOpen(false)} className="text-zinc-400 hover:text-zinc-100">
              <X size={16} />
            </button>
          </div>

          {/* Type Toggles */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Transaction Type</span>
            <div className="grid grid-cols-4 gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800/40">
              {(["all", "withdrawal", "deposit", "transfer"] as const).map((t) => {
                const isActive = selectedType === t;
                const activeClasses = 
                  t === "all" ? "bg-zinc-800 text-white font-medium" :
                  t === "withdrawal" ? "bg-rose-500/20 text-rose-400 border border-rose-500/30 font-medium" :
                  t === "deposit" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium" :
                  "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-medium";
                return (
                  <button
                    key={t}
                    onClick={() => setSelectedType(t)}
                    className={`py-1.5 rounded-lg text-xs capitalize transition-all active:scale-95 ${
                      isActive ? activeClasses : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {t === "withdrawal" ? "Out" : t === "deposit" ? "In" : t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Account & Category Filter Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Account</label>
              <button
                onClick={() => setIsAccountSheetOpen(true)}
                className={`w-full flex items-center justify-between gap-2 bg-zinc-950/80 border rounded-xl px-2.5 py-2 text-xs transition-all active:scale-95 ${
                  selectedAccount !== "All"
                    ? "border-cyan-500/40 text-cyan-400"
                    : "border-zinc-800/80 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <span className="truncate font-medium">
                  {selectedAccount === "All" ? "All Accounts" : selectedAccount}
                </span>
                <ChevronDown size={14} className="flex-shrink-0 text-zinc-500" />
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Category</label>
              <button
                onClick={() => setIsCategorySheetOpen(true)}
                className={`w-full flex items-center justify-between gap-2 bg-zinc-950/80 border rounded-xl px-2.5 py-2 text-xs transition-all active:scale-95 ${
                  selectedCategory !== "All"
                    ? "border-cyan-500/40 text-cyan-400"
                    : "border-zinc-800/80 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <span className="truncate font-medium">
                  {selectedCategory === "All" ? "All Categories" : selectedCategory}
                </span>
                <ChevronDown size={14} className="flex-shrink-0 text-zinc-500" />
              </button>
            </div>
          </div>

          {/* Amount Filters */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Amount Range</span>
            
            {/* Range Pills */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: "Any Amount", value: "all" as const },
                { label: `< ${symbol}10`, value: "<10" as const },
                { label: `${symbol}10 - ${symbol}50`, value: "10-50" as const },
                { label: `${symbol}50 - ${symbol}100`, value: "50-100" as const },
                { label: `${symbol}100+`, value: ">100" as const },
              ].map((pill) => {
                const isActive = amountRange === pill.value && minAmount === "" && maxAmount === "";
                return (
                  <button
                    key={pill.value}
                    onClick={() => {
                      setAmountRange(pill.value);
                      setMinAmount("");
                      setMaxAmount("");
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-all active:scale-95 ${
                      isActive
                        ? "bg-white/10 border-zinc-500 text-white font-medium"
                        : "bg-zinc-950/40 border-zinc-800/50 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>

            {/* Custom Amount Inputs */}
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-500">Min ({symbol})</span>
                <input
                  type="number"
                  placeholder="0"
                  value={minAmount}
                  onChange={(e) => {
                    setMinAmount(e.target.value);
                    setAmountRange("all");
                  }}
                  className="w-full bg-zinc-950/80 border border-zinc-800/85 rounded-xl py-1.5 pl-14 pr-2.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700/60"
                />
              </div>
              <span className="text-zinc-500 text-xs">to</span>
              <div className="flex-1 relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-500">Max ({symbol})</span>
                <input
                  type="number"
                  placeholder="No limit"
                  value={maxAmount}
                  onChange={(e) => {
                    setMaxAmount(e.target.value);
                    setAmountRange("all");
                  }}
                  className="w-full bg-zinc-950/80 border border-zinc-800/85 rounded-xl py-1.5 pl-14 pr-2.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700/60"
                />
              </div>
            </div>
          </div>

          {/* History Window */}
          <div className="flex flex-col gap-2 border-t border-white/5 pt-3">
            <div className="flex items-center gap-1.5">
              <Clock size={12} className="text-zinc-500" />
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">History Window</span>
            </div>
            <div className="flex gap-1.5">
              {PERIOD_OPTIONS.map((opt) => {
                const isActive = currentDays === opt.days;
                return (
                  <button
                    key={opt.days}
                    onClick={() => router.push(`/transactions?days=${opt.days}`)}
                    className={`flex-1 py-2 rounded-xl text-xs border font-medium transition-all active:scale-95 ${
                      isActive
                        ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-400"
                        : "bg-zinc-950/40 border-zinc-800/50 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700/60"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sorting Control Header */}
      <div className="flex justify-between items-center px-2 text-xs text-zinc-400 font-semibold border-b border-white/5 pb-2">
        <div className="flex gap-2">
          <button
            onClick={() => toggleSort("date")}
            className={`flex items-center gap-1 py-1 px-2 rounded-lg hover:text-zinc-200 hover:bg-zinc-800/30 transition-colors ${
              sortField === "date" ? "text-cyan-400 font-bold" : ""
            }`}
          >
            <span>Date</span>
            <ArrowUpDown size={12} />
          </button>
          
          <button
            onClick={() => toggleSort("amount")}
            className={`flex items-center gap-1 py-1 px-2 rounded-lg hover:text-zinc-200 hover:bg-zinc-800/30 transition-colors ${
              sortField === "amount" ? "text-cyan-400 font-bold" : ""
            }`}
          >
            <span>Amount</span>
            <ArrowUpDown size={12} />
          </button>

          <button
            onClick={() => toggleSort("name")}
            className={`flex items-center gap-1 py-1 px-2 rounded-lg hover:text-zinc-200 hover:bg-zinc-800/30 transition-colors ${
              sortField === "name" ? "text-cyan-400 font-bold" : ""
            }`}
          >
            <span>Description</span>
            <ArrowUpDown size={12} />
          </button>
        </div>

        <div className="text-[11px] bg-zinc-900/60 border border-zinc-800/80 px-2 py-0.5 rounded-md text-zinc-500 font-medium">
          {filteredAndSortedTransactions.length} found
        </div>
      </div>

      {/* Transaction List Render */}
      {displayedTransactions.length > 0 ? (
        <div className="flex flex-col gap-4">
          <TransactionList
            transactions={displayedTransactions}
            categories={categories}
            className="flex flex-col gap-2"
          />

          {filteredAndSortedTransactions.length > visibleCount && (
            <button
              onClick={loadMore}
              className="glass-card hover:bg-zinc-800/30 active:scale-[0.99] transition-all py-3 px-4 flex items-center justify-center gap-2 border border-white/5 cursor-pointer text-sm font-semibold text-cyan-400 mx-auto w-full max-w-[200px]"
            >
              <RefreshCw size={14} className="animate-spin-slow" />
              <span>Load More</span>
            </button>
          )}
        </div>
      ) : (
        <div className="text-center py-16 text-zinc-500 text-sm glass-card border border-white/5 mx-1 flex flex-col gap-2 items-center justify-center">
          <p className="font-semibold text-zinc-400">No transactions match your filters</p>
          <button
            onClick={handleResetFilters}
            className="text-xs text-cyan-400 hover:text-cyan-300 underline font-medium mt-1"
          >
            Reset Filters
          </button>
        </div>
      )}
      {/* Account Bottom Sheet */}
      <BottomSheetDrawer
        isOpen={isAccountSheetOpen}
        onClose={() => setIsAccountSheetOpen(false)}
        title="Filter by Account"
        headerAction={
          selectedAccount !== "All" && (
            <button
              onClick={() => { setSelectedAccount("All"); setIsAccountSheetOpen(false); }}
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20 active:scale-95"
            >
              <X size={12} />
              Clear
            </button>
          )
        }
      >
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-2">
          {["All", ...accountNames].map((acc) => {
            const isSelected = selectedAccount === acc;
            return (
              <button
                key={acc}
                onClick={() => { setSelectedAccount(acc); setIsAccountSheetOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl mb-1.5 text-sm font-medium transition-all active:scale-[0.98] ${
                  isSelected
                    ? "bg-cyan-500/15 border border-cyan-500/30 text-cyan-400"
                    : "bg-zinc-900/50 border border-zinc-800/50 text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-100"
                }`}
              >
                <span>{acc === "All" ? "All Accounts" : acc}</span>
                {isSelected && <Check size={16} className="text-cyan-400 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </BottomSheetDrawer>

      {/* Category Bottom Sheet */}
      <BottomSheetDrawer
        isOpen={isCategorySheetOpen}
        onClose={() => setIsCategorySheetOpen(false)}
        title="Filter by Category"
        headerAction={
          selectedCategory !== "All" && (
            <button
              onClick={() => { setSelectedCategory("All"); setIsCategorySheetOpen(false); }}
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20 active:scale-95"
            >
              <X size={12} />
              Clear
            </button>
          )
        }
      >
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-2">
          {["All", ...categories].map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setIsCategorySheetOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl mb-1.5 text-sm font-medium transition-all active:scale-[0.98] ${
                  isSelected
                    ? "bg-cyan-500/15 border border-cyan-500/30 text-cyan-400"
                    : "bg-zinc-900/50 border border-zinc-800/50 text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-100"
                }`}
              >
                <span>{cat === "All" ? "All Categories" : cat}</span>
                {isSelected && <Check size={16} className="text-cyan-400 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </BottomSheetDrawer>
    </div>
  );
}
