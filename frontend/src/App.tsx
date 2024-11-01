import { Search } from '@mui/icons-material'
import { Box, InputAdornment, LinearProgress, TextField } from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import './App.css'
import { PlayerTable } from './components/PlayerTable'
import { SteamIdDialog } from './components/SteamIdDialog'

export interface Match {
  vs: boolean
  id: string
  type: string
  players_team1: string[]
  players_team2: string[]
  rounds_team1: number
  rounds_team2: number
  map: string
  rating: number
  date: string
}

export interface Player {
  steamId: string
  name: string
  profilePictureUrl: string
  matches: Match[]
}

function App() {
  const [input, setInput] = useState('')
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(false)
  const mySteamIds = JSON.parse(localStorage.getItem('mySteamIds') || '[]') as string[]

  const queryClient = useQueryClient()

  const fetchPlayer = async (query: string) => {
    if (!query || !mySteamIds) return
    setLoading(true)
    const response = await queryClient.fetchQuery<Response>({
      queryKey: ['history', query],
      retry: 0,
      queryFn: () =>
        fetch('https://cs-history.netlify.app/.netlify/functions/history', {
          method: 'POST',
          body: JSON.stringify({ mySteamIds, query })
        }),
      staleTime: 0
    })
    setInput('')
    setLoading(false)
    if (response.status !== 200) return

    const player = (await response.json()) as Player
    if (!players.find((p) => p.steamId === player.steamId)) {
      setPlayers((players) => [...players, player])
    }
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '100px',
          paddingTop: '150px',
          minHeight: '100vh',
          backgroundColor: '#F7F7F7'
        }}
      >
        <TextField
          fullWidth
          placeholder="Search..."
          variant="outlined"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              fetchPlayer(input)
              event.stopPropagation()
            }
          }}
          onPaste={(event) => {
            const pastedText = event.clipboardData.getData('text')
            fetchPlayer(pastedText)
            event.stopPropagation()
          }}
          sx={{
            width: { xs: '90%', sm: '70%', md: '50%' },
            maxWidth: 800,
            backgroundColor: 'white',
            borderRadius: '50px',
            '& .MuiOutlinedInput-root': {
              borderRadius: '50px',
              paddingLeft: '10px',
              paddingRight: '20px'
            }
          }}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <Search />
                </InputAdornment>
              )
            }
          }}
        />
        {players.length > 0 ? (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <PlayerTable players={players} mySteamIds={mySteamIds} setPlayers={setPlayers} />
            {loading && <LinearProgress color="secondary" style={{ width: '75%' }} />}
          </div>
        ) : (
          loading && <LinearProgress color="secondary" style={{ width: '75%' }} />
        )}
      </Box>
      <SteamIdDialog />
    </>
  )
}

export default App
