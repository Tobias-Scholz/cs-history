import React from 'react'
import './App.css'
import { Box, InputAdornment, TextField } from '@mui/material'
import { Search } from '@mui/icons-material'

interface PlayerData {
  name: string
  steam64Id: number
  matches: {
    players_team1: number[]
    players_team2: number[]
    rounds_team1: number
    rounds_team2: number
    map: string
    date: Date
  }[]
}

type TransformedData = Pick<PlayerData, 'name' | 'steam64Id'> & {
  played_against: {
    map: string
    score: string
    outcome: 'win' | 'loss'
    date: Date
  }[]
}

function App() {
  const data = [
    {
      name: 'Tobeyyy',
      steam64Id: 1,
      matches: [
        {
          players_team1: [1, 2, 3, 4, 5],
          players_team2: [6, 7, 8, 9, 10],
          rounds_team1: 16,
          rounds_team2: 13
        }
      ]
    }
  ]

  const mySteamId = 7

  function mapData(data: {}[]) {}

  return (
    <Box
      component="form"
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'
      }}
    >
      <TextField
        fullWidth
        placeholder="Search..."
        variant="outlined"
        sx={{
          width: { xs: '90%', sm: '70%', md: '50%' },
          maxWidth: 800,
          backgroundColor: 'white',
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
    </Box>
  )
}

export default App
