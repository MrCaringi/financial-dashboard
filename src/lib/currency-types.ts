export interface DisplayCurrency {
  code: string;
  symbol: string;
  name: string;
  decimalPlaces: number;
}

export const DEFAULT_DISPLAY_CURRENCY: DisplayCurrency = {
  code: "GBP",
  symbol: "£",
  name: "British Pound",
  decimalPlaces: 2,
};
