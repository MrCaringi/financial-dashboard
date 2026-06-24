import { PageHeader } from "@/components/PageHeader";
import { PaydaySettingsClient } from "./PaydaySettingsClient";
import { getPaydayConfig } from "@/lib/payday";

export const dynamic = "force-dynamic";

export default async function PaydaySettingsPage() {
  const config = getPaydayConfig();

  return (
    <div className="flex flex-col gap-6 p-4 pt-12 pb-32 max-w-xl mx-auto">
      <PageHeader backHref="/settings" subtitle="Settings" title="Cycle & Payday" />
      <PaydaySettingsClient initialConfig={config} />
    </div>
  );
}
