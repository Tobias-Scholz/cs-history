export const BASE_URL =
  process.env.REACT_APP_BASE_URL ?? 'https://cs-history.netlify.app'

export const FACEIT_ELO_TIERS = [
  { minElo: 2001, level: 10 },
  { minElo: 1751, level: 9 },
  { minElo: 1531, level: 8 },
  { minElo: 1351, level: 7 },
  { minElo: 1201, level: 6 },
  { minElo: 1051, level: 5 },
  { minElo: 901, level: 4 },
  { minElo: 751, level: 3 },
  { minElo: 501, level: 2 },
  { minElo: 0, level: 1 },
] as const
