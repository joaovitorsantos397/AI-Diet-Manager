export type BandejaoMealSection =
  | { available: false }
  | {
      available: true
      title: string
      dish: string
      items: string[]
      notes: string[]
    }

export type BandejaoMenu = {
  date: string
  lunch: BandejaoMealSection
  lunchVegan: BandejaoMealSection
  dinner: BandejaoMealSection
  dinnerVegan: BandejaoMealSection
}
