const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function getActualPayday(month: number, year: number): Date {
  // month is 1-indexed here (1 = Jan, 12 = Dec)
  // Payday is always the 20th; if it falls on a weekend, paid on the preceding Friday
  const date = new Date(year, month - 1, 20);
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

  if (dayOfWeek === 6) {
    // Saturday → Friday the 19th
    date.setDate(19);
  } else if (dayOfWeek === 0) {
    // Sunday → Friday the 18th
    date.setDate(18);
  }

  return date;
}

export function getCurrentPaydayCycle(referenceDate: Date = new Date()): { startDate: Date, endDate: Date } {
  const refMonth = referenceDate.getMonth() + 1;
  const refYear = referenceDate.getFullYear();
  
  const currentMonthPayday = getActualPayday(refMonth, refYear);
  
  if (referenceDate < currentMonthPayday) {
    // We are in the cycle that started last month
    let prevMonth = refMonth - 1;
    let prevYear = refYear;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear -= 1;
    }
    
    const startDate = getActualPayday(prevMonth, prevYear);
    const endDate = new Date(currentMonthPayday);
    endDate.setDate(endDate.getDate() - 1); // Cycle ends the day before the new payday
    
    return { startDate, endDate };
  } else {
    // We are in the cycle that started this month
    let nextMonth = refMonth + 1;
    let nextYear = refYear;
    if (nextMonth === 13) {
      nextMonth = 1;
      nextYear += 1;
    }
    
    const startDate = currentMonthPayday;
    const nextMonthPayday = getActualPayday(nextMonth, nextYear);
    const endDate = new Date(nextMonthPayday);
    endDate.setDate(endDate.getDate() - 1);
    
    return { startDate, endDate };
  }
}

// ---------------------------------------------------------------------------
// Dashboard cycle logic — fixed 17th boundary, no weekend adjustment.
// Used only by the historical pacing dashboard. Does NOT affect subscriptions
// or credit card payment logic (which use getCurrentPaydayCycle above).
// ---------------------------------------------------------------------------

/** Returns the fixed 17th of the given month — no weekend adjustment. */
export function getCycleBoundary(month: number, year: number): Date {
  return new Date(year, month - 1, 17);
}

/** Like getCurrentPaydayCycle but uses the fixed 17th as the cycle boundary. */
export function getDashboardCycle(referenceDate: Date = new Date()): { startDate: Date, endDate: Date } {
  const refMonth = referenceDate.getMonth() + 1;
  const refYear = referenceDate.getFullYear();

  const currentBoundary = getCycleBoundary(refMonth, refYear);

  if (referenceDate < currentBoundary) {
    // Before the 17th — in the cycle that started last month
    let prevMonth = refMonth - 1;
    let prevYear = refYear;
    if (prevMonth === 0) { prevMonth = 12; prevYear -= 1; }

    const startDate = getCycleBoundary(prevMonth, prevYear);
    const endDate = new Date(currentBoundary);
    endDate.setDate(endDate.getDate() - 1);
    return { startDate, endDate };
  } else {
    // On or after the 17th — in the cycle that started this month
    let nextMonth = refMonth + 1;
    let nextYear = refYear;
    if (nextMonth === 13) { nextMonth = 1; nextYear += 1; }

    const startDate = currentBoundary;
    const nextBoundary = getCycleBoundary(nextMonth, nextYear);
    const endDate = new Date(nextBoundary);
    endDate.setDate(endDate.getDate() - 1);
    return { startDate, endDate };
  }
}

export function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getPastPaydayCycles(
  count: number = 6,
  referenceDate: Date = new Date()
): { startDate: Date, endDate: Date, label: string, id: string }[] {
  const currentCycle = getDashboardCycle(referenceDate);
  const currentMonth = currentCycle.startDate.getMonth() + 1;
  const currentYear = currentCycle.startDate.getFullYear();

  const cycles = [];
  for (let i = 0; i < count; i++) {
    let refMonth = currentMonth - i;
    let refYear = currentYear;
    while (refMonth <= 0) {
      refMonth += 12;
      refYear -= 1;
    }
    cycles.push(getCycleForMonth(refYear, refMonth));
  }

  // Sort oldest to newest for charts
  return cycles.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
}


export function getPastCyclesFrom(periodId: string, count: number = 12): { startDate: Date, endDate: Date, label: string, id: string }[] {
  const match = periodId.match(/^(\d{4})-(\d{2})$/);
  if (!match) {
    return [];
  }
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);

  const cycles = [];
  for (let i = 0; i < count; i++) {
    let refMonth = month - i;
    let refYear = year;
    while (refMonth <= 0) {
      refMonth += 12;
      refYear -= 1;
    }
    cycles.push(getCycleForMonth(refYear, refMonth));
  }
  // Sort oldest to newest for charts
  return cycles.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
}


export function getCycleForMonth(year: number, month: number): { startDate: Date, endDate: Date, label: string, id: string } {
  const startDate = getCycleBoundary(month, year);
  
  let nextMonth = month + 1;
  let nextYear = year;
  if (nextMonth === 13) {
    nextMonth = 1;
    nextYear += 1;
  }
  
  const nextBoundary = getCycleBoundary(nextMonth, nextYear);
  const endDate = new Date(nextBoundary);
  endDate.setDate(endDate.getDate() - 1);
  
  const label = `${MONTH_NAMES[startDate.getMonth()]} ${startDate.getFullYear().toString().substring(2)}`;
  const id = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
  
  return { startDate, endDate, label, id };
}

export function getAdjacentCycles(periodId: string): {
  prev: { label: string; id: string } | null;
  next: { label: string; id: string } | null;
} {
  const match = periodId.match(/^(\d{4})-(\d{2})$/);
  if (!match) {
    return { prev: null, next: null };
  }
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);

  // Compute previous cycle
  let prevMonth = month - 1;
  let prevYear = year;
  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear -= 1;
  }
  const prevCycle = getCycleForMonth(prevYear, prevMonth);

  // Compute next cycle
  let nextMonth = month + 1;
  let nextYear = year;
  if (nextMonth === 13) {
    nextMonth = 1;
    nextYear += 1;
  }
  const nextCycle = getCycleForMonth(nextYear, nextMonth);

  // Check if next cycle is in the future relative to the current dashboard cycle
  const today = new Date();
  const currentCycle = getDashboardCycle(today);
  const isNextFuture = nextCycle.startDate.getTime() > currentCycle.startDate.getTime();

  return {
    prev: { label: prevCycle.label, id: prevCycle.id },
    next: isNextFuture ? null : { label: nextCycle.label, id: nextCycle.id }
  };
}
