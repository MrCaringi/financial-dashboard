import { getRule, getRuleGroups } from "@/lib/api/rules";
import { getCategories } from "@/lib/api/categories";
import { fetchFirefly } from "@/lib/api/client";
import { PageHeader } from "@/components/PageHeader";
import { RulesEditClient } from "./RulesEditClient";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditRulePage({ params }: PageProps) {
  const { id } = await params;

  // Fetch the rule, categories, bills, and rule groups in parallel on the server
  const [rule, categories, billsData, ruleGroups] = await Promise.all([
    getRule(id).catch(() => null),
    getCategories(),
    fetchFirefly("/bills", {}, { cache: "no-store" }).catch(() => ({ data: [] })),
    getRuleGroups().catch(() => []),
  ]);

  if (!rule) {
    notFound();
  }

  const bills = (billsData.data || []).map((b: any) => ({
    id: b.id,
    name: b.attributes.name as string,
  }));

  return (
    <div className="flex flex-col gap-6 p-4 pt-12 pb-32 max-w-2xl mx-auto">
      <PageHeader backHref="/settings/rules" subtitle="Edit trigger patterns and automated actions" title="Edit Rule" />
      <RulesEditClient rule={rule} categories={categories} bills={bills} ruleGroups={ruleGroups} />
    </div>
  );
}
