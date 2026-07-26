const REMOVE_LAST_PATTERN = /CORRECTION:\s*remove_last/i
const REMOVE_TIME_PATTERN = /CORRECTION:\s*remove_time:\s*(\d{1,2}:\d{2})/i

type CorrectionExtractionResult = {
  cleanedReply: string
  shouldRemoveLast: boolean
  removeMealTime: string | null
}

export function extractCorrection(reply: string): CorrectionExtractionResult {
  let cleanedReply = reply
  let removeMealTime: string | null = null

  const removeTimeMatch = cleanedReply.match(REMOVE_TIME_PATTERN)
  if (removeTimeMatch) {
    removeMealTime = removeTimeMatch[1]
    cleanedReply = cleanedReply.replace(removeTimeMatch[0], '').trim()
  }

  const shouldRemoveLast = REMOVE_LAST_PATTERN.test(cleanedReply)
  if (shouldRemoveLast) {
    cleanedReply = cleanedReply.replace(REMOVE_LAST_PATTERN, '').trim()
  }

  return { cleanedReply, shouldRemoveLast, removeMealTime }
}
