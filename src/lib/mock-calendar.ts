export type DayStatus = "available" | "booked" | "unavailable" | "past";

export interface CalendarDay {
  date: string; // YYYY-MM-DD
  status: DayStatus;
}

// Miguel works Tue–Sat. Pre-booked dates for June–July 2026.
const BOOKED_DATES = new Set([
  "2026-06-02", "2026-06-04", "2026-06-06",
  "2026-06-09", "2026-06-11", "2026-06-13",
  "2026-06-17", "2026-06-20", "2026-06-25",
  "2026-06-27", "2026-07-02", "2026-07-07",
  "2026-07-09", "2026-07-11", "2026-07-16",
  "2026-07-18", "2026-07-21", "2026-07-23",
]);

export function getMonthDays(year: number, month: number): CalendarDay[] {
  const today = new Date("2026-05-30");
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: CalendarDay[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const dow = date.getDay(); // 0=Sun, 1=Mon

    let status: DayStatus;

    if (date < today) {
      status = "past";
    } else if (dow === 0 || dow === 1) {
      // Sun + Mon closed
      status = "unavailable";
    } else if (BOOKED_DATES.has(dateStr)) {
      status = "booked";
    } else {
      status = "available";
    }

    days.push({ date: dateStr, status });
  }

  return days;
}

export function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}
