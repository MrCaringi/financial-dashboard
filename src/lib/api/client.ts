import fs from "fs";
import path from "path";

export function getActiveApiUrl(): string {
  try {
    const overridePath = path.join(process.cwd(), ".url_override");
    if (fs.existsSync(overridePath)) {
      return fs.readFileSync(overridePath, "utf-8").trim();
    }
  } catch (err) {
    console.error("Failed to read API URL override file:", err);
  }
  return process.env.FIREFLY_API_URL || "http://localhost:8080";
}

export function getActivePat(): string {
  try {
    const overridePath = path.join(process.cwd(), ".pat_override");
    if (fs.existsSync(overridePath)) {
      return fs.readFileSync(overridePath, "utf-8").trim();
    }
  } catch (err) {
    console.error("Failed to read PAT override file:", err);
  }
  return process.env.FIREFLY_PAT || "";
}

export async function fetchFirefly(
  endpoint: string,
  params: Record<string, string> = {},
  options: RequestInit = {}
) {
  const apiUrl = getActiveApiUrl();
  const url = new URL(`${apiUrl}/api/v1${endpoint}`);
  
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const pat = getActivePat();

  const fetchOptions: RequestInit = {
    headers: {
      Authorization: `Bearer ${pat}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    ...options,
  };

  // Tiered caching logic:
  if (options.next && ('revalidate' in options.next)) {
    // Caller specified revalidation, keep it as-is
  } else if (options.cache) {
    // Caller specified cache strategy, keep it as-is
  } else {
    // Default: do not cache (fetch fresh data to ensure mutations reflect immediately)
    fetchOptions.cache = "no-store";
  }

  const response = await fetch(url.toString(), fetchOptions);

  if (!response.ok) {
    console.error(`Firefly API Error: ${response.status} - ${response.statusText}`, await response.text());
    throw new Error(`Firefly API failed: ${response.statusText}`);
  }

  return response.json();
}

/** Mutation helper for PUT/PATCH requests to Firefly III */
export async function mutateFirefly(
  endpoint: string,
  method: "PUT" | "PATCH",
  body: unknown,
): Promise<Response> {
  const apiUrl = getActiveApiUrl();
  const url = `${apiUrl}/api/v1${endpoint}`;
  const pat = getActivePat();
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${pat}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  return response;
}

export function parseNotes(notesStr: string | null): any {
  if (!notesStr) return null;
  try {
    return JSON.parse(notesStr);
  } catch {
    return null;
  }
}
