/**
 * Asia/Kolkata (IST - UTC+5:30) Timezone & Date Calculations
 * Authoritative boundary calculations for Tekka Admin Analytics.
 */

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // +05:30 in milliseconds

/**
 * Returns current timestamp in epoch milliseconds.
 */
export function getNowEpoch(): number {
  return Date.now();
}

/**
 * Converts a UTC timestamp or Date to an IST Date representation (where UTC methods return IST values).
 */
export function toKolkataDate(dateInput: number | string | Date = new Date()): Date {
  const timeMs = typeof dateInput === 'number'
    ? dateInput
    : typeof dateInput === 'string'
    ? new Date(dateInput).getTime()
    : dateInput.getTime();
  
  if (isNaN(timeMs)) return new Date();
  return new Date(timeMs + IST_OFFSET_MS);
}

/**
 * Gets the start and end timestamps (in real epoch ms) for the Kolkata day containing the given date.
 */
export function getKolkataDayBoundaries(dateInput: number | string | Date = new Date()): {
  startOfDayMs: number;
  endOfDayMs: number;
  dateStr: string; // YYYY-MM-DD
} {
  const ist = toKolkataDate(dateInput);
  const year = ist.getUTCFullYear();
  const month = ist.getUTCMonth(); // 0-11
  const day = ist.getUTCDate();

  // 00:00:00.000 in IST converted back to real epoch
  const startOfDayMs = Date.UTC(year, month, day, 0, 0, 0, 0) - IST_OFFSET_MS;
  const endOfDayMs = Date.UTC(year, month, day, 23, 59, 59, 999) - IST_OFFSET_MS;

  const mm = String(month + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  const dateStr = `${year}-${mm}-${dd}`;

  return { startOfDayMs, endOfDayMs, dateStr };
}

/**
 * Gets the start and end timestamps for the current Kolkata week (Monday 00:00 to Sunday 23:59:59 IST).
 */
export function getKolkataWeekBoundaries(dateInput: number | string | Date = new Date()): {
  startOfWeekMs: number;
  endOfWeekMs: number;
} {
  const ist = toKolkataDate(dateInput);
  const year = ist.getUTCFullYear();
  const month = ist.getUTCMonth();
  const day = ist.getUTCDate();
  const dayOfWeek = ist.getUTCDay(); // 0 (Sun) to 6 (Sat)
  
  // Calculate distance back to Monday (if Sunday (0), go back 6 days)
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const startOfWeekMs = Date.UTC(year, month, day - diffToMonday, 0, 0, 0, 0) - IST_OFFSET_MS;
  const endOfWeekMs = Date.UTC(year, month, day - diffToMonday + 6, 23, 59, 59, 999) - IST_OFFSET_MS;

  return { startOfWeekMs, endOfWeekMs };
}

/**
 * Gets the start and end timestamps for the current Kolkata month (1st 00:00 to end of month 23:59:59 IST).
 */
export function getKolkataMonthBoundaries(dateInput: number | string | Date = new Date()): {
  startOfMonthMs: number;
  endOfMonthMs: number;
  monthStr: string; // YYYY-MM
} {
  const ist = toKolkataDate(dateInput);
  const year = ist.getUTCFullYear();
  const month = ist.getUTCMonth();

  const startOfMonthMs = Date.UTC(year, month, 1, 0, 0, 0, 0) - IST_OFFSET_MS;
  // Last day of month is day 0 of next month
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const endOfMonthMs = Date.UTC(year, month, lastDay, 23, 59, 59, 999) - IST_OFFSET_MS;

  const mm = String(month + 1).padStart(2, '0');
  const monthStr = `${year}-${mm}`;

  return { startOfMonthMs, endOfMonthMs, monthStr };
}

/**
 * Helper to check if a timestamp falls within Kolkata "Today".
 */
export function isTimestampInKolkataToday(timestamp: number | string): boolean {
  const timeMs = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp;
  if (isNaN(timeMs)) return false;
  const { startOfDayMs, endOfDayMs } = getKolkataDayBoundaries();
  return timeMs >= startOfDayMs && timeMs <= endOfDayMs;
}

/**
 * Helper to check if a timestamp falls within Kolkata "This Week" (since Monday 00:00 IST).
 */
export function isTimestampInKolkataThisWeek(timestamp: number | string): boolean {
  const timeMs = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp;
  if (isNaN(timeMs)) return false;
  const { startOfWeekMs } = getKolkataWeekBoundaries();
  return timeMs >= startOfWeekMs;
}

/**
 * Helper to check if a timestamp falls within Kolkata "This Month" (since 1st of month 00:00 IST).
 */
export function isTimestampInKolkataThisMonth(timestamp: number | string): boolean {
  const timeMs = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp;
  if (isNaN(timeMs)) return false;
  const { startOfMonthMs } = getKolkataMonthBoundaries();
  return timeMs >= startOfMonthMs;
}

/**
 * Formats a timestamp into a human readable IST string with AM/PM.
 */
export function formatKolkataDateTime(timestamp: number | string): string {
  const timeMs = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp;
  if (isNaN(timeMs)) return 'N/A';
  
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(new Date(timeMs));
}
