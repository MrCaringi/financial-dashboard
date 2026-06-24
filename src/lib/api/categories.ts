import { fetchFirefly } from "./client";

export async function getCategories(): Promise<string[]> {
  let page = 1;
  let allCategories: string[] = [];
  let totalPages = 1;

  while (page <= totalPages) {
    const data = await fetchFirefly("/categories", { page: String(page) }, { next: { revalidate: 3600 } });
    const names = (data.data || []).map((c: any) => c.attributes.name as string);
    allCategories = allCategories.concat(names);
    totalPages = data.meta?.pagination?.total_pages || 1;
    page++;
  }
  
  return allCategories.sort((a, b) => a.localeCompare(b));
}
