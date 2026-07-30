import { apiDelete, apiGet, apiPost, apiPut } from "./api";
import type {
  ReminderDashboardResponse,
  Reminder,
  ReminderCreateRequest,
  VehicleReminderSummary,
  ReminderUpdateRequest,
} from "../types/Reminder";

export function getReminders() {
  return apiGet<Reminder[]>("reminders");
}

export function getVehicleReminders(vehicleId: number) {
  return apiGet<Reminder[]>(`reminders/vehicle/${vehicleId}`);
}

export function getUpcomingReminders() {
  return apiGet<Reminder[]>("reminders/upcoming");
}

export function getReminderDashboard() {
  return apiGet<ReminderDashboardResponse>("reminders/dashboard");
}

export function getOverdueReminders() {
  return apiGet<Reminder[]>("reminders/overdue");
}

export function getVehicleReminderSummary(vehicleId: number) {
  return apiGet<VehicleReminderSummary>(`reminders/vehicle/${vehicleId}/summary`);
}

export function createReminder(payload: ReminderCreateRequest) {
  return apiPost<Reminder>("reminders", payload);
}

export function updateReminder(id: number, payload: ReminderUpdateRequest) {
  return apiPut<Reminder>(`reminders/${id}`, payload);
}

export function deleteReminder(id: number) {
  return apiDelete(`reminders/${id}`);
}

export function completeReminder(id: number) {
  return apiPost<Reminder>(`reminders/${id}/complete`, {});
}
