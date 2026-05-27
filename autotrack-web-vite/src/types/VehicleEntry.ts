
export type VehicleEntry = {
  id: number;
  vehicleId: number;

  type: number; // EntryType

  amount?: number;
  pricePerUnit?: number;
  totalPrice: number;

  odometerKm?: number;
  occurredAt?: string;

  expenseCategory?: number;
  serviceType?: number;
  insuranceType?: number;

  title?: string;
  description?: string;

  startDate?: string;
  endDate?: string;

  nextDueKm?: number;
  nextDueDate?: string;
};
