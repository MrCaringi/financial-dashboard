import { getActiveApiUrl } from "@/lib/firefly";
import { PageHeader } from "@/components/PageHeader";
import fs from "fs";
import path from "path";
import { ApiConnectionClient } from "./ApiConnectionClient";

export const dynamic = "force-dynamic";

export default async function ApiConnectionPage() {
  const AUTH_FILE_PATH = process.env.AUTH_FILE_PATH || path.join(process.cwd(), ".dashboard_auth");
  let storedPat = "";
  let storedUrl = "";
  try {
    if (fs.existsSync(AUTH_FILE_PATH)) {
      const stored = JSON.parse(fs.readFileSync(AUTH_FILE_PATH, "utf-8"));
      storedPat = stored?.fireflyPat || "";
      storedUrl = stored?.fireflyApiUrl || "";
    }
  } catch (e) {
    console.error("Failed to read stored auth file:", e);
  }

  const apiUrl = getActiveApiUrl();
  let urlSource: "env" | "override" | "auth_file" = "env";
  const urlOverridePath = path.join(process.cwd(), ".url_override");
  if (fs.existsSync(urlOverridePath)) {
    urlSource = "override";
  } else if (storedUrl) {
    urlSource = "auth_file";
  }

  let patSource: "env" | "override" | "auth_file" | "none" = "none";
  let patValue = "";
  const overridePath = path.join(process.cwd(), ".pat_override");
  if (fs.existsSync(overridePath)) {
    patSource = "override";
    patValue = fs.readFileSync(overridePath, "utf-8").trim();
  } else if (storedPat) {
    patSource = "auth_file";
    patValue = storedPat;
  } else if (process.env.FIREFLY_PAT) {
    patSource = "env";
    patValue = process.env.FIREFLY_PAT;
  }

  let activePatMasked = "";
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
