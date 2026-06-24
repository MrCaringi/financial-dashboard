import { getAccount, getCreditCardPayments, getCategories, getCreditCardBalances } from "@/lib/firefly";
import { CreditCard, Calendar, AlertTriangle, CheckCircle, HelpCircle, TrendingUp, Info, Settings } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import Link from "next/link";
import { fmt } from "@/lib/format";
import { SubscriptionHistoryChart } from "@/components/SubscriptionHistoryChart";
import { TransactionList } from "@/components/TransactionList";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CreditCardDetailPage(props: PageProps) {
  const { id } = await props.params;

  let account;
  let payments: any[] = [];
  let categories: string[] = [];
  let upcomingPayment: any = null;
  let errorMsg = "";

  try {
    const [fetchedAccount, fetchedPayments, fetchedCategories, upcomingBalances] = await Promise.all([
      getAccount(id),
      getCreditCardPayments(id),
      getCategories(),
      getCreditCardBalances()
    ]);
    
    account = fetchedAccount;
    payments = fetchedPayments;
    categories = fetchedCategories;
    upcomingPayment = upcomingBalances.find(p => p.id === id);
  } catch (error: any) {
    console.error(`Error loading detail page for credit card ${id}:`, error);
    errorMsg = error.message || "Failed to load credit card details";
  }

  if (!account) {
    return (
      <div className="flex flex-col gap-6 p-4 pt-12 pb-32 items-center justify-center min-h-[60vh]">
        <h2 className="text-xl font-bold text-zinc-100">Credit Card Not Found</h2>
        <p className="text-sm text-zinc-400 text-center max-w-xs">
          {errorMsg || "We couldn't retrieve the details for this credit card."}
        </p>
        <Link href="/" className="mt-4 bg-zinc-100 text-zinc-950 font-bold px-4 py-2 rounded-xl text-sm">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const hasConfig = account.paymentConfig !== null;
  const paymentAmount = upcomingPayment ? upcomingPayment.balance : (hasConfig ? account.displayBalance : 0);
  const isPaid = upcomingPayment ? upcomingPayment.isPaid : true;
  const dueDate = upcomingPayment ? upcomingPayment.dueDate : null;

  // Calculate payment strategy details
  let strategyText = "No strategy configured";
  if (account.paymentConfig) {
    if (account.paymentConfig.calcType === "full") {
      strategyText = "Full Statement Balance";
    } else if (account.paymentConfig.calcType === "min") {
      const minPercent = ((account.paymentConfig.minPercent || 0.01) * 100).toFixed(1);
      strategyText = `Min Payment (${minPercent}% / min £${account.paymentConfig.minFloor || 25})`;
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4 pt-12 pb-32">
      {/* Header */}
      <PageHeader
        backHref="/"
        subtitle="Credit Card Hub"
        title={account.name}
        rightSection={
          !id.startsWith("mock-") && (
            <Link
              href={`/accounts/${id}?tab=settings`}
              className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800/80 flex items-center justify-center text-zinc-400 hover:text-zinc-100 transition-colors active:scale-95"
              title="Edit Card Strategy Settings"
              aria-label="Edit Card Strategy Settings"
            >
              <Settings size={18} />
            </Link>
          )
        }
      />

      {/* Hero card details */}
      <section className="glass-card p-5 flex flex-col gap-4 relative overflow-hidden shadow-[0_0_30px_rgba(244,63,94,0.04)]">
        <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-10 blur-2xl pointer-events-none bg-rose-500`} />

        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">
              Current Cycle Payment Due
            </span>
            <p className="text-4xl font-extralight tracking-tight mt-1 text-white">
              {fmt(paymentAmount)}
            </p>
          </div>

          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <CreditCard size={20} />
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-white/5 pt-3 mt-1 flex-wrap justify-between">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
            <Calendar size={13} className="opacity-70 text-zinc-500" />
            <span>
              {dueDate 
                ? `Due: ${new Date(dueDate).toLocaleDateString("en-GB", { day: 'numeric', month: 'short' })}` 
                : (hasConfig ? "No active bill in cycle" : "Strategy not configured")}
            </span>
          </div>

          <div className="flex gap-2">
            {hasConfig && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                isPaid 
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                  : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
              }`}>
                {isPaid ? "Paid" : "Unpaid"}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Metrics Grid */}
      <section className="grid grid-cols-2 gap-4">
        {/* Total Outstanding Balance */}
        <div className="glass-card p-4 flex flex-col justify-between border border-white/5">
          <div className="text-zinc-400 text-xs font-medium tracking-wide">Total Card Debt</div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-zinc-100">{fmt(account.displayBalance)}</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Live current balance</div>
          </div>
        </div>

        {/* Payment Strategy */}
        <div className="glass-card p-4 flex flex-col justify-between border border-white/5">
          <div className="text-zinc-400 text-xs font-medium tracking-wide">Payment Strategy</div>
          <div className="mt-2 flex flex-col">
            <div className="flex items-center gap-1">
              {hasConfig ? (
                <CheckCircle size={15} className="text-emerald-500" />
              ) : (
                <AlertTriangle size={15} className="text-amber-500" />
              )}
              <span className={`text-sm font-bold ${hasConfig ? "text-emerald-400" : "text-amber-400"}`}>
                {hasConfig ? "Configured" : "Unconfigured"}
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 mt-1 line-clamp-1">{strategyText}</span>
          </div>
        </div>
      </section>

      {/* Additional Card Details (Config parameters) */}
      {account.paymentConfig && (
        <section className="glass-card p-4 flex flex-col gap-3 border border-white/5 text-sm">
          <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2 text-zinc-400 font-medium">
            <span>Payment Parameters</span>
            <Info size={14} className="text-zinc-500" />
          </div>
          <div className="grid grid-cols-2 gap-y-2 text-xs">
            <div className="text-zinc-400">Statement Day</div>
            <div className="text-zinc-100 text-right font-medium">Day {account.paymentConfig.statementDay}</div>
            <div className="text-zinc-400">Payment Due Day</div>
            <div className="text-zinc-100 text-right font-medium">Day {account.paymentConfig.dueDay}</div>
          </div>
        </section>
      )}

      {/* Analytics & History Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
        {/* Chart Column */}
        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold tracking-wider text-zinc-400 uppercase px-1">Payment Trend</h3>
          <div className="glass-card p-4">
            <SubscriptionHistoryChart transactions={payments} />
          </div>
        </section>

        {/* Timeline List Column */}
        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold tracking-wider text-zinc-400 uppercase px-1">Payment History</h3>
          {payments.length > 0 ? (
            <TransactionList transactions={payments} categories={categories} />
          ) : (
            <div className="text-center py-8 text-zinc-500 text-sm glass-card border border-white/5">
              No past payments recorded for this credit card.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
