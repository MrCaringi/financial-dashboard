import { getGroupedAccounts, GroupedAccount } from "@/lib/firefly";
import { PageHeader } from "@/components/PageHeader";
import { AccountsSettingsClient } from "./AccountsSettingsClient";

export const dynamic = "force-dynamic";

export default async function AccountsSettingsPage() {
  let currentAccounts: GroupedAccount[] = [];
  let creditCardAccounts: GroupedAccount[] = [];
  let initialPrimaryAccountId: string | null = null;
  let isMock = false;

  try {
    const groups = await getGroupedAccounts();
    currentAccounts = groups.find(g => g.label === "Current Accounts")?.accounts || [];
    creditCardAccounts = groups.find(g => g.label === "Credit Cards")?.accounts || [];
    
    // Find initial primary account
    for (const acc of currentAccounts) {
      if (acc.isPrimarySource) {
        initialPrimaryAccountId = acc.id;
        break;
      }
    }
  } catch (error) {
    console.error("Failed to fetch accounts for accounts settings page", error);
    isMock = true;
  }

  return (
    <div className="flex flex-col gap-6 p-4 pt-12 pb-32 max-w-xl mx-auto">
      <PageHeader backHref="/settings" subtitle="Settings" title="Account Settings" />
      <AccountsSettingsClient
        currentAccounts={currentAccounts}
        creditCardAccounts={creditCardAccounts}
        initialPrimaryAccountId={initialPrimaryAccountId}
      />
    </div>
  );
}
