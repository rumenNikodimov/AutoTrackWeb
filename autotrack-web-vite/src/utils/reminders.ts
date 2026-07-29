import type { Reminder } from "../types/Reminder";

export type ReminderStatusGroup = "overdue" | "upcoming" | "completed";

export function getCurrentVehicleMileageFromEntries(
  entries: Array<{ odometerKm?: number | null }>
): number {
  const values = entries
    .map((e) => (typeof e.odometerKm === "number" && Number.isFinite(e.odometerKm) ? e.odometerKm : null))
    .filter((v): v is number => v !== null);

  return values.length ? Math.max(...values) : 0;
}

export function isReminderDue(
  reminder: Reminder,
  currentMileage: number,
  now = new Date()
): boolean {
  const notifyBeforeDays = reminder.notifyBeforeDays ?? 0;
  const notifyBeforeKm = reminder.notifyBeforeKm ?? 0;

  const dueByDate = reminder.dueDate
    ? new Date(reminder.dueDate).getTime() <= addDays(now, notifyBeforeDays).getTime()
    : false;

  const dueByKm =
    typeof reminder.dueKm === "number"
      ? currentMileage >= reminder.dueKm - notifyBeforeKm
      : false;

  return dueByDate || dueByKm;
}

export function getReminderGroup(
  reminder: Reminder,
  currentMileage: number,
  now = new Date()
): ReminderStatusGroup {
  if (reminder.isCompleted) return "completed";

  const notifyBeforeDays = reminder.notifyBeforeDays ?? 0;
  const notifyBeforeKm = reminder.notifyBeforeKm ?? 0;

  const dateOverdue = reminder.dueDate
    ? new Date(reminder.dueDate).getTime() < now.getTime()
    : false;
  const kmOverdue =
    typeof reminder.dueKm === "number"
      ? currentMileage > reminder.dueKm
      : false;

  if (dateOverdue || kmOverdue) return "overdue";

  const dueSoonByDate = reminder.dueDate
    ? new Date(reminder.dueDate).getTime() <= addDays(now, notifyBeforeDays).getTime()
    : false;
  const dueSoonByKm =
    typeof reminder.dueKm === "number"
      ? currentMileage >= reminder.dueKm - notifyBeforeKm
      : false;

  return dueSoonByDate || dueSoonByKm ? "upcoming" : "upcoming";
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
