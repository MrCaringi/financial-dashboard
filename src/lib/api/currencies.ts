import { fetchFirefly, mutateFirefly } from "./client";

export interface FireflyCurrency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  decimal_places: number;
  enabled: boolean;
  default: boolean;
}

export const FALLBACK_CURRENCIES: FireflyCurrency[] = [
  { id: "1", code: "GBP", name: "British Pound", symbol: "£", decimal_places: 2, enabled: true, default: true },
  { id: "2", code: "USD", name: "US Dollar", symbol: "$", decimal_places: 2, enabled: true, default: false },
  { id: "3", code: "EUR", name: "Euro", symbol: "€", decimal_places: 2, enabled: true, default: false },
  { id: "4", code: "CAD", name: "Canadian Dollar", symbol: "$", decimal_places: 2, enabled: true, default: false },
  { id: "5", code: "AUD", name: "Australian Dollar", symbol: "$", decimal_places: 2, enabled: true, default: false },
  { id: "6", code: "JPY", name: "Japanese Yen", symbol: "¥", decimal_places: 0, enabled: true, default: false },
  { id: "7", code: "CHF", name: "Swiss Franc", symbol: "CHF", decimal_places: 2, enabled: true, default: false },
];

export async function getCurrencies(): Promise<FireflyCurrency[]> {
  try {
    const res = await fetchFirefly("/currencies");
    if (res?.data && Array.isArray(res.data)) {
      const list: FireflyCurrency[] = res.data.map((item: any) => ({
        id: String(item.id),
        code: item.attributes?.code || "GBP",
        name: item.attributes?.name || item.attributes?.code || "Unknown",
        symbol: item.attributes?.symbol || "£",
        decimal_places: typeof item.attributes?.decimal_places === "number" ? item.attributes.decimal_places : 2,
        enabled: item.attributes?.enabled ?? true,
        default: item.attributes?.default ?? false,
      }));
      if (list.length > 0) {
        return list.filter(c => c.enabled);
      }
    }
  } catch (err) {
    console.warn("Failed to fetch currencies from Firefly III, using fallback list:", err);
  }
  return FALLBACK_CURRENCIES;
}

export async function getDefaultCurrencyApi(): Promise<FireflyCurrency | null> {
  try {
    const res = await fetchFirefly("/currencies/default");
    if (res?.data?.attributes) {
      const attr = res.data.attributes;
      return {
        id: String(res.data.id),
        code: attr.code || "GBP",
        name: attr.name || "British Pound",
        symbol: attr.symbol || "£",
        decimal_places: typeof attr.decimal_places === "number" ? attr.decimal_places : 2,
        enabled: attr.enabled ?? true,
        default: true,
      };
    }
  } catch {
    // Fallback: search getCurrencies
    const all = await getCurrencies();
    return all.find(c => c.default) || all[0] || FALLBACK_CURRENCIES[0];
  }
  return FALLBACK_CURRENCIES[0];
}

export async function setDefaultCurrencyApi(idOrCode: string): Promise<boolean> {
  try {
    const res = await mutateFirefly(`/currencies/${idOrCode}/default`, "POST", {});
    return res.ok;
  } catch (err) {
    console.error("Failed to set default currency in Firefly III API:", err);
    return false;
  }
}
