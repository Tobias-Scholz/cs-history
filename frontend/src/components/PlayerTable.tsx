import React from 'react'
import {
  Box,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  useTheme,
} from '@mui/material'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import Leetify from '../media/leetify.svg'
import Csrep from '../media/csrep.png'
import { Player } from '../types'
import { PlayerRow } from './PlayerRow'

export const PlayerTable = ({
  players,
  mySteamIds,
  setPlayers,
  fetchPlayer,
}: {
  players: Player[]
  mySteamIds: string[]
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>
  fetchPlayer: (id: string) => Promise<void>
}) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        width: { xs: '100%', sm: '90%', md: '80%', lg: '75%' },
        maxWidth: 1100,
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <Table aria-label="player table">
        <TableHead>
          <TableRow sx={{ backgroundColor: isDark ? '#0d1117' : '#f8fafc' }}>
            <TableCell sx={{ py: 1.25, pl: 1, width: 36, border: 0 }} />
            <TableCell
              colSpan={2}
              sx={{ py: 1.25, fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', letterSpacing: '0.05em', textTransform: 'uppercase', border: 0 }}
            >
              Player
            </TableCell>
            <TableCell
              align="right"
              sx={{ py: 1.25, fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', letterSpacing: '0.05em', textTransform: 'uppercase', border: 0 }}
            >
              VS
            </TableCell>
            <TableCell
              align="right"
              sx={{ py: 1.25, fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', letterSpacing: '0.05em', textTransform: 'uppercase', border: 0 }}
            >
              With
            </TableCell>
            <TableCell align="right" sx={{ py: 1.25, border: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                <Tooltip title="Open all on CSRep">
                  <img
                    src={Csrep}
                    alt="CSRep all"
                    style={{ width: 22, height: 22, cursor: 'pointer', opacity: 0.7 }}
                    onClick={() => players.forEach((p) => window.open(`https://csrep.gg/player/${p.steamId}`, '_blank'))}
                  />
                </Tooltip>
                <Tooltip title="Open all on Leetify">
                  <img
                    src={Leetify}
                    alt="Leetify all"
                    style={{ width: 24, height: 24, cursor: 'pointer', opacity: 0.7 }}
                    onClick={() => players.forEach((p) => window.open(`https://leetify.com/app/profile/${p.steamId}`, '_blank'))}
                  />
                </Tooltip>
              </Box>
            </TableCell>
            <TableCell align="right" sx={{ py: 1.25, pr: 1, border: 0 }}>
              <Tooltip title="Remove all">
                <IconButton
                  size="small"
                  aria-label="Remove all players"
                  onClick={() => setPlayers([])}
                  sx={{ opacity: 0.5, '&:hover': { opacity: 1, color: 'error.main' } }}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {players.map((player) => (
            <PlayerRow
              key={player.steamId}
              player={player}
              mySteamIds={mySteamIds}
              setPlayers={setPlayers}
              fetchPlayer={fetchPlayer}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
