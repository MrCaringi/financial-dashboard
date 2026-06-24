import { getActiveApiUrl } from "@/lib/firefly";
import { PageHeader } from "@/components/PageHeader";
import fs from "fs";
import path from "path";
import { ApiConnectionClient } from "./ApiConnectionClient";

export const dynamic = "force-dynamic";

export default async function ApiConnectionPage() {
  const apiUrl = getActiveApiUrl();
  let urlSource: "env" | "override" = "env";

  let patSource: "env" | "override" | "none" = "none";
  let activePatMasked = "";

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

  return (
    <div className="flex flex-col gap-6 p-4 pt-12 pb-32 max-w-xl mx-auto">
      <PageHeader backHref="/settings" subtitle="Settings" title="API Connection" />
      <ApiConnectionClient
        apiUrl={apiUrl}
        urlSource={urlSource}
        patSource={patSource}
        activePatMasked={activePatMasked}
      />
    </div>
  );
}
