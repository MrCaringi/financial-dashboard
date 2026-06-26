import { fetchFirefly, mutateFirefly, getActiveApiUrl, getActivePat } from "./client";
import { formatDateString } from "../payday";

export interface Transaction {
  id: string;
  journalId: string;
  name: string;
  category: string;
  amount: number;
  date: string;
}

export interface RichTransaction extends Transaction {
  type: "withdrawal" | "deposit" | "transfer";
  sourceAccount: string;
  destinationAccount: string;
  rawDate: string;
}

export interface CycleSummary {
  income: number;
  expenses: number;
}

export interface CategorySummary {
  category: string;
  amount: number;
}

export interface CycleFullData {
  summary: CycleSummary;
  expenseBreakdown: CategorySummary[];
  incomeBreakdown: CategorySummary[];
}

export interface CategorySpendingPeriod {
  id: string;
  label: string;
  amount: number;
}

export async function getTransactionsForLastDays(days = 7): Promise<Transaction[]> {
  const today = new Date();
  const startDate = new Date();
  startDate.setDate(today.getDate() - days);
  
  const startStr = formatDateString(startDate);
  const endStr = formatDateString(today);
  
  const data = await getCycleTransactions(startStr, endStr);
  
  return data
    .map((tx: any) => {
      const t = tx.attributes.transactions[0];
      const amount = parseFloat(t.amount);
      return {
        id: tx.id,
        journalId: String(t.transaction_journal_id),
        name: t.description || "Unknown",
        category: t.category_name || "Uncategorized",
        amount: t.type === "withdrawal" ? -amount : amount,
        dateStr: t.date,
        date: new Date(t.date).toLocaleDateString("en-GB", { month: "short", day: "numeric" })
      };
    })
    .sort((a: any, b: any) => new Date(b.dateStr).getTime() - new Date(a.dateStr).getTime())
    .map(({ dateStr: _, ...rest }: any) => rest as Transaction);
}

export async function getAllRichTransactions(days = 90): Promise<RichTransaction[]> {
  try {
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - days);
    
    const startStr = formatDateString(startDate);
    const endStr = formatDateString(today);
    
    const data = await getCycleTransactions(startStr, endStr);
    
    return data
      .map((tx: any) => {
        const t = tx.attributes.transactions[0];
        const amount = parseFloat(t.amount);
        return {
          id: tx.id,
          journalId: String(t.transaction_journal_id),
          name: t.description || "Unknown",
          category: t.category_name || "Uncategorized",
          amount: t.type === "withdrawal" ? -amount : amount,
          type: t.type as "withdrawal" | "deposit" | "transfer",
          sourceAccount: t.source_name || "Unknown",
          destinationAccount: t.destination_name || "Unknown",
          rawDate: t.date,
          date: new Date(t.date).toLocaleDateString("en-GB", { month: "short", day: "numeric" })
        };
      })
      .sort((a: any, b: any) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime());
  } catch (error) {
    console.warn(`Failed to fetch rich transactions from API, falling back to mock generator`, error);
    return getMockRichTransactions(days);
  }
}

export function getMockRichTransactions(days = 90): RichTransaction[] {
  const now = new Date();
  const transactions: RichTransaction[] = [];
  
  const categoriesList = [
    "Groceries", "Bills", "Dining Out", "Shopping", "Transport", 
    "Entertainment", "Salary", "Interest", "Credit Card Payment"
  ];
  
  const sources = [
    "Demo Current Account", "Demo Secondary", "Employer Co", "Demo Third Current"
  ];
  
  const destinations = [
    "Tesco Stores", "Council Tax", "Sainsbury's", "Shell Petrol", "Nando's",
    "Online Retailer", "Digital Games", "Demo Credit Card A", "Demo Credit Card B"
  ];

  for (let i = 0; i < days * 2; i++) {
    const d = new Date();
    d.setDate(now.getDate() - Math.floor(Math.random() * days));
    
    const isIncome = Math.random() < 0.15;
    const isTransfer = !isIncome && Math.random() < 0.15;
    
    let type: "withdrawal" | "deposit" | "transfer" = "withdrawal";
    let category = "Uncategorized";
    let amount = parseFloat((Math.random() * 80 + 5).toFixed(2));
    let source = sources[Math.floor(Math.random() * sources.length)];
    let destination = destinations[Math.floor(Math.random() * destinations.length)];
    let name = destination;

    if (isIncome) {
      type = "deposit";
      category = Math.random() < 0.8 ? "Salary" : "Interest";
      amount = category === "Salary" ? 3500.00 : parseFloat((Math.random() * 20).toFixed(2));
      source = category === "Salary" ? "Employer Co" : "Savings Bank";
      destination = "Demo Current Account";
      name = category === "Salary" ? "Salary Deposit" : "Interest Paid";
    } else if (isTransfer) {
      type = "transfer";
      category = "Transfer";
      amount = parseFloat((Math.random() * 400 + 100).toFixed(2));
      source = "Demo Current Account";
      destination = Math.random() < 0.5 ? "Demo ISA" : "Demo Savings";
      name = `Transfer to ${destination}`;
    } else {
      category = categoriesList[Math.floor(Math.random() * (categoriesList.length - 3))];
    }
    
    transactions.push({
      id: `mock-rich-${i}`,
      journalId: `jrich-${i}`,
      name,
      category,
      amount: type === "withdrawal" ? -amount : amount,
      type,
      sourceAccount: source,
      destinationAccount: destination,
      rawDate: d.toISOString().split('T')[0],
      date: d.toLocaleDateString("en-GB", { month: "short", day: "numeric" })
    });
  }

  return transactions.sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime());
}

export async function getUncategorizedTransactions(days = 30): Promise<Transaction[]> {
  try {
    const data = await fetchFirefly(
      "/search/transactions",
      {
        query: "has_no_category:true",
        limit: "100",
      },
      { cache: "no-store" }
    );
    
    const rawTx = data.data || [];
    
    const sortedTx = rawTx.sort((a: any, b: any) => {
      const dateA = new Date(a.attributes.transactions[0].date).getTime();
      const dateB = new Date(b.attributes.transactions[0].date).getTime();
      return dateB - dateA;
    });

    const today = new Date();
    const cutoffDate = new Date();
    cutoffDate.setDate(today.getDate() - days);
    cutoffDate.setHours(0, 0, 0, 0);

    const uncategorized: Transaction[] = [];

    for (const tx of sortedTx) {
      const t = tx.attributes.transactions[0];
      if (
        (t.type === "withdrawal" || t.type === "deposit" || t.type === "transfer") &&
        (!t.category_name || t.category_name.trim() === "")
      ) {
        const txDate = new Date(t.date);
        if (txDate >= cutoffDate) {
          const amount = parseFloat(t.amount);
          uncategorized.push({
            id: tx.id,
            journalId: String(t.transaction_journal_id),
            name: t.description || "Unknown",
            category: "Uncategorized",
            amount: t.type === "withdrawal" ? -amount : amount,
            date: txDate.toLocaleDateString("en-GB", { month: "short", day: "numeric" }),
          });
        }
      }
    }
    return uncategorized;
  } catch (error) {
    console.error("Failed to fetch uncategorized transactions, returning empty list", error);
    return [];
  }
}

export async function updateTransactionCategory(transactionId: string, journalId: string, category: string): Promise<void> {
  const existing = await fetchFirefly(`/transactions/${transactionId}`);
  const tx = existing.data;
  const journals = tx.attributes.transactions;

  const updatedJournals = journals.map((j: any) => {
    if (String(j.transaction_journal_id) === journalId) {
      const { category_id: _, ...rest } = j;
      return { ...rest, category_name: category };
    }
    return j;
  });

  const response = await mutateFirefly(`/transactions/${transactionId}`, "PUT", { transactions: updatedJournals });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to update transaction: ${response.status} ${text}`);
  }
}

export async function getTransaction(id: string): Promise<any> {
  const response = await fetchFirefly(`/transactions/${id}`, {}, { cache: "no-store" });
  return response.data;
}

export async function deleteTransaction(id: string): Promise<void> {
  const apiUrl = getActiveApiUrl();
  const url = `${apiUrl}/api/v1/transactions/${id}`;
  const pat = getActivePat();
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${pat}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to delete transaction: ${response.status} ${text}`);
  }
}

export async function updateTransaction(id: string, payload: { transactions: any[] }): Promise<void> {
  const response = await mutateFirefly(`/transactions/${id}`, "PUT", payload);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to update transaction: ${response.status} ${text}`);
  }
}

export async function getCycleTransactions(start: string, end: string, options: RequestInit = {}) {
  const firstPageData = await fetchFirefly("/transactions", { start, end, page: "1" }, options);
  const firstPageTransactions = firstPageData?.data || [];
  const totalPages = firstPageData?.meta?.pagination?.total_pages || 1;

  if (totalPages <= 1) {
    return firstPageTransactions;
  }

  const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
  const remainingResults = await Promise.all(
    remainingPages.map(async (page) => {
      const data = await fetchFirefly("/transactions", { start, end, page: page.toString() }, options);
      return data?.data || [];
    })
  );

  return [...firstPageTransactions, ...remainingResults.flat()];
}

export async function getCycleSummary(start: string, end: string, options: RequestInit = {}): Promise<CycleSummary> {
  const transactions = await getCycleTransactions(start, end, options);
  let income = 0;
  let expenses = 0;

  for (const tx of transactions) {
    const t = tx.attributes.transactions[0];
    const amount = parseFloat(t.amount);
    if (t.type === "deposit") {
      income += amount;
    } else if (t.type === "withdrawal") {
      expenses += amount;
    }
  }

  return { income, expenses };
}

export function computeCycleSummaryFromTransactions(transactions: any[]): { income: number; expenses: number } {
  let income = 0;
  let expenses = 0;

  for (const tx of transactions) {
    const t = tx.attributes?.transactions?.[0];
    if (t) {
      const amount = parseFloat(t.amount);
      if (t.type === "deposit") {
        income += amount;
      } else if (t.type === "withdrawal") {
        expenses += amount;
      }
    }
  }

  return { income, expenses };
}

export async function getCycleFullData(start: string, end: string): Promise<CycleFullData> {
  const transactions = await getCycleTransactions(start, end);

  let income = 0;
  let expenses = 0;
  const categoryMap: Record<string, number> = {};
  const sourceMap: Record<string, number> = {};

  for (const tx of transactions) {
    const t = tx.attributes.transactions[0];
    const amount = parseFloat(t.amount);

    if (t.type === 'deposit') {
      income += amount;
      const source = t.category_name || t.source_name || 'Income';
      sourceMap[source] = (sourceMap[source] || 0) + amount;
    } else if (t.type === 'withdrawal') {
      expenses += amount;
      const cat = t.category_name || 'Uncategorized';
      categoryMap[cat] = (categoryMap[cat] || 0) + amount;
    }
  }

  return {
    summary: { income, expenses },
    expenseBreakdown: Object.entries(categoryMap)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount),
    incomeBreakdown: Object.entries(sourceMap)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount),
  };
}

export interface CategoryTransaction extends Transaction {
  dateStr: string;
}

export async function getCategoryTransactions(
  start: string,
  end: string,
  category: string,
  txType: 'income' | 'expenses' = 'expenses',
  options: RequestInit = {}
): Promise<CategoryTransaction[]> {
  const transactions = await getCycleTransactions(start, end, options);
  const decodedCategory = decodeURIComponent(category).toLowerCase();

  return transactions
    .map((tx: any) => {
      const t = tx.attributes.transactions[0];
      const amount = parseFloat(t.amount);
      const categoryLabel = txType === 'income'
        ? (t.category_name || t.source_name || 'Income')
        : (t.category_name || 'Uncategorized');
      return {
        id: tx.id,
        journalId: String(t.transaction_journal_id),
        name: t.description || 'Unknown',
        category: categoryLabel,
        amount: t.type === 'withdrawal' ? -amount : amount,
        dateStr: t.date,
        date: new Date(t.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
        txTypeFilter: t.type,
      };
    })
    .filter((t: any) => {
      const typeMatch = txType === 'income' ? t.txTypeFilter === 'deposit' : t.txTypeFilter === 'withdrawal';
      return typeMatch && t.category.toLowerCase() === decodedCategory;
    })
    .sort((a: any, b: any) => new Date(b.dateStr).getTime() - new Date(a.dateStr).getTime())
    .map(({ txTypeFilter: _tf, ...rest }: any) => rest as CategoryTransaction);
}

export async function getCategorySpendingHistory(
  category: string,
  txType: 'income' | 'expenses',
  cycles: { startDate: Date, endDate: Date, label: string, id: string }[]
): Promise<CategorySpendingPeriod[]> {
  const today = new Date();

  try {
    const results = await Promise.all(
      cycles.map(async (cycle) => {
        const startStr = formatDateString(cycle.startDate);
        const endStr = formatDateString(cycle.endDate);
        const isPastCycle = cycle.endDate < today;
        const options: RequestInit = isPastCycle ? { next: { revalidate: 86400 } } : {};
        
        const txs = await getCategoryTransactions(
          startStr,
          endStr,
          category,
          txType,
          options
        );
        
        const total = txs.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
        return {
          id: cycle.id,
          label: cycle.label,
          amount: Number(total.toFixed(2)),
        };
      })
    );
    return results;
  } catch (error) {
    console.warn("Failed to fetch category history, falling back to mock data:", category, error);
    const lowerCategory = category.toLowerCase();
    
    return cycles.map((cycle, index) => {
      let baseAmount = 100;
      let randomness = 30;
      
      if (lowerCategory.includes("mortgage") || lowerCategory.includes("rent")) {
        baseAmount = 1250;
        randomness = 0;
      } else if (lowerCategory.includes("grocery") || lowerCategory.includes("groceries")) {
        baseAmount = 380;
        randomness = 60;
      } else if (lowerCategory.includes("bill") || lowerCategory.includes("utilities")) {
        baseAmount = 220;
        randomness = 40;
      } else if (lowerCategory.includes("entertainment") || lowerCategory.includes("leisure")) {
        baseAmount = 120;
        randomness = 50;
      } else if (lowerCategory.includes("transport") || lowerCategory.includes("fuel") || lowerCategory.includes("travel")) {
        baseAmount = 80;
        randomness = 25;
      } else if (lowerCategory.includes("dining") || lowerCategory.includes("eating") || lowerCategory.includes("food")) {
        baseAmount = 150;
        randomness = 45;
      } else if (lowerCategory.includes("salary")) {
        baseAmount = 3500;
        randomness = 0;
      } else {
        baseAmount = 75 + (index % 3) * 20;
        randomness = 30;
      }
      
      const noise = randomness > 0 ? (Math.random() - 0.5) * randomness : 0;
      const amount = Math.max(0, baseAmount + noise);
      
      return {
        id: cycle.id,
        label: cycle.label,
        amount: Number(amount.toFixed(2)),
      };
    });
  }
}
