import { getGroupedAccounts, GroupedAccount, getActiveApiUrl } from "@/lib/firefly";
import { PageHeader } from "@/components/PageHeader";
import Link from "next/link";
import { SettingsForm } from "./SettingsForm";
import { logoutAction } from "@/app/actions/auth";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  let currentAccounts: GroupedAccount[] = [];
  let creditCardAccounts: GroupedAccount[] = [];
  let initialPrimaryAccountId: string | null = null;
  let isMock = false;

  const apiUrl = getActiveApiUrl();
  let urlSource: "env" | "override" = "env";

  let patSource: "env" | "override" | "none" = "none";
  let activePatMasked = "";

  try {
    const urlOverridePath = path.join(process.cwd(), ".url_override");
    if (fs.existsSync(urlOverridePath)) {
      urlSource = "override";
    }

    const overridePath = path.join(process.cwd(), ".pat_override");
    let patValue = "";
    if (fs.existsSync(overridePath)) {
      patSource = "override";
      patValue = fs.readFileSync(overridePath, "utf-8").trim();
    } else if (process.env.FIREFLY_PAT) {
      patSource = "env";
      patValue = process.env.FIREFLY_PAT;
    }

    if (patValue) {
      activePatMasked = patValue.length <= 10 
        ? "****" 
        : `${patValue.substring(0, 6)}...${patValue.substring(patValue.length - 4)}`;
    }

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
    console.error("Failed to fetch accounts for settings page", error);
    isMock = true;
  }

  return (
    <div className="flex flex-col gap-6 p-4 pt-12 pb-32">
      {/* Header */}
      <PageHeader subtitle="Preferences" title="Settings" />

      {/* Main Content */}
      <SettingsForm
        apiUrl={apiUrl}
        isMock={isMock}
      />

      <div className="mt-8 px-2">
        <form action={logoutAction}>
          <button type="submit" className="w-full py-3 px-4 rounded-xl border border-destructive/30 text-destructive font-medium glass hover:bg-destructive/10 transition-colors flex items-center justify-center gap-2">
            Log Out
          </button>
        </form>
      </div>
    </div>
  );
}
