import { getAllBills } from "@/lib/api/bills";
import { SubscriptionsListClient } from "./SubscriptionsListClient";

export const dynamic = "force-dynamic";

export default async function SubscriptionsPage() {
  const bills = await getAllBills();

  return (
    <div className="flex flex-col gap-6 p-4 pt-12 pb-32 max-w-4xl mx-auto">
      <SubscriptionsListClient
        initialBills={bills}
      />
    </div>
  );
}
