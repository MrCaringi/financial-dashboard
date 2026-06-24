import { getGroupedAccounts, AccountGroup } from "@/lib/firefly";
import { Wallet, PiggyBank, CreditCard, Activity } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import Link from "next/link";
import { fmt } from "@/lib/format";

export const dynamic = "force-dynamic";

const mockGroups: AccountGroup[] = [
  {
    label: "Current Accounts",
    icon: "Wallet",
    subtotal: 4168.94,
    accounts: [
      { id: "2", name: "Demo Current Account", role: "defaultAsset", balance: 4161.03, displayBalance: 4161.03, currencySymbol: "£", lastActivity: "2026-05-23T00:00:00Z", isPrimarySource: true, paymentConfig: null },
      { id: "57", name: "Starling", role: "defaultAsset", balance: 7.91, displayBalance: 7.91, currencySymbol: "£", lastActivity: "2026-05-22T00:00:00Z", isPrimarySource: false, paymentConfig: null }
    ]
  },
  {
    label: "Savings",
    icon: "PiggyBank",
    subtotal: 21103.16,
    accounts: [
      { id: "124", name: "Demo Savings", role: "savingAsset", balance: 1500.00, displayBalance: 1500.00, currencySymbol: "£", lastActivity: "2026-05-20T00:00:00Z", isPrimarySource: false, paymentConfig: null },
      { id: "179", name: "Tembo", role: "savingAsset", balance: 19603.16, displayBalance: 19603.16, currencySymbol: "£", lastActivity: "2026-05-21T00:00:00Z", isPrimarySource: false, paymentConfig: null }
    ]
  },
  {
    label: "Credit Cards",
    icon: "CreditCard",
    subtotal: 15245.38,
    accounts: [
      { id: "1", name: "Demo Credit Card A", role: "ccAsset", balance: -4005.30, displayBalance: 4005.30, currencySymbol: "£", lastActivity: "2026-05-20T00:00:00Z", isPrimarySource: false, paymentConfig: { calcType: "full", statementDay: 15, dueDay: 11 } },
      { id: "100", name: "Amazon Barclaycard", role: "ccAsset", balance: -197.90, displayBalance: 197.90, currencySymbol: "£", lastActivity: "2026-05-18T00:00:00Z", isPrimarySource: false, paymentConfig: { calcType: "full", statementDay: 5, dueDay: 28 } },
      { id: "130", name: "HSBC Credit Card", role: " ccAsset", balance: -5900.04, displayBalance: 5900.04, currencySymbol: "£", lastActivity: "2026-05-19T00:00:00Z", isPrimarySource: false, paymentConfig: { calcType: "min", minPercent: 0.025, minFloor: 5.00, statementDay: 31, dueDay: 27 } },
      { id: "131", name: "M&S Credit Card", role: "ccAsset", balance: -5142.14, displayBalance: 5142.14, currencySymbol: "£", lastActivity: "2026-05-20T00:00:00Z", isPrimarySource: false, paymentConfig: { calcType: "min", minPercent: 0.025, minFloor: 5.00, statementDay: 5, dueDay: 30 } }
    ]
  }
];

const iconMap = {
  Wallet: Wallet,
  PiggyBank: PiggyBank,
  CreditCard: CreditCard,
};

export default async function AccountsPage() {
  let groups: AccountGroup[] = [];
  let isMock = false;

  try {
    groups = await getGroupedAccounts();
  } catch (error) {
    console.error("Failed to fetch grouped accounts, using mock data", error);
    groups = mockGroups;
    isMock = true;
  }

  const liquidTotal = groups.find(g => g.label === "Current Accounts")?.subtotal || 0;
  const savingsTotal = groups.find(g => g.label === "Savings")?.subtotal || 0;
  const ccTotal = groups.find(g => g.label === "Credit Cards")?.subtotal || 0;
  const netWorth = liquidTotal + savingsTotal - ccTotal;

  return (
    <div className="flex flex-col gap-6 p-4 pt-12 pb-32">
      {/* Header */}
      <PageHeader subtitle="Overview" title="My Accounts" />

      {/* Summary Card */}
      <section className="glass-card p-4 flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <div>
            <h3 className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">Estimated Net Worth</h3>
            <p className="text-3xl font-extralight mt-1 tracking-tight text-white">{fmt(netWorth)}</p>
          </div>
          {isMock && (
            <span className="text-xs bg-zinc-855 text-zinc-300 border border-zinc-700 px-2 py-0.5 rounded-full font-medium">
              Mock Data
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="flex flex-col gap-1 border-r border-white/5 pr-1">
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Current</span>
            <span className="font-semibold text-sm text-zinc-100">{fmt(liquidTotal)}</span>
          </div>
          <div className="flex flex-col gap-1 border-r border-white/5 px-1">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Savings</span>
            <span className="font-semibold text-sm text-zinc-100">{fmt(savingsTotal)}</span>
          </div>
          <div className="flex flex-col gap-1 pl-1">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Credit Owed</span>
            <span className="font-semibold text-sm text-zinc-100">{fmt(ccTotal)}</span>
          </div>
        </div>
      </section>

      {/* Group Lists */}
      {groups.map((group, groupIdx) => {
        const IconComponent = iconMap[group.icon as keyof typeof iconMap] || Wallet;
        const isCreditGroup = group.label === "Credit Cards";
        
        let borderClass = "border-l-4 border-l-emerald-500";
        let textAccent = "text-emerald-500";
        let bgAccent = "bg-emerald-500/10";
        
        if (group.label === "Savings") {
          borderClass = "border-l-4 border-l-blue-500";
          textAccent = "text-blue-400";
          bgAccent = "bg-blue-500/10";
        } else if (group.label === "Credit Cards") {
          borderClass = "border-l-4 border-l-rose-500";
          textAccent = "text-rose-400";
          bgAccent = "bg-rose-500/10";
        }

        return (
          <section key={groupIdx} className="flex flex-col gap-3">
            <div className="flex justify-between items-center px-2">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${bgAccent} ${textAccent}`}>
                  <IconComponent size={14} />
                </div>
                <h3 className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">{group.label}</h3>
              </div>
              <span className="font-semibold text-sm text-zinc-400">
                {isCreditGroup ? "Owed: " : ""}
                {fmt(group.subtotal)}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {group.accounts.map((account) => {
                let activityText = "";
                if (account.lastActivity) {
                  const date = new Date(account.lastActivity);
                  activityText = `Active ${date.toLocaleDateString("en-GB", { day: 'numeric', month: 'short' })}`;
                }

                return (
                  <Link
                    key={account.id}
                    href={`/accounts/${account.id}`}
                    className={`glass-card p-4 flex flex-col gap-2 relative overflow-hidden transition-all active:scale-[0.98] ${borderClass} border-y-0 border-r-0 rounded-l-none block`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-1 pr-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-sm text-zinc-100">{account.name}</h4>
                          {account.isPrimarySource && (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                              Primary
                            </span>
                          )}
                        </div>
                        {activityText && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                            <Activity size={10} className="opacity-70" />
                            <span>{activityText}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <p className={`font-bold text-base ${isCreditGroup ? "text-rose-400" : "text-zinc-100"}`}>
                          {fmt(account.displayBalance)}
                        </p>
                      </div>
                    </div>

                    {/* Credit Card Details */}
                    {isCreditGroup && account.paymentConfig && (
                      <div className="mt-2 pt-2 border-t border-white/5 flex flex-col gap-1 text-xs text-zinc-400">
                        <div className="flex justify-between items-center">
                          <span>Payment Rule</span>
                          <span className="font-semibold text-zinc-200">
                            {account.paymentConfig.calcType === "full"
                              ? "Pay Statement In Full"
                              : `Pay Min (${account.paymentConfig.minPercent ? Math.round(account.paymentConfig.minPercent * 1000) / 10 : 2.5}% / £${account.paymentConfig.minFloor || 5} floor)`}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-zinc-500">
                          <span>Statement Day: {account.paymentConfig.statementDay}th</span>
                          <span>Due Day: {account.paymentConfig.dueDay}th</span>
                        </div>
                      </div>
                    )}
                  </Link>
                );
              })}
              
              {group.accounts.length === 0 && (
                <p className="text-xs text-muted-foreground px-2 py-1">No active accounts in this category.</p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
