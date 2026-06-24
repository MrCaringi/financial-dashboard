import { getAccount, getAccountTransactions, getCategories, Transaction } from "@/lib/firefly";
import { Wallet, PiggyBank, CreditCard, Activity, Calendar } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import Link from "next/link";
import { fmt } from "@/lib/format";
import { TransactionList } from "@/components/TransactionList";
import { AccountTabs } from "./AccountTabs";
import { AccountSettingsForm } from "./AccountSettingsForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function AccountDetailPage(props: PageProps) {
  const { id } = await props.params;
  const { tab } = await props.searchParams;

  let account;
  let transactions: Transaction[] = [];
  let categories: string[] = [];
  let errorMsg = "";

  try {
    const [fetchedAccount, fetchedTransactions, fetchedCategories] = await Promise.all([
      getAccount(id),
      getAccountTransactions(id, 15),
      getCategories(),
    ]);

    account = fetchedAccount;
    transactions = fetchedTransactions;
    categories = fetchedCategories;
  } catch (error: any) {
    console.error(`Error loading detail page for account ${id}:`, error);
    errorMsg = error.message || "Failed to load account details";
  }

  if (!account) {
    return (
      <div className="flex flex-col gap-6 p-4 pt-12 pb-32 items-center justify-center min-h-[60vh]">
        <h2 className="text-xl font-bold text-zinc-100">Account Not Found</h2>
        <p className="text-sm text-zinc-400 text-center max-w-xs">
          {errorMsg || "We couldn't retrieve the details for this account."}
        </p>
        <Link href="/accounts" className="mt-4 bg-zinc-100 text-zinc-950 font-bold px-4 py-2 rounded-xl text-sm">
          Back to Accounts
        </Link>
      </div>
    );
  }

  const isCc = account.role === "ccAsset" || account.role === "ccLiability";
  const isSavings = account.role === "savingAsset";

  let accentColorClass = "text-emerald-500";
  let bgAccentClass = "bg-emerald-500/10";
  let borderAccentClass = "border-emerald-500/20";
  let IconComponent = Wallet;
  let balanceLabel = "Available Balance";
  let shadowStyle = "shadow-[0_0_30px_rgba(16,185,129,0.06)]";

  if (isSavings) {
    accentColorClass = "text-blue-400";
    bgAccentClass = "bg-blue-500/10";
    borderAccentClass = "border-blue-500/20";
    IconComponent = PiggyBank;
    balanceLabel = "Savings Balance";
    shadowStyle = "shadow-[0_0_30px_rgba(59,130,246,0.06)]";
  } else if (isCc) {
    accentColorClass = "text-rose-400";
    bgAccentClass = "bg-rose-500/10";
    borderAccentClass = "border-rose-500/20";
    IconComponent = CreditCard;
    balanceLabel = "Credit Owed";
    shadowStyle = "shadow-[0_0_30px_rgba(239,68,68,0.06)]";
  }

  // format last activity date
  let activityText = "";
  if (account.lastActivity) {
    const date = new Date(account.lastActivity);
    activityText = `Active ${date.toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' })}`;
  }

  return (
    <div className="flex flex-col gap-6 p-4 pt-12 pb-32">
      {/* Header */}
      <PageHeader
        backHref="/accounts"
        subtitle={account.role === "savingAsset" ? "Savings" : isCc ? "Credit Card" : "Asset"}
        title={account.name}
      />

      {/* Account Balance Hero Card */}
      <section className={`glass-card p-5 flex flex-col gap-4 relative overflow-hidden ${shadowStyle}`}>
        {/* Dynamic Glowing background blur element */}
        <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-20 blur-2xl pointer-events-none ${accentColorClass.replace('text-', 'bg-')}`} />

        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">
              {balanceLabel}
            </span>
            <p className={`text-4xl font-extralight tracking-tight mt-1 ${isCc ? "text-rose-400" : "text-white"}`}>
              {fmt(account.displayBalance)}
            </p>
          </div>

          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bgAccentClass} ${accentColorClass} border ${borderAccentClass}`}>
            <IconComponent size={20} />
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-white/5 pt-3 mt-1 flex-wrap">
          {account.isPrimarySource && (
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Primary Source
            </span>
          )}

          {activityText && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
              <Activity size={12} className="opacity-70 text-zinc-500" />
              <span>{activityText}</span>
            </div>
          )}

          {isCc && account.paymentConfig && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
              <Calendar size={12} className="opacity-70 text-zinc-500" />
              <span>Due on {account.paymentConfig.dueDay}th</span>
            </div>
          )}
        </div>
      </section>

      {/* Tabs for Transactions list and Config Settings Form */}
      <AccountTabs
        accountName={account.name}
        activityTab={<TransactionList transactions={transactions} categories={categories} />}
        settingsTab={<AccountSettingsForm account={account} />}
        initialTab={tab}
      />
    </div>
  );
}
