import axios from 'axios'
import { neon } from '@neondatabase/serverless'

const handler = async (event, context) => {
  const sql = neon(process.env.POSTGRES_CONNECTION_STRING)

  let data
  try {
    data = JSON.parse(event.body)
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

  const matches = await sql`
    SELECT true as vs, *
    FROM matches_v2
    WHERE ${data.mySteamId} = ANY(players_team1) AND ${steamId} = ANY(players_team2) 
      OR ${data.mySteamId} = ANY(players_team2) AND ${steamId} = ANY(players_team1)
    UNION
    SELECT false as vs, *
    FROM matches_v2
    WHERE ${data.mySteamId} = ANY(players_team1) AND ${steamId} = ANY(players_team1) 
      OR ${data.mySteamId} = ANY(players_team2) AND ${steamId} = ANY(players_team2)
  `

  return response(200, { steamId, matches })
}

function response(code, body) {
  return {
    statusCode: code,
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json'
    }
  }
}

async function getSteam64Id(query) {
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

export { handler }
