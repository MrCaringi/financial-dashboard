import { getUncategorizedTransactions, getCategories } from "@/lib/firefly";
import { UncategorizedList } from "@/components/UncategorizedList";

export const dynamic = "force-dynamic";

export default async function UncategorizedPage() {
  const [transactions, categories] = await Promise.all([
    getUncategorizedTransactions(30),
    getCategories(),
  ]);

  return (
    <div className="flex flex-col gap-6 p-4 pt-12 pb-32 max-w-xl mx-auto">
      <UncategorizedList transactions={transactions} categories={categories} />
    </div>
  );
}
