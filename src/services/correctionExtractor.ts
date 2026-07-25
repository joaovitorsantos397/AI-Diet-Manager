const CORRECTION_PATTERN = /CORRECTION:\s*remove_last/i

type CorrectionExtractionResult = {
  cleanedReply: string
  shouldRemoveLast: boolean
}

export function extractCorrection(reply: string): CorrectionExtractionResult {
  const match = reply.match(CORRECTION_PATTERN)

  if (!match) {
    return { cleanedReply: reply, shouldRemoveLast: false }
  }

  const cleanedReply = reply.replace(match[0], '').trim()
  return { cleanedReply, shouldRemoveLast: true }
}
