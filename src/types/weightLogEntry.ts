export type WeightLogEntry = {
  id: string
  timestamp: number
  weightKg: number
  bodyFatPercentage: number | null
  basalMetabolicRate: number | null
}
