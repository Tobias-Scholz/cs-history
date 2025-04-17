import { Search } from '@mui/icons-material'
import { Box, IconButton, InputAdornment, LinearProgress, TextField } from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import './App.css'
import { PlayerTable } from './components/PlayerTable'
import { SteamIdDialog } from './components/SteamIdDialog'
import EditIcon from '@mui/icons-material/Edit'

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

export interface Player {
  steamId: string
  name: string
  profilePictureUrl: string
  matches: Match[]
  faceit?: FaceitPlayerInfo | 'timeout'
}

const baseUrl = 'https://cs-history.netlify.app'
// const baseUrl = 'http://localhost:8888'

function App() {
  const [input, setInput] = useState('')
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(false)
  const mySteamIds = JSON.parse(localStorage.getItem('mySteamIds') || '[]') as string[]

  const [open, setOpen] = useState(!localStorage.getItem('mySteamIds'))

  const queryClient = useQueryClient()

  const fetchPlayer = async (query: string) => {
    if (!query || !mySteamIds) return
    setLoading(true)
    const response = await queryClient.fetchQuery<Response>({
      queryKey: ['history', query],
      retry: 2,
      queryFn: () =>
        fetch(baseUrl + '/.netlify/functions/history', {
          method: 'POST',
          body: JSON.stringify({ mySteamIds, query })
        }),
      staleTime: 0
    })
    setInput('')
    setLoading(false)
    if (response.status !== 200) return

    const player = (await response.json()) as Player
    setPlayers((players) => [...players.filter((p) => p.steamId !== player.steamId), player])
  }

  return (
    <div style={{ height: '100%', minHeight: '100vh', backgroundColor: '#F7F7F7' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '75px',
          paddingTop: '75px'
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
            <PlayerTable players={players} mySteamIds={mySteamIds} setPlayers={setPlayers} fetchPlayer={fetchPlayer} />
            {loading && <LinearProgress color="secondary" style={{ width: '75%' }} />}
          </div>
        ) : (
          loading && <LinearProgress color="secondary" style={{ width: '75%' }} />
        )}
      </Box>
      <SteamIdDialog open={open} setOpen={setOpen} />
      <div style={{ position: 'fixed', bottom: 0, right: 0, textAlign: 'right', fontSize: 12 }}>
        <IconButton color="primary" onClick={() => setOpen(true)} aria-label="edit">
          <EditIcon />
        </IconButton>
        My SteamIDs
        <br />
        {mySteamIds.map((s, index) => (
          <span key={index}>
            {s}
            <br />
          </span>
        ))}
      </div>
    </div>
  )
}

export default App
