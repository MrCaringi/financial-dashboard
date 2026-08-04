import { fetchFirefly, parseNotes, mutateFirefly } from "./client";
import { getCurrentPaydayCycle, formatDateString } from "../payday";
import { Transaction } from "./transactions";
import { getDisplayCurrency } from "../currency";

export interface CreditCardPayment {
  id: string;
  name: string;
  balance: number;
  dueDate: string | null;
  isConfigured: boolean;
  isPaid?: boolean;
}

export interface GroupedAccount {
  id: string;
  name: string;
  balance: number;          // raw balance (negative for credit cards)
  displayBalance: number;   // Math.abs(balance) for credit cards, else balance
  role: string;
  currencySymbol: string;
  lastActivity: string | null;
  isPrimarySource: boolean; // parsed from notes.current_source
  paymentConfig: {          // null if not a configured credit card
    calcType: string;       // "full" | "min"
    statementDay: number;
    dueDay: number;
    minPercent?: number;
    minFloor?: number;
  } | null;
}

export interface AccountGroup {
  label: string;            // "Current Accounts" | "Savings" | "Credit Cards"
  icon: string;             // lucide icon name hint for the frontend
  accounts: GroupedAccount[];
  subtotal: number;         // sum of displayBalance for the group
}

export interface CreditCardConfig {
  calc_type: "full" | "min";
  statement_day: number;
  due_day: number;
  min_percent?: number;
  min_floor?: number;
}

// --- Helpers ---
function clampDay(year: number, month: number, day: number): number {
  const maxDay = new Date(year, month, 0).getDate();
  return Math.min(day, maxDay);
}

function calculateStatementDate(statementDay: number, today: Date): Date {
  const todayDay = today.getDate();
  const todayMonth = today.getMonth() + 1;
  const todayYear = today.getFullYear();

  if (todayDay >= statementDay) {
    // Statement has already generated this month
    const clamped = clampDay(todayYear, todayMonth, statementDay);
    return new Date(todayYear, todayMonth - 1, clamped);
  } else {
    // Statement generated last month
    let prevYear = todayYear;
    let prevMonth = todayMonth - 1;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear--;
    }
    const clamped = clampDay(prevYear, prevMonth, statementDay);
    return new Date(prevYear, prevMonth - 1, clamped);
  }
}

// --- API Calls ---
export async function getAssetAccounts() {
  const data = await fetchFirefly("/accounts", { type: "asset" });
  return data.data; // Array of accounts
}

export async function getLiabilityAccounts() {
  const data = await fetchFirefly("/accounts", { type: "liability" });
  return data.data; // Array of accounts
}

export async function getCreditCardBalances(preFetchedAccounts?: any[]): Promise<CreditCardPayment[]> {
  const today = new Date();
  const { endDate } = getCurrentPaydayCycle(today);
  const nextPayday = new Date(endDate);
  nextPayday.setDate(nextPayday.getDate() + 1); // actual payday

  let accounts = preFetchedAccounts;
  if (!accounts) {
    const [assetData, liabilityData] = await Promise.all([
      fetchFirefly("/accounts", { type: "asset" }),
      fetchFirefly("/accounts", { type: "liability" })
    ]);
    accounts = [...(assetData.data || []), ...(liabilityData.data || [])];
  }
  
  const paymentPromises = accounts.map(async (a: any) => {
    const attr = a.attributes;
    const config = parseNotes(attr.notes);
    
    if (!config || !('statement_day' in config) || !('due_day' in config) || !('calc_type' in config)) {
      if (attr.account_role === "ccAsset" || attr.account_role === "ccLiability" || attr.name.toLowerCase().includes("credit card")) {
        const balance = Math.abs(parseFloat(attr.current_balance || "0"));
        if (balance > 0) {
          return {
            id: String(a.id),
            name: attr.name,
            balance: balance,
            dueDate: null,
            isConfigured: false,
            isPaid: false
          };
        }
      }
      return null;
    }

    const statementDay = config.statement_day;
    const dueDay = config.due_day;
    const calcType = config.calc_type;

    const stmtDate = calculateStatementDate(statementDay, today);
    const dateStr = formatDateString(stmtDate);
    const balanceData = await fetchFirefly(`/accounts/${a.id}`, { date: dateStr });
    const stmtBalance = Math.abs(parseFloat(balanceData.data.attributes.current_balance || "0"));

    if (stmtBalance <= 0) {
      return null;
    }

    let payment = 0;
    if (calcType === 'full') {
      payment = stmtBalance;
    } else if (calcType === 'min') {
      const minPercent = config.min_percent || 0.01;
      const minFloor = config.min_floor || 25.0;
      payment = Math.max(minFloor, stmtBalance * minPercent);
    } else {
      return null;
    }

    const todayMonth = today.getMonth() + 1;
    const todayYear = today.getFullYear();
    
    const dueDayClamped = clampDay(todayYear, todayMonth, dueDay);
    let dueDate = new Date(todayYear, todayMonth - 1, dueDayClamped);

    if (dueDate < today) {
      let ny = todayYear;
      let nm = todayMonth + 1;
      if (nm === 13) {
        nm = 1;
        ny++;
      }
      dueDate = new Date(ny, nm - 1, clampDay(ny, nm, dueDay));
    }

    let isPaid = false;
    try {
      const endDate = new Date(today);
      if (dateStr === formatDateString(today)) {
        endDate.setDate(endDate.getDate() + 1);
      }
      const txParams = {
        start: dateStr,
        end: formatDateString(endDate),
      };
      const txRes = await fetchFirefly(`/accounts/${a.id}/transactions`, txParams);
      const transactionsList = txRes.data || [];
      let totalTransfers = 0;
      for (const tx of transactionsList) {
        const parts = tx.attributes?.transactions || [];
        for (const t of parts) {
          if (
            t.type === "transfer" &&
            t.source_type === "Asset account" &&
            String(t.destination_id) === String(a.id)
          ) {
            totalTransfers += parseFloat(t.amount || "0");
          }
        }
      }
      isPaid = totalTransfers >= payment * 0.95;
    } catch (err) {
      console.warn("Failed to fetch transactions for credit card payment verification:", a.id, err);
    }

    if (dueDate <= nextPayday) {
      return {
        id: String(a.id),
        name: attr.name,
        balance: payment,
        dueDate: formatDateString(dueDate),
        isConfigured: true,
        isPaid
      };
    }
    
    return null;
  });

  const payments = (await Promise.all(paymentPromises)).filter(Boolean) as CreditCardPayment[];
  
  return payments.sort((a, b) => {
    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return 0;
  });
}

export async function getGroupedAccounts(): Promise<AccountGroup[]> {
  const [assetData, liabilityData, defaultDisplayCurrency] = await Promise.all([
    fetchFirefly("/accounts", { type: "asset" }),
    fetchFirefly("/accounts", { type: "liability" }),
    getDisplayCurrency().catch(() => ({ symbol: "£" })),
  ]);

  const allAccounts = [...(assetData.data || []), ...(liabilityData.data || [])];
  const activeAccounts = allAccounts.filter((a: any) => {
    const name = (a.attributes.name || "").toLowerCase();
    return a.attributes.active === true && name !== "credit card clearing";
  });
  
  const liquid: GroupedAccount[] = [];
  const savings: GroupedAccount[] = [];
  const creditCards: GroupedAccount[] = [];

  const sortedAccounts = [...activeAccounts].sort((a: any, b: any) => {
    const orderA = typeof a.attributes.order === 'number' ? a.attributes.order : 0;
    const orderB = typeof b.attributes.order === 'number' ? b.attributes.order : 0;
    return orderA - orderB;
  });

  for (const a of sortedAccounts) {
    const attr = a.attributes;
    const role = attr.account_role || "";
    const balance = parseFloat(attr.current_balance || "0");
    const notes = parseNotes(attr.notes);
    
    const isCc = role === "ccAsset" || role === "ccLiability";
    const displayBalance = isCc ? Math.abs(balance) : balance;
    const isPrimarySource = notes ? notes.current_source === true : false;
    
    let paymentConfig = null;
    if (isCc && notes && 'statement_day' in notes && 'due_day' in notes && 'calc_type' in notes) {
      paymentConfig = {
        calcType: notes.calc_type,
        statementDay: notes.statement_day,
        dueDay: notes.due_day,
        minPercent: notes.min_percent,
        minFloor: notes.min_floor,
      };
    }
    
    const mapped: GroupedAccount = {
      id: String(a.id),
      name: attr.name,
      balance,
      displayBalance,
      role,
      currencySymbol: attr.currency_symbol || defaultDisplayCurrency.symbol || "£",
      lastActivity: attr.last_activity || null,
      isPrimarySource,
      paymentConfig
    };
    
    if (role === "savingAsset") {
      savings.push(mapped);
    } else if (isCc) {
      creditCards.push(mapped);
    } else {
      liquid.push(mapped);
    }
  }

  const getSubtotal = (accList: GroupedAccount[]) => {
    return accList.reduce((sum, acc) => sum + acc.displayBalance, 0);
  };

  return [
    {
      label: "Current Accounts",
      icon: "Wallet",
      accounts: liquid,
      subtotal: getSubtotal(liquid)
    },
    {
      label: "Savings",
      icon: "PiggyBank",
      accounts: savings,
      subtotal: getSubtotal(savings)
    },
    {
      label: "Credit Cards",
      icon: "CreditCard",
      accounts: creditCards,
      subtotal: getSubtotal(creditCards)
    }
  ];
}

export async function updateAccountNotes(accountId: string, patch: Record<string, any>): Promise<void> {
  const accountData = await fetchFirefly(`/accounts/${accountId}`);
  if (!accountData || !accountData.data) {
    throw new Error(`Account ${accountId} not found`);
  }
  
  const attr = accountData.data.attributes;
  const existingNotes = parseNotes(attr.notes) || {};

  const mergedNotes = { ...existingNotes };
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) {
      delete mergedNotes[key];
    } else {
      mergedNotes[key] = value;
    }
  }

  const notesString = Object.keys(mergedNotes).length > 0 ? JSON.stringify(mergedNotes) : "";

  const updateBody: Record<string, any> = {
    name: attr.name,
    type: attr.type,
    notes: notesString,
    account_role: attr.account_role,
    currency_id: attr.currency_id,
    active: attr.active,
    include_net_worth: attr.include_net_worth,
  };

  if (attr.account_role === "ccAsset" || attr.account_role === "ccLiability") {
    updateBody.credit_card_type = attr.credit_card_type || "monthlyFull";
    updateBody.monthly_payment_date = attr.monthly_payment_date || new Date().toISOString();
  }

  const res = await mutateFirefly(`/accounts/${accountId}`, "PUT", updateBody);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to update account notes: ${res.status} ${text}`);
  }
}

const netWorthCache: Record<string, number> = {};

export function clearNetWorthCache() {
  for (const key in netWorthCache) {
    delete netWorthCache[key];
  }
}

export async function getNetWorthHistory(): Promise<{ date: string; netWorth: number }[]> {
  const dates: { dateStr: string; isPast: boolean }[] = [];
  const today = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${day}`;
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const isPast = d < currentMonthStart;
    dates.push({ dateStr, isPast });
  }

  try {
    const results = await Promise.all(
      dates.map(async ({ dateStr, isPast }) => {
        if (isPast && netWorthCache[dateStr] !== undefined) {
          return { date: dateStr, netWorth: netWorthCache[dateStr] };
        }

        const options: RequestInit = isPast ? { next: { revalidate: 86400 } } : {};
        const assets = await fetchFirefly("/accounts", { type: "asset", date: dateStr }, options);
        
        const netWorth = (assets.data || []).reduce((sum: number, a: any) => {
          return sum + parseFloat(a.attributes.current_balance || "0");
        }, 0);

        if (isPast) {
          netWorthCache[dateStr] = netWorth;
        }

        return { date: dateStr, netWorth };
      })
    );
    return results;
  } catch (error) {
    console.error("Failed to fetch net worth history, using mock values", error);
    let mockVal = 11500;
    return dates.map(({ dateStr }) => {
      mockVal += (Math.random() - 0.45) * 800; // general upward trend
      return { date: dateStr, netWorth: Number(mockVal.toFixed(2)) };
    });
  }
}

export async function getAccount(accountId: string): Promise<GroupedAccount> {
  try {
    const data = await fetchFirefly(`/accounts/${accountId}`);
    const a = data.data;
    const attr = a.attributes;
    const role = attr.account_role || "";
    const balance = parseFloat(attr.current_balance || "0");
    const notes = parseNotes(attr.notes);
    
    const isCc = role === "ccAsset" || role === "ccLiability";
    const displayBalance = isCc ? Math.abs(balance) : balance;
    const isPrimarySource = notes ? notes.current_source === true : false;
    
    let paymentConfig = null;
    if (isCc && notes && 'statement_day' in notes && 'due_day' in notes && 'calc_type' in notes) {
      paymentConfig = {
        calcType: notes.calc_type,
        statementDay: notes.statement_day,
        dueDay: notes.due_day,
        minPercent: notes.min_percent,
        minFloor: notes.min_floor,
      };
    }
    
    return {
      id: String(a.id),
      name: attr.name,
      balance,
      displayBalance,
      role,
      currencySymbol: attr.currency_symbol || "£",
      lastActivity: attr.last_activity || null,
      isPrimarySource,
      paymentConfig
    };
  } catch (error) {
    console.error("Failed to fetch account, returning mock data if matching:", accountId, error);
    const allMockAccounts = [
      { id: "2", name: "Demo Current Account", role: "defaultAsset", balance: 1234.56, displayBalance: 1234.56, currencySymbol: "£", lastActivity: "2026-05-23T00:00:00Z", isPrimarySource: true, paymentConfig: null },
      { id: "57", name: "Demo Secondary Account", role: "defaultAsset", balance: 100.00, displayBalance: 100.00, currencySymbol: "£", lastActivity: "2026-05-22T00:00:00Z", isPrimarySource: false, paymentConfig: null },
      { id: "124", name: "Demo Savings", role: "savingAsset", balance: 5000.00, displayBalance: 5000.00, currencySymbol: "£", lastActivity: "2026-05-20T00:00:00Z", isPrimarySource: false, paymentConfig: null },
      { id: "179", name: "Demo ISA", role: "savingAsset", balance: 10000.00, displayBalance: 10000.00, currencySymbol: "£", lastActivity: "2026-05-21T00:00:00Z", isPrimarySource: false, paymentConfig: null },
      { id: "1", name: "Demo Credit Card A", role: "ccAsset", balance: -500.00, displayBalance: 500.00, currencySymbol: "£", lastActivity: "2026-05-20T00:00:00Z", isPrimarySource: false, paymentConfig: { calcType: "full", statementDay: 15, dueDay: 11 } },
      { id: "100", name: "Demo Credit Card B", role: "ccAsset", balance: -250.00, displayBalance: 250.00, currencySymbol: "£", lastActivity: "2026-05-18T00:00:00Z", isPrimarySource: false, paymentConfig: { calcType: "full", statementDay: 5, dueDay: 28 } },
      { id: "130", name: "Demo Credit Card C", role: "ccAsset", balance: -1200.00, displayBalance: 1200.00, currencySymbol: "£", lastActivity: "2026-05-19T00:00:00Z", isPrimarySource: false, paymentConfig: { calcType: "min", minPercent: 0.025, minFloor: 5.00, statementDay: 31, dueDay: 27 } },
      { id: "131", name: "Demo Credit Card D", role: "ccAsset", balance: -800.00, displayBalance: 800.00, currencySymbol: "£", lastActivity: "2026-05-20T00:00:00Z", isPrimarySource: false, paymentConfig: { calcType: "min", minPercent: 0.025, minFloor: 5.00, statementDay: 5, dueDay: 30 } }
    ];
    const mock = allMockAccounts.find(ma => ma.id === accountId);
    if (mock) {
      return mock as GroupedAccount;
    }
    throw error;
  }
}

export async function getAccountTransactions(accountId: string, limit = 15): Promise<Transaction[]> {
  try {
    const data = await fetchFirefly(`/accounts/${accountId}/transactions`, { limit: String(limit) });
    const rawTx = data.data || [];
    
    return rawTx.map((tx: { id: string; attributes: { transactions: { amount: string; transaction_journal_id: number; description?: string; category_name?: string; type: string; date: string }[] } }) => {
      const t = tx.attributes.transactions[0];
      const amount = parseFloat(t.amount);
      return {
        id: tx.id,
        journalId: String(t.transaction_journal_id),
        name: t.description || "Unknown",
        category: t.category_name || "Uncategorized",
        amount: t.type === "withdrawal" ? -amount : amount,
        date: new Date(t.date).toLocaleDateString("en-GB", { month: "short", day: "numeric" })
      };
    });
  } catch (error) {
    console.warn("Failed to fetch transactions for account, using mock fallback:", accountId, error);
    return getMockTransactions(accountId);
  }
}

export function getMockTransactions(accountId: string): Transaction[] {
  const now = new Date();
  const formatMockDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(now.getDate() - daysAgo);
    return d.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
  };

  switch (accountId) {
    case "2":
      return [
        { id: "m201", journalId: "j201", name: "Salary Deposit", category: "Salary", amount: 3500.00, date: formatMockDate(1) },
        { id: "m202", journalId: "j202", name: "Council Tax", category: "Bills", amount: -150.00, date: formatMockDate(2) },
        { id: "m203", journalId: "j203", name: "Transfer to Savings", category: "Transfer", amount: -500.00, date: formatMockDate(3) },
        { id: "m204", journalId: "j204", name: "Tesco Stores", category: "Groceries", amount: -65.40, date: formatMockDate(4) },
        { id: "m205", journalId: "j205", name: "Credit Card Payment", category: "Credit Card Payment", amount: -400.00, date: formatMockDate(5) }
      ];
    case "57":
      return [
        { id: "m5701", journalId: "j5701", name: "Starbucks Coffee", category: "Dining Out", amount: -4.50, date: formatMockDate(3) },
        { id: "m5702", journalId: "j5702", name: "Interest Earned", category: "Interest", amount: 0.12, date: formatMockDate(15) }
      ];
    case "124":
      return [
        { id: "m12401", journalId: "j12401", name: "Monthly Savings Transfer", category: "Transfer", amount: 250.00, date: formatMockDate(5) },
        { id: "m12402", journalId: "j12402", name: "Monthly Savings Transfer", category: "Transfer", amount: 250.00, date: formatMockDate(35) }
      ];
    case "179":
      return [
        { id: "m17901", journalId: "j17901", name: "Deposit from Current Account", category: "Transfer", amount: 1000.00, date: formatMockDate(10) },
        { id: "m17902", journalId: "j17902", name: "Interest Credit", category: "Interest", amount: 48.50, date: formatMockDate(30) }
      ];
    case "1":
      return [
        { id: "m101", journalId: "j101", name: "Amazon UK", category: "Shopping", amount: -45.99, date: formatMockDate(2) },
        { id: "m102", journalId: "j102", name: "Shell Petrol Station", category: "Transport", amount: -55.00, date: formatMockDate(5) },
        { id: "m103", journalId: "j103", name: "Nando's", category: "Dining Out", amount: -32.50, date: formatMockDate(6) }
      ];
    case "100":
      return [
        { id: "m10001", journalId: "j10001", name: "Amazon Prime Video", category: "Entertainment", amount: -8.99, date: formatMockDate(4) },
        { id: "m10002", journalId: "j10002", name: "Sainsbury's Local", category: "Groceries", amount: -12.40, date: formatMockDate(8) }
      ];
    case "130":
      return [
        { id: "m13001", journalId: "j13001", name: "Steam Games", category: "Entertainment", amount: -29.99, date: formatMockDate(7) },
        { id: "m13002", journalId: "j13002", name: "ASOS", category: "Shopping", amount: -42.00, date: formatMockDate(12) }
      ];
    case "131":
      return [
        { id: "m13101", journalId: "j13101", name: "M&S Simply Food", category: "Groceries", amount: -24.50, date: formatMockDate(3) },
        { id: "m13102", journalId: "j13102", name: "M&S Clothing", category: "Shopping", amount: -85.00, date: formatMockDate(10) }
      ];
    default:
      return [
        { id: `mock-${accountId}-1`, journalId: `mj-${accountId}-1`, name: "Mock Transaction 1", category: "Leisure", amount: -20.00, date: formatMockDate(2) },
        { id: `mock-${accountId}-2`, journalId: `mj-${accountId}-2`, name: "Mock Transfer", category: "Transfer", amount: 100.00, date: formatMockDate(5) }
      ];
  }
}

export async function getCreditCardPayments(accountId: string): Promise<Transaction[]> {
  try {
    // Set start date 3 years back to capture full payment history
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 3);
    const startStr = formatDateString(startDate);
    const todayStr = formatDateString(new Date());

    // Fetch first page to determine total pages
    const firstPageData = await fetchFirefly(
      `/accounts/${accountId}/transactions`,
      { start: startStr, end: todayStr, page: "1" },
      { cache: "no-store" }
    );
    const totalPages = firstPageData?.meta?.pagination?.total_pages || 1;
    let allTx = firstPageData?.data || [];

    // Fetch remaining pages in parallel if needed
    if (totalPages > 1) {
      const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
      const remainingResults = await Promise.all(
        remainingPages.map(async (page) => {
          const data = await fetchFirefly(
            `/accounts/${accountId}/transactions`,
            { start: startStr, end: todayStr, page: String(page) },
            { cache: "no-store" }
          );
          return data?.data || [];
        })
      );
      allTx = [...allTx, ...remainingResults.flat()];
    }

    const payments: Transaction[] = [];
    for (const tx of allTx) {
      const t = tx.attributes?.transactions?.[0];
      if (!t) continue;

      const isTransferToCard = t.type === "transfer" && String(t.destination_id) === String(accountId);
      const isDepositToCard = t.type === "deposit" && String(t.destination_id) === String(accountId);
      const isCcPaymentCategory = t.category_name?.toLowerCase().includes("credit card payment");

      if ((isTransferToCard || isDepositToCard) && isCcPaymentCategory) {
        const amount = parseFloat(t.amount);
        payments.push({
          id: tx.id,
          journalId: String(t.transaction_journal_id),
          name: t.description || "Credit Card Payment",
          category: t.category_name || "Credit Card Payment",
          amount: amount,
          date: new Date(t.date).toLocaleDateString("en-GB", { month: "short", day: "numeric" }),
          rawDate: t.date
        } as any);
      }
    }

    // Sort newest first
    return payments.sort((a: any, b: any) =>
      new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime()
    );
  } catch (error) {
    console.warn("Failed to fetch payments for credit card, using mock fallback:", accountId, error);
    return getMockPayments(accountId);
  }
}

export function getMockPayments(accountId: string): Transaction[] {
  const formatMockDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
  };
  const formatMockRawDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  return [
    { id: `pay-${accountId}-1`, journalId: `jpay-${accountId}-1`, name: "Account Transfer", category: "Credit Card Payment", amount: 450.00, date: formatMockDate(5), rawDate: formatMockRawDate(5) } as any,
    { id: `pay-${accountId}-2`, journalId: `jpay-${accountId}-2`, name: "Account Transfer", category: "Credit Card Payment", amount: 400.00, date: formatMockDate(35), rawDate: formatMockRawDate(35) } as any,
    { id: `pay-${accountId}-3`, journalId: `jpay-${accountId}-3`, name: "Account Transfer", category: "Credit Card Payment", amount: 350.00, date: formatMockDate(65), rawDate: formatMockRawDate(65) } as any,
    { id: `pay-${accountId}-4`, journalId: `jpay-${accountId}-4`, name: "Account Transfer", category: "Credit Card Payment", amount: 500.00, date: formatMockDate(95), rawDate: formatMockRawDate(95) } as any,
  ];
}

