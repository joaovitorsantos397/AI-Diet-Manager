const WEIGHT_DATA_PATTERN = /WEIGHT_DATA:\s*(\{[^\n]*\})/

type WeightExtractionResult = {
  cleanedReply: string
  entry: { weightKg: number; bodyFatPercentage: number | null } | null
}

export function extractWeightData(reply: string): WeightExtractionResult {
  const match = reply.match(WEIGHT_DATA_PATTERN)

  if (!match) {
    return { cleanedReply: reply, entry: null }
  }

  const cleanedReply = reply.replace(match[0], '').trim()

  try {
    const parsed = JSON.parse(match[1])
    const weightKg = Number(parsed.weightKg)
    if (!weightKg) {
      return { cleanedReply, entry: null }
    }
    const bodyFatPercentage =
      parsed.bodyFatPercentage === null || parsed.bodyFatPercentage === undefined
        ? null
        : Number(parsed.bodyFatPercentage)
    return { cleanedReply, entry: { weightKg, bodyFatPercentage } }
  } catch {
    return { cleanedReply, entry: null }
  }
}
