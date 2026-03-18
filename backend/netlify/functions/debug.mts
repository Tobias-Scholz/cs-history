import { neon } from '@neondatabase/serverless'

export default async (req: Request) => {
  if (!process.env.POSTGRES_CONNECTION_STRING) throw new Error('missing env')

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

  const [matches, errorLogs] = await Promise.all([
    sql`SELECT id, date, map, type, players_team1, players_team2, rounds_team1, rounds_team2 FROM matches ORDER BY date DESC LIMIT 20`,
    sql`SELECT * FROM error_logs ORDER BY created_at DESC LIMIT 100`
  ])

  return new Response(JSON.stringify({ matches, errorLogs }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
