export const REMINDER_TYPES = {
  Custom: 0,

  // Documents
  InsuranceExpiry: 1,
  RoadTaxExpiry: 2,
  InspectionDue: 3,
  RegistrationExpiry: 4,
  VignetteExpiry: 5,

  // Maintenance
  ServiceDue: 10,
  OilChangeDue: 11,
  GeneralMaintenance: 12,
  BatteryCheck: 13,
  TireCheck: 14,
  BrakeCheck: 15,
  TimingBeltChange: 16,
  AirFilterChange: 17,
  CabinFilterChange: 18,
  CoolantChange: 19,
  TransmissionOilChange: 20,

  // Seasonal
  WinterTiresChange: 30,
  SummerTiresChange: 31
} as const;

export type ReminderType = (typeof REMINDER_TYPES)[keyof typeof REMINDER_TYPES];

export type ReminderTypeKey = keyof typeof REMINDER_TYPES;

export const REMINDER_TYPE_OPTIONS = Object.entries(REMINDER_TYPES).map(
  ([key, value]) => ({
    key: key as ReminderTypeKey,
    value,
  })
);

export function getReminderTypeKey(value: ReminderType): ReminderTypeKey {
  const match = REMINDER_TYPE_OPTIONS.find((option) => option.value === value);
  return match?.key ?? "Custom";
}
