/**
 * Shared dynamic currency formatter — cached by currency code & options.
 */

const localeMap: Record<string, string> = {
  GBP: 'en-GB',
  USD: 'en-US',
  EUR: 'de-DE',
  CAD: 'en-CA',
  AUD: 'en-AU',
  JPY: 'ja-JP',
  CHF: 'de-CH',
};

const formatterCache = new Map<string, Intl.NumberFormat>();

function getFormatter(currencyCode: string = 'GBP', options?: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = `${currencyCode}:${JSON.stringify(options || {})}`;
  if (!formatterCache.has(key)) {
    const locale = localeMap[currencyCode] || 'en-GB';
    formatterCache.set(
      key,
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
        ...options,
      })
    );
  }
  return formatterCache.get(key)!;
}

export function formatCurrency(
  n: number,
  currencyCode: string = 'GBP',
  options?: Intl.NumberFormatOptions
): string {
  return getFormatter(currencyCode, options).format(n);
}

export const fmt = (
  n: number,
  options?: Intl.NumberFormatOptions,
  currencyCode: string = 'GBP'
): string => {
  return getFormatter(currencyCode, options).format(n);
};

export function getCurrencySymbol(currencyCode: string = 'GBP'): string {
  try {
    const parts = getFormatter(currencyCode).formatToParts(1);
    const symbolPart = parts.find(p => p.type === 'currency');
    return symbolPart ? symbolPart.value : '£';
  } catch {
    return '£';
  }
}
