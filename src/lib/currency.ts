import { cookies } from "next/headers";
import { getCurrencies, FALLBACK_CURRENCIES } from "./api/currencies";
import { DisplayCurrency, DEFAULT_DISPLAY_CURRENCY } from "./currency-types";

export * from "./currency-types";

export async function getDisplayCurrency(): Promise<DisplayCurrency> {
  try {
    const cookieStore = await cookies();
    const saved = cookieStore.get("display_currency")?.value;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.code && parsed?.symbol) {
          return {
            code: parsed.code,
            symbol: parsed.symbol,
            name: parsed.name || parsed.code,
            decimalPlaces: typeof parsed.decimalPlaces === "number" ? parsed.decimalPlaces : 2,
          };
        }
      } catch {
        const fallbackMatch = FALLBACK_CURRENCIES.find(c => c.code === saved);
        if (fallbackMatch) {
          return {
            code: fallbackMatch.code,
            symbol: fallbackMatch.symbol,
            name: fallbackMatch.name,
            decimalPlaces: fallbackMatch.decimal_places,
          };
        }
      }
    }

    const currencies = await getCurrencies();
    const defaultCurr = currencies.find(c => c.default) || currencies[0];
    if (defaultCurr) {
      return {
        code: defaultCurr.code,
        symbol: defaultCurr.symbol,
        name: defaultCurr.name,
        decimalPlaces: defaultCurr.decimal_places,
      };
    }
  } catch (err: any) {
    if (err?.digest !== "DYNAMIC_SERVER_USAGE") {
      console.error("Failed to read display currency:", err);
    }
  }

  return DEFAULT_DISPLAY_CURRENCY;
}
