const BANDEJAO_USER_PATTERN = /BANDEJAO_USER:\s*(yes|no)/i

type BandejaoUserExtractionResult = {
  cleanedReply: string
  bandejaoUser: boolean | null
}

export function extractBandejaoUser(reply: string): BandejaoUserExtractionResult {
  const match = reply.match(BANDEJAO_USER_PATTERN)

  if (!match) {
    return { cleanedReply: reply, bandejaoUser: null }
  }

  const cleanedReply = reply.replace(match[0], '').trim()
  return { cleanedReply, bandejaoUser: match[1].toLowerCase() === 'yes' }
}
