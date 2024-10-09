import axios from 'axios'
import { neon } from '@neondatabase/serverless'
import type { Context } from '@netlify/functions'

export default async (req: Request, context: Context) => {
  if (!process.env.POSTGRES_CONNECTION_STRING || !process.env.STEAM_API_KEY) throw new Error('missing env')

  const sql = neon(process.env.POSTGRES_CONNECTION_STRING)

  let data: { mySteamId: string; query: string }
  try {
    data = await req.json()
  } catch (error) {
    return response(400, { error: 'Invalid request body' })
  }

  if (typeof data.mySteamId !== 'string' || typeof data.query !== 'string') {
    return response(400, { error: 'Invalid request body' })
  }

  let steamId
  try {
    steamId = await getSteam64Id(data.query)
  } catch (error) {
    return response(400, { error: 'Invalid Url' })
  }

  const [matches, { name, profilePictureUrl }] = await Promise.all([
    sql`
    SELECT true as vs, *
    FROM matches_v2
    WHERE ${data.mySteamId} = ANY(players_team1) AND ${steamId} = ANY(players_team2) 
      OR ${data.mySteamId} = ANY(players_team2) AND ${steamId} = ANY(players_team1)
    UNION
    SELECT false as vs, *
    FROM matches_v2
    WHERE ${data.mySteamId} = ANY(players_team1) AND ${steamId} = ANY(players_team1) 
      OR ${data.mySteamId} = ANY(players_team2) AND ${steamId} = ANY(players_team2)
  `,
    getSteamUserInfo(steamId)
  ])

  return response(200, { steamId, name, profilePictureUrl, matches })
}

function response(code: number, body: any) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'http://localhost:3000',
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

  let match = query.match(steam64Regex)
  if (match?.[0]) return match[0]

  match = query.match(steam64UrlRegex)
  if (match?.[1]) return match[1]

  match = query.match(leetifyRegex)
  if (match?.[1]) return match[1]

  match = query.match(steamVanityRegex)
  if (match?.[1]) {
    const response = (
      await axios.get(
        `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${process.env.STEAM_API_KEY}&vanityurl=${match[1]}`
      )
    ).data
    if (!response.response?.message) return response.response.steamid
  }
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
