import { neon } from '@neondatabase/serverless'
import type { Config } from '@netlify/functions'
import axios from 'axios'

// No schedule, no path — only triggerable manually via the Netlify UI
export const config: Config = {}

const LEETIFY_BASE_URL = 'https://api-public.cs-prod.leetify.com'

/** Delay helper to avoid hitting API rate limits */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const DELAY_BETWEEN_MATCH_LIST_REQUESTS_MS = 2000
const DELAY_BETWEEN_MATCH_DETAIL_REQUESTS_MS = 1500

const accounts = [
  { id: '76561198092541763', name: 'Tobeyyy' },
  { id: '76561198056395137', name: 'Shaker' },
  { id: '76561198351596677', name: 'Tako' },
  { id: '76561198300616918', name: 'Shaker Smurf 1' },
  { id: '76561198260426246', name: 'Shaker Smurf 2' },
  { id: '76561198174929263', name: 'Tobeyyy Smurf 1' },
  { id: '76561198201014401', name: 'Tobeyyy Smurf 2' },
  { id: '76561198089207957', name: 'Snake' },
  { id: '76561197981567696', name: 'nimm2' }
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function logError(sql: any, source: string, message: string, details?: string) {
  try {
    await sql`INSERT INTO error_logs (source, message, details) VALUES (${source}, ${message}, ${details ?? null})`
  } catch (e) {
    console.error('Failed to log error:', e)
  }
}

export default async (_req: Request) => {
  if (!process.env.POSTGRES_CONNECTION_STRING) throw new Error('missing env POSTGRES_CONNECTION_STRING')
  if (!process.env.LEETIFY_API_KEY) throw new Error('missing env LEETIFY_API_KEY')

  const sql = neon(process.env.POSTGRES_CONNECTION_STRING)

  await sql`
    CREATE TABLE IF NOT EXISTS error_logs (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMP DEFAULT NOW(),
      source VARCHAR(255),
      message TEXT,
      details TEXT
    )
  `

  let totalInserted = 0
  let totalSkipped = 0

  // Process accounts sequentially to stay well within rate limits
  for (let i = 0; i < accounts.length; i++) {
    const account = accounts[i]

    if (i > 0) {
      console.log(`Waiting ${DELAY_BETWEEN_MATCH_LIST_REQUESTS_MS}ms before next account...`)
      await delay(DELAY_BETWEEN_MATCH_LIST_REQUESTS_MS)
    }

    try {
      const matches = await fetchAllMatches(account)
      console.log(`${account.name}: fetched ${matches.length} total matches`)

      const { inserted, skipped } = await processMatches(matches, sql, account.name)
      totalInserted += inserted
      totalSkipped += skipped
    } catch (error) {
      console.error(`Error processing account ${account.name}:`, error)
      await logError(sql, `backfill:${account.name}`, String(error))
    }
  }

  console.log(`Backfill complete. Inserted: ${totalInserted}, Skipped (already in DB): ${totalSkipped}`)

  return new Response(
    JSON.stringify({ message: 'Backfill complete', inserted: totalInserted, skipped: totalSkipped }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  )
}

async function fetchAllMatches(account: { id: string; name: string }): Promise<LeetifyMatch[]> {
  console.log(`Fetching all matches for ${account.name}`)

  try {
    const matches = await axios
      .get(`${LEETIFY_BASE_URL}/v3/profile/matches`, {
        params: { steam64_id: account.id },
        headers: {
          Authorization: 'Bearer ' + process.env.LEETIFY_API_KEY
        }
      })
      .then((result) => result.data as LeetifyMatch[])

    return matches
  } catch (error) {
    console.error(`Error fetching matches for ${account.name}:`, error)
    return []
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function processMatches(
  matches: LeetifyMatch[],
  sql: any,
  name: string
): Promise<{ inserted: number; skipped: number }> {
  let inserted = 0
  let skipped = 0

  for (const matchSummary of matches) {
    const id = matchSummary.id

    // Check if match already exists in DB
    const existing = await sql`SELECT id FROM matches WHERE id = ${id}`
    if (existing.length > 0) {
      console.log(`${name}: match ${id} already in DB, skipping`)
      skipped++
      continue
    }

    console.log(`${name}: fetching details for match ${id} (${matchSummary.finished_at})`)

    await delay(DELAY_BETWEEN_MATCH_DETAIL_REQUESTS_MS)

    try {
      const match = await axios
        .get(`${LEETIFY_BASE_URL}/v2/matches/${id}`, {
          headers: {
            Authorization: 'Bearer ' + process.env.LEETIFY_API_KEY
          }
        })
        .then((result) => result.data as LeetifyMatchDetails)

      await insertMatch(match, sql)
      inserted++
      console.log(`${name}: inserted match ${id}`)
    } catch (error) {
      console.error(`${name}: failed to process match ${id}:`, error)
      await logError(sql, `backfill:${name}`, `Failed to process match ${id}: ${String(error)}`)
    }
  }

  return { inserted, skipped }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function insertMatch(match: LeetifyMatchDetails, sql: any) {
  const players = match.stats

  if (!players || players.length === 0) {
    console.warn(`No player stats for match ${match.id}`)
    return
  }

  const teamIds = new Set<number>()
  for (const player of players) teamIds.add(player.initial_team_number)

  const [team1Id, team2Id] = [...teamIds]

  const team1Players = players.filter((player) => player.initial_team_number === team1Id)
  const team2Players = players.filter((player) => player.initial_team_number === team2Id)

  const team1Score = match.team_scores.find((t) => t.team_number === team1Id)?.score ?? null
  const team2Score = match.team_scores.find((t) => t.team_number === team2Id)?.score ?? null

  await sql`
    INSERT INTO matches (id, players_team1, players_team2, rounds_team1, rounds_team2, type, date, map)
    VALUES (
        ${match.id},
        ${team1Players.map((player) => player.steam64_id)},
        ${team2Players.map((player) => player.steam64_id)},
        ${isNaN(team1Score as number) || team1Score === null ? null : team1Score},
        ${isNaN(team2Score as number) || team2Score === null ? null : team2Score},
        'Leetify',
        ${match.finished_at},
        ${match.map_name}
    )
    ON CONFLICT (id) DO NOTHING;
  `
}

type LeetifyMatch = {
  id: string
  finished_at: string
  data_source: string
  outcome: string
  rank: number
  rank_type: string | null
  map_name: string
  leetify_rating: number
  score: [number, number]
  preaim: number
  reaction_time_ms: number
  accuracy_enemy_spotted: number
  accuracy_head: number
  spray_accuracy: number
}

type LeetifyMatchDetails = {
  id: string
  finished_at: string
  data_source: string
  data_source_match_id: string
  map_name: string
  has_banned_player: boolean
  team_scores: TeamScore[]
  stats: PlayerStats[]
}

type TeamScore = {
  team_number: number
  score: number
}

type PlayerStats = {
  steam64_id: string
  name: string
  initial_team_number: number
  total_kills: number
  total_deaths: number
  total_assists: number
  rounds_won: number
  rounds_lost: number
  rounds_count: number
  leetify_rating: number | null
  ct_leetify_rating: number | null
  t_leetify_rating: number | null
}
