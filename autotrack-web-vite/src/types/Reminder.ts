import type { ReminderType } from "./enums/ReminderType";

export type Reminder = {
  id: number;
  vehicleId: number;
  reminderType: ReminderType;
  title: string;
  description?: string;
  dueDate?: string | null;
  dueKm?: number | null;
  notifyBeforeDays?: number | null;
  notifyBeforeKm?: number | null;
  isCompleted: boolean;
  completedAt?: string | null;
  notificationSent: boolean;
  notificationSentAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ReminderCreateRequest = {
  vehicleId: number;
  reminderType: ReminderType;
  title: string;
  description?: string;
  dueDate?: string;
  dueKm?: number;
  notifyBeforeDays?: number;
  notifyBeforeKm?: number;
};

export type ReminderUpdateRequest = ReminderCreateRequest;

export type ReminderPreview = Partial<Reminder> & {
  remainingKm?: number | null;
  remainingDays?: number | null;
};

export type VehicleReminderSummary = {
  vehicleId: number;
  overdueCount: number;
  upcomingCount: number;
  completedCount?: number;
  nextReminder?: ReminderPreview | null;
};

export type ReminderDashboardResponse = {
  overdueReminders?: Reminder[];
  upcomingReminders?: Reminder[];
  overdue?: Reminder[];
  upcoming?: Reminder[];
  overdueCount?: number;
  upcomingCount?: number;
};
