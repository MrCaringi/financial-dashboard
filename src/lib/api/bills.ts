import { fetchFirefly } from "./client";
import { getCurrentPaydayCycle, formatDateString } from "../payday";
import { Transaction } from "./transactions";

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  expectedInCycle: boolean;
  amountMin?: number;
  amountMax?: number;
  nextExpectedPayment?: string;
  extensionUrl?: string;
  active?: boolean;
  repeatFreq?: string;
  /** Anchor date (YYYY-MM-DD) used by Firefly for recurring calculations */
  date?: string;
}

export async function getBillsForCurrentCycle(): Promise<Bill[]> {
  const { startDate, endDate } = getCurrentPaydayCycle();
  const startStr = formatDateString(startDate);
  const endStr = formatDateString(endDate);
  
  const data = await fetchFirefly("/bills", { start: startStr, end: endStr });
  const rawBills = data.data || [];
  
  const bills: Bill[] = [];
  
  for (const bill of rawBills) {
    const attr = bill.attributes;
    if (!attr.active) continue;
    
    const paidDates = attr.paid_dates || [];
    const isPaid = paidDates.length > 0;
    
    const expectedPayDates = attr.pay_dates || [];
    const hasPayDateInCycle = expectedPayDates.some((dateStr: string) => {
      const date = dateStr.substring(0, 10);
      return date >= startStr && date <= endStr;
    });
    
    const expectedInCycle = isPaid || hasPayDateInCycle;
    
    if (expectedInCycle) {
      let dueDate = "";
      if (hasPayDateInCycle) {
        dueDate = expectedPayDates.find((dateStr: string) => {
          const date = dateStr.substring(0, 10);
          return date >= startStr && date <= endStr;
        }) || expectedPayDates[0];
      } else if (isPaid && paidDates.length > 0) {
        dueDate = paidDates[0].date;
      } else {
        dueDate = startStr;
      }
      
      const amount = (parseFloat(attr.amount_min) + parseFloat(attr.amount_max)) / 2;
      
      bills.push({
        id: bill.id,
        name: attr.name,
        amount,
        dueDate: dueDate.substring(0, 10),
        isPaid,
        expectedInCycle,
        amountMin: parseFloat(attr.amount_min),
        amountMax: parseFloat(attr.amount_max),
        nextExpectedPayment: attr.next_expected_payment,
        extensionUrl: attr.extension_url || undefined,
        active: attr.active,
        repeatFreq: attr.repeat_freq,
      });
    }
  }
  
  return bills.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

export async function getBillDetails(id: string): Promise<Bill> {
  const data = await fetchFirefly(`/bills/${id}`);
  const bill = data.data;
  const attr = bill.attributes;
  const amount = (parseFloat(attr.amount_min) + parseFloat(attr.amount_max)) / 2;
  
  return {
    id: bill.id,
    name: attr.name,
    amount,
    dueDate: attr.next_expected_match ? attr.next_expected_match.substring(0, 10) : "",
    isPaid: (attr.paid_dates || []).length > 0,
    expectedInCycle: attr.active,
    amountMin: parseFloat(attr.amount_min),
    amountMax: parseFloat(attr.amount_max),
    nextExpectedPayment: attr.next_expected_match,
    extensionUrl: attr.extension_url || undefined,
    active: attr.active,
    repeatFreq: attr.repeat_freq,
    date: attr.date ? attr.date.substring(0, 10) : undefined,
  };
}

export async function getBillTransactions(id: string): Promise<Transaction[]> {
  try {
    const data = await fetchFirefly(`/bills/${id}/transactions`);
    const rawTx = data.data || [];
    
    return rawTx.map((tx: any) => {
      const t = tx.attributes.transactions[0];
      const amount = parseFloat(t.amount);
      return {
        id: tx.id,
        journalId: String(t.transaction_journal_id),
        name: t.description || "Unknown",
        category: t.category_name || "Uncategorized",
        amount: t.type === "withdrawal" ? -amount : amount,
        date: new Date(t.date).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" }),
        rawDate: t.date
      };
    }).sort((a: any, b: any) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime())
      .map(({ rawDate: _, ...rest }: any) => rest as Transaction);
  } catch (error) {
    console.error(`Failed to fetch transactions for bill ${id}`, error);
    return [];
  }
}

export async function createBill(payload: {
  name: string;
  amountMin: number;
  amountMax: number;
  repeatFreq: string;
  active?: boolean;
  date?: string;
}): Promise<Bill> {
  // Firefly III requires `date` — default to today if not provided
  const date = payload.date || new Date().toISOString().substring(0, 10);
  const data = await fetchFirefly(
    "/bills",
    {},
    {
      method: "POST",
      body: JSON.stringify({
        name: payload.name,
        amount_min: String(payload.amountMin),
        amount_max: String(payload.amountMax),
        repeat_freq: payload.repeatFreq,
        active: payload.active ?? true,
        date,
      }),
      cache: "no-store",
    }
  );
  const bill = data.data;
  const attr = bill.attributes;
  return {
    id: bill.id,
    name: attr.name,
    amount: (parseFloat(attr.amount_min) + parseFloat(attr.amount_max)) / 2,
    dueDate: attr.next_expected_match ? attr.next_expected_match.substring(0, 10) : "",
    isPaid: (attr.paid_dates || []).length > 0,
    expectedInCycle: attr.active,
    amountMin: parseFloat(attr.amount_min),
    amountMax: parseFloat(attr.amount_max),
    nextExpectedPayment: attr.next_expected_match,
    active: attr.active,
    repeatFreq: attr.repeat_freq,
    date: attr.date ? attr.date.substring(0, 10) : date,
  };
}

export async function getAllBills(): Promise<Bill[]> {
  const bills: Bill[] = [];
  let page = 1;
  let totalPages = 1;
  
  const today = new Date();
  const startStr = today.toISOString().substring(0, 10);
  const oneYearLater = new Date();
  oneYearLater.setFullYear(today.getFullYear() + 1);
  const endStr = oneYearLater.toISOString().substring(0, 10);

  while (page <= totalPages) {
    const data = await fetchFirefly("/bills", { page: String(page), start: startStr, end: endStr }, { cache: "no-store" });
    const rawBills = data.data || [];
    totalPages = data.meta?.pagination?.total_pages || 1;
    
    for (const bill of rawBills) {
      const attr = bill.attributes;
      const amount = (parseFloat(attr.amount_min) + parseFloat(attr.amount_max)) / 2;
      const dueDate = attr.next_expected_match || (attr.pay_dates && attr.pay_dates[0]) || "";
      
      bills.push({
        id: bill.id,
        name: attr.name,
        amount,
        dueDate: dueDate.substring(0, 10),
        isPaid: (attr.paid_dates || []).length > 0,
        expectedInCycle: attr.active,
        amountMin: parseFloat(attr.amount_min),
        amountMax: parseFloat(attr.amount_max),
        nextExpectedPayment: attr.next_expected_match,
        active: attr.active,
        repeatFreq: attr.repeat_freq,
      });
    }
    page++;
  }
  
  return bills.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base", numeric: true }));
}

export async function updateBill(id: string, payload: {
  name: string;
  amountMin: number;
  amountMax: number;
  repeatFreq: string;
  active: boolean;
  date?: string;
}): Promise<Bill> {
  const body: Record<string, unknown> = {
    name: payload.name,
    amount_min: String(payload.amountMin),
    amount_max: String(payload.amountMax),
    repeat_freq: payload.repeatFreq,
    active: payload.active,
  };
  if (payload.date) {
    body.date = payload.date;
  }
  const data = await fetchFirefly(
    `/bills/${id}`,
    {},
    {
      method: "PUT",
      body: JSON.stringify(body),
      cache: "no-store",
    }
  );
  const bill = data.data;
  const attr = bill.attributes;
  return {
    id: bill.id,
    name: attr.name,
    amount: (parseFloat(attr.amount_min) + parseFloat(attr.amount_max)) / 2,
    dueDate: attr.next_expected_match ? attr.next_expected_match.substring(0, 10) : "",
    isPaid: (attr.paid_dates || []).length > 0,
    expectedInCycle: attr.active,
    amountMin: parseFloat(attr.amount_min),
    amountMax: parseFloat(attr.amount_max),
    nextExpectedPayment: attr.next_expected_match,
    active: attr.active,
    repeatFreq: attr.repeat_freq,
    date: attr.date ? attr.date.substring(0, 10) : undefined,
  };
}




