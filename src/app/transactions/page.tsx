import React from "react";
import { getAllRichTransactions, getCategories, getGroupedAccounts } from "@/lib/firefly";
import { AllTransactionsView } from "@/components/AllTransactionsView";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ days?: string; account?: string }>;
}

export default async function AllTransactionsPage({ searchParams }: PageProps) {
  const { days: daysParam, account: accountParam } = await searchParams;
  const days = Math.min(Math.max(parseInt(daysParam || "90", 10) || 90, 30), 365);

  const [transactions, categories, accountGroups] = await Promise.all([
    getAllRichTransactions(days),
    getCategories(),
    getGroupedAccounts(),
  ]);

  // Flatten all real account names from the user's actual accounts
  const accountNames = accountGroups
    .flatMap((group) => group.accounts)
    .map((acc) => acc.name);

  return (
    <div className="flex flex-col gap-6 p-4 pt-12 pb-32 max-w-xl mx-auto">
      <AllTransactionsView
        initialTransactions={transactions}
        categories={categories}
        accountNames={accountNames}
        currentDays={days}
        initialAccount={accountParam}
      />
    </div>
  );
}

