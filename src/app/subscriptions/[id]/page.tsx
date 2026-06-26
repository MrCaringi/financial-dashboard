import { getBillDetails, getBillTransactions, getCategories } from "@/lib/firefly";
import { Calendar, Globe, AlertTriangle, ArrowUpRight, TrendingUp, CheckCircle, HelpCircle, Settings } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import Link from "next/link";
import { fmt } from "@/lib/format";
import { getCategoryStyle } from "@/lib/category-icons";
import { SubscriptionHistoryChart } from "@/components/SubscriptionHistoryChart";
import { TransactionList } from "@/components/TransactionList";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SubscriptionDetailPage(props: PageProps) {
  const { id } = await props.params;

  let bill;
  let transactions: any[] = [];
  let categories: string[] = [];
  let errorMsg = "";

  try {
    if (id.startsWith("mock-")) {
      // Setup mock data for demonstration/fallback
      const isNetflix = id.includes("netflix");
      bill = {
        id,
        name: isNetflix ? "Netflix" : "Council Tax",
        amount: isNetflix ? 15.99 : 150.00,
        dueDate: isNetflix ? "2026-05-28" : "2026-06-15",
        isPaid: false,
        expectedInCycle: true,
        amountMin: isNetflix ? 10.99 : 150.00,
        amountMax: isNetflix ? 15.99 : 150.00,
        nextExpectedPayment: isNetflix ? "2026-05-28" : "2026-06-15",
        extensionUrl: isNetflix ? "https://netflix.com/youraccount" : "https://gov.uk/council-tax",
        active: true,
        repeatFreq: "monthly"
      };

      transactions = isNetflix ? [
        { id: "mock-tx-1", journalId: "mock-j1", name: "Netflix", category: "Subscriptions", amount: -15.99, date: "28 May 2026" },
        { id: "mock-tx-2", journalId: "mock-j2", name: "Netflix", category: "Subscriptions", amount: -15.99, date: "28 Apr 2026" },
        { id: "mock-tx-3", journalId: "mock-j3", name: "Netflix", category: "Subscriptions", amount: -12.99, date: "28 Mar 2026" },
        { id: "mock-tx-4", journalId: "mock-j4", name: "Netflix", category: "Subscriptions", amount: -12.99, date: "28 Feb 2026" },
        { id: "mock-tx-5", journalId: "mock-j5", name: "Netflix", category: "Subscriptions", amount: -10.99, date: "28 Jan 2026" }
      ] : [
        { id: "mock-tx-1", journalId: "mock-j1", name: "Council Tax", category: "Taxes", amount: -150.00, date: "15 May 2026" },
        { id: "mock-tx-2", journalId: "mock-j2", name: "Council Tax", category: "Taxes", amount: -150.00, date: "15 Apr 2026" },
        { id: "mock-tx-3", journalId: "mock-j3", name: "Council Tax", category: "Taxes", amount: -150.00, date: "15 Mar 2026" }
      ];

      categories = ["Subscriptions", "Taxes", "Groceries", "Food & Drink", "Utilities", "Transport"];
    } else {
      const [fetchedBill, fetchedTransactions, fetchedCategories] = await Promise.all([
        getBillDetails(id),
        getBillTransactions(id),
        getCategories()
      ]);
      bill = fetchedBill;
      transactions = fetchedTransactions;
      categories = fetchedCategories;
    }
  } catch (error: any) {
    console.error("Error loading detail page for bill:", id, error);
    errorMsg = error.message || "Failed to load subscription details";
  }

  if (!bill) {
    return (
      <div className="flex flex-col gap-6 p-4 pt-12 pb-32 items-center justify-center min-h-[60vh]">
        <h2 className="text-xl font-bold text-zinc-100">Subscription Not Found</h2>
        <p className="text-sm text-zinc-400 text-center max-w-xs">
          {errorMsg || "We couldn't retrieve the details for this subscription."}
        </p>
        <Link href="/" className="mt-4 bg-zinc-100 text-zinc-950 font-bold px-4 py-2 rounded-xl text-sm">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // Identify category styles based on bill name or transaction categories
  let style = getCategoryStyle(bill.name);
  if (style.icon === HelpCircle && transactions.length > 0) {
    const txStyle = getCategoryStyle(transactions[0].category);
    if (txStyle.icon !== HelpCircle) {
      style = txStyle;
    }
  }
  if (style.icon === HelpCircle) {
    style = getCategoryStyle("subscriptions");
  }
  
  const IconComponent = style.icon || HelpCircle;

  // Annualized Projection calculation
  let annualMultiplier = 12;
  const freq = (bill.repeatFreq || "monthly").toLowerCase();
  if (freq.includes("weekly")) {
    annualMultiplier = 52;
  } else if (freq.includes("yearly") || freq.includes("annual")) {
    annualMultiplier = 1;
  } else if (freq.includes("quarterly")) {
    annualMultiplier = 4;
  } else if (freq.includes("half-year")) {
    annualMultiplier = 2;
  } else if (freq.includes("bi-monthly")) {
    annualMultiplier = 6;
  } else if (freq.includes("daily")) {
    annualMultiplier = 365;
  }
  const annualRate = bill.amount * annualMultiplier;

  // Price Creep Detection (compares latest payment to the minimum ever paid historically)
  let priceCreepMessage = "Price Stable";
  let priceCreepType: "stable" | "increased" | "decreased" = "stable";
  let creepPercent = 0;

  if (transactions.length > 1) {
    const amounts = transactions.map(t => Math.abs(t.amount));
    const latest = amounts[0];
    const previous = amounts.slice(1);
    const minHistorical = Math.min(...previous);

    if (latest > minHistorical && minHistorical > 0) {
      creepPercent = ((latest - minHistorical) / minHistorical) * 100;
      if (creepPercent > 0.5) { // filter out minor float point anomalies
        priceCreepType = "increased";
        priceCreepMessage = `Up ${creepPercent.toFixed(0)}% from peak minimum`;
      }
    } else if (latest < minHistorical) {
      creepPercent = ((minHistorical - latest) / minHistorical) * 100;
      priceCreepType = "decreased";
      priceCreepMessage = `Down ${creepPercent.toFixed(0)}% from peak`;
    }
  } else if (bill.amountMin && bill.amountMax && bill.amountMax > bill.amountMin) {
    creepPercent = ((bill.amountMax - bill.amountMin) / bill.amountMin) * 100;
    priceCreepType = "increased";
    priceCreepMessage = `Configured range: up to +${creepPercent.toFixed(0)}%`;
  }

  return (
    <div className="flex flex-col gap-6 p-4 pt-12 pb-32">
      {/* Header */}
      <PageHeader
        backHref="/"
        subtitle="Subscription Hub"
        title={bill.name}
        rightSection={
          !id.startsWith("mock-") && (
            <Link
              href={`/settings/subscriptions/${id}`}
              className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800/80 flex items-center justify-center text-zinc-400 hover:text-zinc-100 transition-colors active:scale-95"
              title="Edit Subscription Settings"
              aria-label="Edit Subscription Settings"
            >
              <Settings size={18} />
            </Link>
          )
        }
      />

      {/* Hero card details */}
      <section className="glass-card p-5 flex flex-col gap-4 relative overflow-hidden shadow-[0_0_30px_rgba(34,211,238,0.04)]">
        <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-10 blur-2xl pointer-events-none bg-cyan-500`} />

        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">
              Current Pricing
            </span>
            <p className="text-4xl font-extralight tracking-tight mt-1 text-white">
              {fmt(bill.amount)}
              <span className="text-base text-zinc-400 font-normal"> / {bill.repeatFreq || "month"}</span>
            </p>
          </div>

          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${style.bgClass} ${style.colorClass} border ${style.borderClass}`}>
            <IconComponent size={20} />
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-white/5 pt-3 mt-1 flex-wrap justify-between">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
            <Calendar size={13} className="opacity-70 text-zinc-500" />
            <span>Next due: {bill.dueDate ? new Date(bill.dueDate).toLocaleDateString("en-GB", { day: 'numeric', month: 'short' }) : "N/A"}</span>
          </div>

          <div className="flex gap-2">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
              bill.active 
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                : "bg-zinc-500/20 text-zinc-400 border border-zinc-500/30"
            }`}>
              {bill.active ? "Active" : "Inactive"}
            </span>

            {bill.isPaid && (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Paid
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Quick Portal Action */}
      {bill.extensionUrl && (
        <a 
          href={bill.extensionUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="glass-card hover:bg-zinc-800/30 active:scale-[0.99] transition-all py-3.5 px-4 flex items-center justify-between border border-white/5 cursor-pointer text-sm font-semibold text-zinc-100"
        >
          <div className="flex items-center gap-2">
            <Globe size={16} className="text-cyan-400" />
            <span>Manage Provider Portal</span>
          </div>
          <ArrowUpRight size={16} className="text-zinc-500" />
        </a>
      )}

      {/* Metrics Grid */}
      <section className="grid grid-cols-2 gap-4">
        {/* Annual cost */}
        <div className="glass-card p-4 flex flex-col justify-between border border-white/5">
          <div className="text-zinc-400 text-xs font-medium tracking-wide">Annual Projection</div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-zinc-100">{fmt(annualRate)}</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">True long-term impact</div>
          </div>
        </div>

        {/* Price creep */}
        <div className="glass-card p-4 flex flex-col justify-between border border-white/5">
          <div className="text-zinc-400 text-xs font-medium tracking-wide">Price Creep Status</div>
          <div className="mt-2 flex flex-col">
            <div className="flex items-center gap-1">
              {priceCreepType === "increased" ? (
                <AlertTriangle size={15} className="text-amber-500" />
              ) : priceCreepType === "decreased" ? (
                <TrendingUp size={15} className="text-emerald-500 rotate-180" />
              ) : (
                <CheckCircle size={15} className="text-emerald-500" />
              )}
              <span className={`text-sm font-bold ${
                priceCreepType === "increased" 
                  ? "text-amber-400" 
                  : priceCreepType === "decreased" 
                  ? "text-emerald-400" 
                  : "text-emerald-400"
              }`}>
                {priceCreepType === "increased" ? "Increase Detected" : priceCreepType === "decreased" ? "Price Decreased" : "Stable"}
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 mt-1">{priceCreepMessage}</span>
          </div>
        </div>
      </section>

      {/* Analytics & History Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
        {/* Chart Column */}
        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold tracking-wider text-zinc-400 uppercase px-1">Price Trend</h3>
          <div className="glass-card p-4">
            <SubscriptionHistoryChart transactions={transactions} />
          </div>
        </section>

        {/* Timeline List Column */}
        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold tracking-wider text-zinc-400 uppercase px-1">Payment History</h3>
          {transactions.length > 0 ? (
            <TransactionList transactions={transactions} categories={categories} />
          ) : (
            <div className="text-center py-8 text-zinc-500 text-sm glass-card border border-white/5">
              No past transactions recorded for this subscription.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

