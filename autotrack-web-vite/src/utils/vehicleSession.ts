const LAST_VEHICLE_KEY = "autotrack:lastVehicleId";

export function storeVehicleId(vehicleId?: number | string | null) {
  if (vehicleId === undefined || vehicleId === null || vehicleId === "") {
    return;
  }

  localStorage.setItem(LAST_VEHICLE_KEY, String(vehicleId));
}

export function getStoredVehicleId() {
  return localStorage.getItem(LAST_VEHICLE_KEY);
}
