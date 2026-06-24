/**
 * Shared currency formatter — create once, reuse everywhere.
 * Avoids constructing a new Intl.NumberFormat on every render.
 */
const gbpFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
});

export const fmt = (n: number, options?: Intl.NumberFormatOptions): string => {
  if (options) {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      ...options,
    }).format(n);
  }
  return gbpFormatter.format(n);
};
