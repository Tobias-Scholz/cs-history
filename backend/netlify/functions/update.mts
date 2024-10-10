import { neon } from '@neondatabase/serverless'
import type { Config } from '@netlify/functions'
import axios from 'axios'
import { format, sub } from 'date-fns'

export const config: Config = {
  schedule: '0 0 * * *'
}

export default async (req: Request) => {
  if (!process.env.POSTGRES_CONNECTION_STRING || !process.env.LEETIFY_TOKEN) throw new Error('missing env')

  const sql = neon(process.env.POSTGRES_CONNECTION_STRING)

  const lastEntry = await sql`SELECT * FROM matches ORDER BY date DESC LIMIT 1`
  let lastDate = (lastEntry[0]?.date as Date) || sub(new Date(), { days: 7 })
  lastDate = sub(lastDate, { days: 2 })

  console.log('Fetching History')
  await processMatches(await fetchHistory(lastDate), sql)
  console.log('Fetching Profile', '76561198056395137')
  await processMatches(await fetchProfileHistory(lastDate, '76561198056395137'), sql)
}

async function fetchProfileHistory(lastDate: Date, steamId: string) {
  console.log('Fetching history')

  let matches = await axios
    .get('https://api.leetify.com/api/profile/' + steamId, {
      headers: {
        Authorization: 'Bearer ' + process.env.LEETIFY_TOKEN
      }
    })
    .then((result) => result.data.games)

  return matches.filter((m) => new Date(m.gameFinishedAt).getTime() > lastDate.getTime())
}

async function fetchHistory(lastDate: Date) {
  console.log('Fetching from', lastDate)

  return axios
    .get(leetifyHistoryUrl(lastDate), {
      headers: {
        Authorization: 'Bearer ' + process.env.LEETIFY_TOKEN
      }
    })
    .then((result) => result.data.games)
}

async function processMatches(matches, sql) {
  console.log('Matches: ' + matches.length)

  for (const matchSummary of matches) {
    const id = matchSummary.id || matchSummary.gameId
    console.log(id, matchSummary.finishedAt || matchSummary.gameFinishedAt)

    const entry = await sql`SELECT * FROM matches WHERE id = ${id}`
    if (entry.length > 0) continue

    console.log('Fetching match info')

    const match = await axios
      .get(`https://api.leetify.com/api/games/${id}`, {
        headers: {
          Authorization: 'Bearer ' + process.env.LEETIFY_TOKEN
        }
      })
      .then((result) => result.data)

    let players = match.playerStats

    if (match.playerStats[0]?.initialTeamNumber === undefined) {
      await processSkeletonMatch(match, players, sql)
      continue
    }

    await processMatch(match, players, sql)
  }
}

async function processSkeletonMatch(match, players, sql) {
  players = match.gamePlayerRoundSkeletonStats

  const half = Math.ceil(players.length / 2)

  const team1Players = players.slice(0, half)
  const team2Players = players.slice(half)

  await sql`
    INSERT INTO matches (id, players_team1, players_team2, rounds_team1, rounds_team2, type, date, map)
    VALUES (
        ${match.id},
        ${team1Players.map((player) => player.steam64Id)},
        ${team2Players.map((player) => player.steam64Id)},
        ${isNaN(team1Players[0]?.roundWon) ? null : team1Players[0]?.roundWon},
        ${isNaN(team2Players[0]?.roundWon) ? null : team2Players[0]?.roundWon},
        'Leetify',
        ${match.finishedAt},
        ${match.mapName}
    )
    ON CONFLICT (id) DO NOTHING;
  `
}

async function processMatch(match, players, sql) {
  const teamIds = new Set()
  for (const player of players) teamIds.add(player.initialTeamNumber)

  const [team1Id, team2Id] = [...teamIds]

  const team1Players = players.filter((player) => player.initialTeamNumber === team1Id)
  const team2Players = players.filter((player) => player.initialTeamNumber === team2Id)

  await sql`
    INSERT INTO matches (id, players_team1, players_team2, rounds_team1, rounds_team2, type, date, map)
    VALUES (
        ${match.id},
        ${team1Players.map((player) => player.steam64Id)},
        ${team2Players.map((player) => player.steam64Id)},
        ${
          isNaN(team1Players[0]?.tRoundsWon + team1Players[0]?.ctRoundsWon)
            ? null
            : team1Players[0]?.tRoundsWon + team1Players[0]?.ctRoundsWon
        },
        ${
          isNaN(team2Players[0]?.tRoundsWon + team2Players[0]?.ctRoundsWon)
            ? null
            : team2Players[0]?.tRoundsWon + team2Players[0]?.ctRoundsWon
        },
        'Leetify',
        ${match.finishedAt},
        ${match.mapName}
    )
    ON CONFLICT (id) DO NOTHING;
  `
}

function leetifyHistoryUrl(
  currentStartDate: Date,
  currentEndDate = new Date(),
  previousStartDate = currentStartDate,
  previousEndDate = new Date()
) {
  const formattedCurrentStartDate = format(currentStartDate, 'yyyy-MM-dd')
  const formattedCurrentEndDate = format(currentEndDate, 'yyyy-MM-dd')
  const formattedPreviousStartDate = format(previousStartDate, 'yyyy-MM-dd')
  const formattedPreviousEndDate = format(previousEndDate, 'yyyy-MM-dd')

  const periods = {
    currentPeriod: {
      startDate: formattedCurrentStartDate,
      endDate: formattedCurrentEndDate
    },
    previousPeriod: {
      startDate: formattedPreviousStartDate,
      endDate: formattedPreviousEndDate
    }
  }

  return `https://api.leetify.com/api/games/history?periods=${encodeURIComponent(JSON.stringify(periods))}`
}
