import axios from 'axios'
import { neon } from '@neondatabase/serverless'
import type { Context } from '@netlify/functions'

export default async (req: Request, context: Context) => {
  if (!process.env.POSTGRES_CONNECTION_STRING || !process.env.STEAM_API_KEY || !process.env.FACEIT_API_KEY)
    throw new Error('missing env')

  const sql = neon(process.env.POSTGRES_CONNECTION_STRING)

  let data: { mySteamIds: string[]; query: string }
  try {
    data = await req.json()
  } catch (error) {
    return response(400, { error: 'Invalid request body' })
  }

  if (
    !Array.isArray(data.mySteamIds) ||
    !data.mySteamIds.every((s) => typeof s === 'string') ||
    typeof data.query !== 'string'
  ) {
    return response(400, { error: 'Invalid request body' })
  }

  let steamId: string
  try {
    steamId = await getSteam64Id(data.query)
  } catch (error) {
    return response(400, { error: 'Invalid Url' })
  }

  await incrementCounters(sql, data.mySteamIds)

  const queries = data.mySteamIds.map(
    (mySteamId) =>
      sql`
        SELECT true as vs, *
        FROM matches
        WHERE ${mySteamId} = ANY(players_team1) AND ${steamId} = ANY(players_team2) 
          OR ${mySteamId} = ANY(players_team2) AND ${steamId} = ANY(players_team1)
        UNION
        SELECT false as vs, *
        FROM matches
        WHERE ${mySteamId} = ANY(players_team1) AND ${steamId} = ANY(players_team1) 
          OR ${mySteamId} = ANY(players_team2) AND ${steamId} = ANY(players_team2)
    `
  )

  const [{ name, profilePictureUrl }, faceit, ...queryResults] = await Promise.all([
    getSteamUserInfo(steamId),
    getFaceitUserInfo(steamId),
    ...queries
  ])
  const matches = queryResults.flat()

  return response(200, { steamId, name, profilePictureUrl, matches, faceit })
}

async function incrementCounters(sql, steamIds: string[]) {
  await Promise.all(
    steamIds.map(
      (steamId) =>
        sql`
        INSERT INTO metrics (id, counter)
        VALUES (${steamId}, 1)
        ON CONFLICT (id) DO UPDATE
        SET counter = metrics.counter + 1
      `
    )
  )
}

function response(code: number, body: any) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  }

  return new Response(JSON.stringify(body), { status: code, headers })
}

async function getSteam64Id(query: string) {
  const steam64Regex = /\d{17}/
  const steam64UrlRegex = /https:\/\/steamcommunity\.com\/profiles\/(\d{17})/
  const steamVanityRegex = /https:\/\/steamcommunity\.com\/id\/([a-zA-Z0-9_-]+)\/?/
  const leetifyRegex = /https:\/\/leetify\.com\/app\/profile\/(\d{17})/

  let match = query.match(steamVanityRegex)
  if (match?.[1]) {
    const response = (
      await axios.get(
        `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${process.env.STEAM_API_KEY}&vanityurl=${match[1]}`
      )
    ).data
    if (!response.response?.message) return response.response.steamid
  }

  match = query.match(steam64Regex)
  if (match?.[0]) return match[0]

  match = query.match(steam64UrlRegex)
  if (match?.[1]) return match[1]

  match = query.match(leetifyRegex)
  if (match?.[1]) return match[1]

  throw Error('did not match regex')
}

async function getSteamUserInfo(steamId: string) {
  const url = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=${steamId}`

  const response = await axios.get(url)
  const data = response.data

  if (data.response && data.response.players.length > 0) {
    const player = data.response.players[0]
    const name = player.personaname
    const profilePictureUrl = player.avatarfull
    return { name, profilePictureUrl }
  }

  throw new Error('could not fetch user Info')
}

async function getFaceitUserInfo(steamId: string): Promise<FaceitPlayerInfo | 'timeout' | undefined> {
  const baseUrl = `https://open.faceit.com/data/v4/players?game_player_id=${steamId}&game=`
  const headers = { Authorization: `Bearer ${process.env.FACEIT_API_KEY}` }
  const timeout = 4000

  const fetchFaceitData = async (game: 'cs2' | 'csgo') => {
    try {
      const response = await axios.get(`${baseUrl}${game}`, { headers, timeout })
      return response.data as FaceitPlayerInfo
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          console.error(`Faceit request timeout (${game.toUpperCase()}):`, error.message)
          return 'timeout'
        } else if (error.response?.status === 404) {
          return undefined
        }
      } else {
        console.error(`Unexpected error (${game.toUpperCase()}):`, error)
        return 'timeout'
      }
    }
  }

  const cs2Result = await fetchFaceitData('cs2')
  if (cs2Result === 'timeout' || cs2Result) return cs2Result

  const csgoResult = await fetchFaceitData('csgo')
  return csgoResult
}

type FaceitPlayerInfo = {
  player_id: string
  nickname: string
  avatar: string
  country: string
  cover_image: string
  platforms: {
    steam: string
  }
  games: {
    csgo?: GameInfo
    cs2?: GameInfo
  }
  settings: {
    language: string
  }
  friends_ids: string[]
  new_steam_id: string
  steam_id_64: string
  steam_nickname: string
  memberships: string[]
  faceit_url: string
  membership_type: string
  cover_featured_image: string
  infractions: Record<string, unknown>
  verified: boolean
  activated_at: string
}

type GameInfo = {
  region: string
  game_player_id: string
  skill_level: number
  faceit_elo: number
  game_player_name: string
  skill_level_label: string
  regions: Record<string, unknown>
  game_profile_id: string
}
