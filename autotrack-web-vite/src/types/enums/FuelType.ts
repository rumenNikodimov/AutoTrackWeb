export const FuelType = {
  Gasoline: 1,
  Diesel: 2,
  Electric: 3,
  Hybrid: 4,
  LPG: 5,
  PlugInHybrid: 6,
  CNG: 7
} as const;

export type FuelType = typeof FuelType[keyof typeof FuelType];