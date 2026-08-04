"use client";

import { useState, useMemo } from "react";
import { Search, ChevronDown, Plus, Calendar, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Bill } from "@/lib/api/bills";
import { getCategoryStyle } from "@/lib/category-icons";
import { PageHeader } from "@/components/PageHeader";
import { fmt } from "@/lib/format";
import { useCurrency } from "@/components/CurrencyContext";
import { createBillAction } from "@/app/settings/actions";

interface SubscriptionsListClientProps {
  initialBills: Bill[];
}

export function SubscriptionsListClient({ initialBills }: SubscriptionsListClientProps) {
  const { symbol, fmt } = useCurrency();
  const [bills, setBills] = useState<Bill[]>(initialBills);
  const [search, setSearch] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  
  // Creation state
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [repeatFreq, setRepeatFreq] = useState("monthly");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Filter bills by search query
  const filteredBills = useMemo(() => {
    return bills.filter(bill => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        bill.name.toLowerCase().includes(q) ||
        (bill.repeatFreq && bill.repeatFreq.toLowerCase().includes(q))
      );
    });
  }, [bills, search]);

  // Group bills by active/inactive status
  const groupedBills = useMemo(() => {
    const activeList = filteredBills.filter(b => b.active !== false);
    const inactiveList = filteredBills.filter(b => b.active === false);
    return {
      "Active Subscriptions": activeList,
      "Inactive Subscriptions": inactiveList,
    };
  }, [filteredBills]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !amount.trim() || isSubmitting) return;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage("Please enter a valid amount greater than 0");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const res = await createBillAction({
      name: name.trim(),
      amountMin: parsedAmount,
      amountMax: parsedAmount,
      repeatFreq,
      active: true,
      date: startDate || undefined,
    });

    setIsSubmitting(false);

    if (res.success && res.bill) {
      setBills(prev => [...prev, res.bill!].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base", numeric: true })));
      setName("");
      setAmount("");
      setRepeatFreq("monthly");
      setStartDate(new Date().toISOString().substring(0, 10));
      setIsCreating(false);
    } else {
      setErrorMessage(res.error || "Failed to create subscription");
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        backHref="/settings"
        subtitle="Manage expected bills and recurring subscriptions"
        title="Subscriptions"
      />

      {/* Search & Actions */}
      <div className="flex gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute left-3 top-2.5 text-zinc-500">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Filter subscriptions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-zinc-700"
          />
        </div>
      </div>

      {/* Grouped Subscriptions */}
      <div className="flex flex-col gap-6">
        {Object.entries(groupedBills).map(([groupTitle, list]) => {
          const isCollapsed = collapsedGroups[groupTitle] === true;
          return (
            <div key={groupTitle} className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setCollapsedGroups(prev => ({ ...prev, [groupTitle]: !isCollapsed }))}
                className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider px-1 cursor-pointer w-full text-left py-1 hover:text-zinc-200 transition-colors group/header"
              >
                <span>{groupTitle}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-400 bg-zinc-800/85 px-2.5 py-0.5 rounded-full border border-zinc-700/60 normal-case tracking-normal">
                    {list.length}
                  </span>
                  <ChevronDown size={14} className={`text-zinc-500 group-hover/header:text-zinc-300 transition-transform ${isCollapsed ? "-rotate-90" : ""}`} />
                </div>
              </button>

              {!isCollapsed && (
                <div className="flex flex-col gap-3">
                  {list.length === 0 ? (
                    <div className="glass-card p-8 text-center flex flex-col items-center justify-center border border-zinc-900/40">
                      <Calendar size={24} className="text-zinc-650 mb-2" />
                      <p className="text-xs text-zinc-500">No subscriptions found in this section.</p>
                    </div>
                  ) : (
                    list.map(bill => {
                      let style = getCategoryStyle(bill.name);
                      if (style.icon === HelpCircle) {
                        style = getCategoryStyle("subscriptions");
                      }
                      const CatIcon = style.icon || HelpCircle;

                      const dueDateDisplay = bill.dueDate
                        ? new Date(bill.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
                        : "N/A";

                      return (
                        <Link
                          key={bill.id}
                          href={`/settings/subscriptions/${bill.id}`}
                          className={`glass-card p-4 transition-all border flex flex-col gap-2.5 hover:bg-zinc-900/20 hover:border-zinc-700/60 active:scale-[0.99] cursor-pointer group ${
                            bill.active ? "border-zinc-800/60" : "border-zinc-900/30 opacity-60"
                          }`}
                        >
                          {/* Header: Title + category icon on left, freq on right */}
                          <div className="flex justify-between items-start">
                            <div className="flex flex-col gap-1 pr-4 min-w-0">
                              <h4 className="font-semibold text-sm text-zinc-100 truncate">{bill.name}</h4>
                              {/* Category badge below title */}
                              <span className={`inline-flex items-center gap-1 text-[10px] font-semibold w-fit px-2 py-0.5 rounded-full border ${style.bgClass} ${style.colorClass} ${style.borderClass}`}>
                                <CatIcon size={9} />
                                <span className="capitalize">{bill.repeatFreq ?? "subscription"}</span>
                              </span>
                            </div>

                            {/* Right: amount plain text */}
                            <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                              <span className="text-sm font-bold text-zinc-100">{fmt(bill.amount)}</span>
                              <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-500">{dueDateDisplay}</span>
                            </div>
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Add New Subscription Section */}
        <div className="pt-4 border-t border-zinc-800/40">
          {!isCreating ? (
            <button
              type="button"
              onClick={() => {
                setIsCreating(true);
                setErrorMessage("");
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-300 transition-colors px-1 py-1 cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Subscription</span>
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-sm mt-1 bg-zinc-950/20 border border-zinc-800/60 rounded-xl p-4">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wide">New Subscription</h4>
              
              <div className="flex flex-col gap-1.5">
                <input
                  type="text"
                  placeholder="Subscription Name (e.g. Netflix)..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-zinc-700 w-full"
                  autoFocus
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder={`Amount (${symbol})...`}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-zinc-700 w-full"
                    disabled={isSubmitting}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <select
                    value={repeatFreq}
                    onChange={(e) => setRepeatFreq(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-100 outline-none focus:border-zinc-700 w-full"
                    disabled={isSubmitting}
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="half-year">Half Year</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wide">First payment date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-100 outline-none focus:border-zinc-700 w-full"
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex gap-2 justify-end mt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setName("");
                    setAmount("");
                    setRepeatFreq("monthly");
                    setStartDate(new Date().toISOString().substring(0, 10));
                    setErrorMessage("");
                  }}
                  className="bg-zinc-900 hover:bg-zinc-800/80 text-zinc-400 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !name.trim() || !amount.trim()}
                  className="bg-zinc-100 hover:bg-zinc-200 disabled:opacity-50 text-zinc-900 rounded-xl px-3 py-1.5 text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors"
                >
                  {isSubmitting ? "Adding..." : "Add"}
                </button>
              </div>

              {errorMessage && (
                <span className="text-[10px] text-rose-400 font-semibold px-1">
                  {errorMessage}
                </span>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
