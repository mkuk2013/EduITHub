import { CURRENCY, TIMEZONE } from "./constants";

const pkrFormatter = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: CURRENCY,
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("en-PK", {
  timeZone: TIMEZONE,
  day: "numeric",
  month: "short",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-PK", {
  timeZone: TIMEZONE,
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

/** Format an integer PKR amount, e.g. 1000 -> "Rs 1,000". */
export function formatPKR(amount: number): string {
  return pkrFormatter.format(amount);
}

/** Format a date in the academy timezone, e.g. "22 Sep 2026". */
export function formatDate(date: Date | string): string {
  return dateFormatter.format(new Date(date));
}

/** Format a date+time in the academy timezone, e.g. "22 Sep 2026, 9:30 PM". */
export function formatDateTime(date: Date | string): string {
  return dateTimeFormatter.format(new Date(date));
}

/** Human relative time, e.g. "5 minutes ago", "3 days ago". */
export function timeAgo(date: Date | string): string {
  const then = new Date(date).getTime();
  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000));

  const units: Array<[number, string]> = [
    [31536000, "year"],
    [2592000, "month"],
    [86400, "day"],
    [3600, "hour"],
    [60, "minute"],
  ];

  for (const [divisor, label] of units) {
    const value = Math.floor(seconds / divisor);
    if (value >= 1) {
      return `${value} ${label}${value === 1 ? "" : "s"} ago`;
    }
  }
  return "just now";
}

/** Current billing month key in academy timezone, e.g. "2026-09". */
export function currentMonthKey(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(now);
  const year = parts.find((p) => p.type === "year")?.value ?? "";
  const month = parts.find((p) => p.type === "month")?.value ?? "";
  return `${year}-${month}`;
}
