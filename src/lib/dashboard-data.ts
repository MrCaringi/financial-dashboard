import {
  getAssetAccounts,
  getLiabilityAccounts,
  getBillsForCurrentCycle,
  getCreditCardBalances,
  getTransactionsForLastDays,
  getCategories,
  getCycleTransactions,
  getNetWorthHistory,
  parseNotes
} from "@/lib/firefly";
import { getPastPaydayCycles, formatDateString } from "@/lib/payday";

export interface ProjectedPayment {
  id: string;
  billId?: string;
  accountId?: string;
  name: string;
  amount: number;
  dueDate: string;
  type: "subscription" | "card_payment";
  projectedBalance: number;
}

export async function getAccountsSummaryData(_now = new Date()) {
  try {
    const [assetAccounts, liabilityAccounts, billsList, netWorthHistory] = await Promise.all([
      getAssetAccounts(),
      getLiabilityAccounts(),
      getBillsForCurrentCycle(),
      getNetWorthHistory(),
    ]);

    const allAccounts = [...(assetAccounts || []), ...(liabilityAccounts || [])];
    const creditCards = await getCreditCardBalances(allAccounts).catch(() => []);

    const netWorth = (assetAccounts || []).reduce((sum: number, account: any) => {
      return sum + parseFloat(account.attributes.current_balance || "0");
    }, 0);

    const primaryAccount = (assetAccounts || []).find((a: any) => {
      const notes = parseNotes(a.attributes.notes);
      return (notes && notes.current_source === true) || a.attributes.name === "Demo Current Account";
    });
    const currentBalance = primaryAccount ? parseFloat(primaryAccount.attributes.current_balance || "0") : 0;

    const unpaidBills = billsList.reduce((sum, bill) => {
      if (!bill.isPaid && bill.expectedInCycle) {
        return sum + bill.amount;
      }
      return sum;
    }, 0);

    const creditCardSum = creditCards.reduce((sum, cc) => {
      if (cc.isPaid) return sum;
      return sum + cc.balance;
    }, 0);
    const reservedAmount = unpaidBills + creditCardSum;

    // Calculate projected payments to find finalProjectedBalance
    const upcomingPayments = [
      ...billsList
        .filter((b) => !b.isPaid && b.expectedInCycle)
        .map((b) => ({
          id: `bill-${b.name}-${b.dueDate}`,
          billId: b.id,
          name: b.name,
          amount: b.amount,
          dueDate: b.dueDate,
          type: "subscription" as const,
        })),
      ...creditCards
        .filter((c) => c.dueDate !== null && c.balance > 0 && !c.isPaid)
        .map((c) => ({
          id: `card-${c.name}-${c.dueDate}`,
          accountId: c.id,
          name: c.name,
          amount: c.balance,
          dueDate: c.dueDate as string,
          type: "card_payment" as const,
        })),
    ];
    upcomingPayments.sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    let runningBalance = currentBalance;
    const projectedPayments = upcomingPayments.map((payment) => {
      runningBalance -= payment.amount;
      return {
        ...payment,
        projectedBalance: runningBalance,
      };
    });

    return {
      safeToSpend: netWorth,
      currentBalance,
      reservedAmount,
      finalProjectedBalance: runningBalance,
      projectedPayments,
      netWorthHistory,
      isMock: false,
    };
  } catch (error) {
    console.error("Failed to fetch accounts summary data, using mock fallback", error);
    // Mock data fallback
    let mockNetVal = 11500;
    const netWorthHistory = Array.from({ length: 12 }, (_, i) => {
      mockNetVal += (Math.random() - 0.42) * 900;
      return { date: `Month ${i+1}`, netWorth: Number(mockNetVal.toFixed(2)) };
    });
    return {
      safeToSpend: 2450.75,
      currentBalance: 3800.50,
      reservedAmount: 1349.75,
      finalProjectedBalance: 3184.51,
      projectedPayments: [
        { id: "bill-netflix", billId: "mock-netflix", name: "Netflix", amount: 15.99, dueDate: "2026-05-28", type: "subscription" as const, projectedBalance: 3784.51 },
        { id: "card-demo-cc", accountId: "1", name: "Demo Credit Card A", amount: 450.00, dueDate: "2026-06-11", type: "card_payment" as const, projectedBalance: 3334.51 },
        { id: "bill-council-tax", billId: "mock-council-tax", name: "Council Tax", amount: 150.00, dueDate: "2026-06-15", type: "subscription" as const, projectedBalance: 3184.51 }
      ],
      netWorthHistory,
      isMock: true,
    };
  }
}

export async function getBurnComparisonData(now = new Date()) {
  try {
    const pastCycles = getPastPaydayCycles(7, now);
    const currentCycle = pastCycles[6];
    const prevCycle = pastCycles[5];

    const [currentTransactions, prevTransactions] = await Promise.all([
      getCycleTransactions(formatDateString(currentCycle.startDate), formatDateString(currentCycle.endDate)),
      getCycleTransactions(formatDateString(prevCycle.startDate), formatDateString(prevCycle.endDate), { next: { revalidate: 86400 } }),
    ]);

    const currentCumulative = getCumulativeDailyBurn(currentTransactions, currentCycle.startDate, currentCycle.endDate, true, now);
    const prevCumulative = getCumulativeDailyBurn(prevTransactions, prevCycle.startDate, prevCycle.endDate, false, now);

    let prevExpenses = 0;
    prevTransactions.forEach((tx: any) => {
      const t = tx.attributes?.transactions?.[0];
      if (t && t.type === "withdrawal") {
        prevExpenses += parseFloat(t.amount);
      }
    });

    return {
      currentCumulative,
      prevCumulative,
      prevExpenses,
      isMock: false,
    };
  } catch (error) {
    console.error("Failed to fetch burn comparison data, using mock fallback", error);
    const mockPrevBurn: number[] = [];
    const mockCurrentBurn: number[] = [];
    let sumPrev = 0;
    let sumCurr = 0;
    for (let i = 0; i < 30; i++) {
      sumPrev += Math.random() > 0.4 ? Math.random() * 80 + 10 : 12;
      mockPrevBurn.push(Number(sumPrev.toFixed(2)));
      if (i < 18) {
        sumCurr += Math.random() > 0.35 ? Math.random() * 95 + 12 : 14;
        mockCurrentBurn.push(Number(sumCurr.toFixed(2)));
      }
    }
    return {
      currentCumulative: mockCurrentBurn,
      prevCumulative: mockPrevBurn,
      prevExpenses: 1210.94,
      isMock: true,
    };
  }
}

export async function getRecentActivityData() {
  try {
    const [recentTransactions, categories] = await Promise.all([
      getTransactionsForLastDays(7),
      getCategories(),
    ]);
    return { recentTransactions, categories };
  } catch (error) {
    console.error("Failed to fetch recent activity, using mock fallback", error);
    return {
      recentTransactions: [
        { id: "mock-1", journalId: "mock-j1", name: "Grocery Store", category: "Groceries", amount: -124.50, date: "Today" },
        { id: "mock-2", journalId: "mock-j2", name: "Coffee Shop", category: "Food & Drink", amount: -4.50, date: "Yesterday" }
      ],
      categories: ["Groceries", "Food & Drink", "Entertainment", "Utilities", "Transport"],
    };
  }
}

export async function getUpcomingPaymentsData() {
  try {
    const [assetAccounts, liabilityAccounts, billsList] = await Promise.all([
      getAssetAccounts(),
      getLiabilityAccounts(),
      getBillsForCurrentCycle(),
    ]);

    const allAccounts = [...(assetAccounts || []), ...(liabilityAccounts || [])];
    const creditCards = await getCreditCardBalances(allAccounts).catch(() => []);

    const primaryAccount = (assetAccounts || []).find((a: any) => {
      const notes = parseNotes(a.attributes.notes);
      return (notes && notes.current_source === true) || a.attributes.name === "Demo Current Account";
    });
    const currentBalance = primaryAccount ? parseFloat(primaryAccount.attributes.current_balance || "0") : 0;

    const upcomingPayments = [
      ...billsList
        .filter((b) => !b.isPaid && b.expectedInCycle)
        .map((b) => ({
          id: `bill-${b.name}-${b.dueDate}`,
          billId: b.id,
          name: b.name,
          amount: b.amount,
          dueDate: b.dueDate,
          type: "subscription" as const,
        })),
      ...creditCards
        .filter((c) => c.dueDate !== null && c.balance > 0 && !c.isPaid)
        .map((c) => ({
          id: `card-${c.name}-${c.dueDate}`,
          accountId: c.id,
          name: c.name,
          amount: c.balance,
          dueDate: c.dueDate as string,
          type: "card_payment" as const,
        })),
    ];
    upcomingPayments.sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    let runningBalance = currentBalance;
    const projectedPayments = upcomingPayments.map((payment) => {
      runningBalance -= payment.amount;
      return {
        ...payment,
        projectedBalance: runningBalance,
      };
    });

    return {
      billsList,
      creditCards,
      projectedPayments,
    };
  } catch (error) {
    console.error("Failed to fetch upcoming payments, using mock fallback", error);
    const billsList = [
      { id: "mock-netflix", name: "Netflix", amount: 15.99, dueDate: "2026-05-28", isPaid: false, expectedInCycle: true },
      { id: "mock-council-tax", name: "Council Tax", amount: 150.00, dueDate: "2026-06-15", isPaid: false, expectedInCycle: true }
    ];
    const creditCards = [
      { id: "1", name: "Demo Credit Card A", balance: 450.00, dueDate: "2026-06-11", isConfigured: true }
    ];
    const projectedPayments = [
      { id: "bill-netflix", billId: "mock-netflix", name: "Netflix", amount: 15.99, dueDate: "2026-05-28", type: "subscription" as const, projectedBalance: 3784.51 },
      { id: "card-demo-cc", accountId: "1", name: "Demo Credit Card A", amount: 450.00, dueDate: "2026-06-11", type: "card_payment" as const, projectedBalance: 3334.51 },
      { id: "bill-council-tax", billId: "mock-council-tax", name: "Council Tax", amount: 150.00, dueDate: "2026-06-15", type: "subscription" as const, projectedBalance: 3184.51 }
    ];
    return {
      billsList,
      creditCards,
      projectedPayments,
    };
  }
}

function getCumulativeDailyBurn(
  transactions: any[],
  startDate: Date,
  endDate: Date,
  limitToToday = false,
  now = new Date()
) {
  const msPerDay = 1000 * 60 * 60 * 24;
  const startMs = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime();
  const endMs = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()).getTime();
  const totalDays = Math.max(1, Math.round((endMs - startMs) / msPerDay) + 1);

  const dailyAmounts = new Array(totalDays).fill(0);

  transactions.forEach((tx: any) => {
    const t = tx.attributes?.transactions?.[0];
    if (t && t.type === "withdrawal") {
      const txDate = new Date(t.date);
      const txMs = new Date(txDate.getFullYear(), txDate.getMonth(), txDate.getDate()).getTime();
      const dayIndex = Math.round((txMs - startMs) / msPerDay);
      if (dayIndex >= 0 && dayIndex < totalDays) {
        dailyAmounts[dayIndex] += parseFloat(t.amount);
      }
    }
  });

  const cumulative: number[] = [];
  let runningSum = 0;
  
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const daysElapsed = Math.round((todayMidnight - startMs) / msPerDay);

  for (let i = 0; i < totalDays; i++) {
    if (limitToToday && i > daysElapsed) {
      break;
    }
    runningSum += dailyAmounts[i];
    cumulative.push(Number(runningSum.toFixed(2)));
  }

  return cumulative;
}
