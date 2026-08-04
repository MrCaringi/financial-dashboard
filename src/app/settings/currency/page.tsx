import { PageHeader } from "@/components/PageHeader";
import { getCurrencies } from "@/lib/api/currencies";
import { getDisplayCurrency } from "@/lib/currency";
import { CurrencySettingsClient } from "./CurrencySettingsClient";

export const dynamic = "force-dynamic";

export default async function CurrencySettingsPage() {
  const [currencies, currentDisplayCurrency] = await Promise.all([
    getCurrencies().catch(() => []),
    getDisplayCurrency(),
  ]);

  return (
    <div className="flex flex-col gap-6 p-4 pt-12 pb-32 max-w-xl mx-auto">
      <PageHeader backHref="/settings" subtitle="Settings" title="Display Currency" />
      <CurrencySettingsClient
        currencies={currencies}
        currentDisplayCurrency={currentDisplayCurrency}
      />
    </div>
  );
}
