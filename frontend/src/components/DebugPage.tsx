import {
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'
import { useEffect, useState } from 'react'

import { BASE_URL } from '../constants'

interface DebugMatch {
  id: string
  date: string
  map: string
  type: string
  players_team1: string[]
  players_team2: string[]
  rounds_team1: number | null
  rounds_team2: number | null
}

interface ErrorLog {
  id: number
  created_at: string
  source: string
  message: string
  details: string | null
}

export function DebugPage() {
  const [matches, setMatches] = useState<DebugMatch[]>([])
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(BASE_URL + '/.netlify/functions/debug')
      .then((res) => res.json())
      .then((data) => {
        setMatches(data.matches)
        setErrorLogs(data.errorLogs)
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">Failed to load debug data: {error}</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Debug
      </Typography>

      <Typography variant="h6" sx={{ mb: 1 }}>
        Latest 20 Matches
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Map</TableCell>
              <TableCell>Score</TableCell>
              <TableCell>Team 1 Players</TableCell>
              <TableCell>Team 2 Players</TableCell>
              <TableCell>ID</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {matches.map((m) => (
              <TableRow key={m.id}>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{new Date(m.date).toLocaleString()}</TableCell>
                <TableCell>{m.map}</TableCell>
                <TableCell>
                  {m.rounds_team1 ?? '?'} – {m.rounds_team2 ?? '?'}
                </TableCell>
                <TableCell sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                  {m.players_team1?.join(', ')}
                </TableCell>
                <TableCell sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                  {m.players_team2?.join(', ')}
                </TableCell>
                <TableCell sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>{m.id}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h6" sx={{ mb: 1 }}>
        Error Logs
      </Typography>
      {errorLogs.length === 0 ? (
        <Typography color="text.secondary">No errors logged.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Time</TableCell>
                <TableCell>Source</TableCell>
                <TableCell>Message</TableCell>
                <TableCell>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {errorLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{new Date(log.created_at).toLocaleString()}</TableCell>
                  <TableCell>{log.source}</TableCell>
                  <TableCell>{log.message}</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{log.details}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}
