import React from 'react'
import { Match, Player } from '../App'
import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Collapse,
  Box,
  IconButton,
  Typography
} from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import DeleteIcon from '@mui/icons-material/Delete'
import Leetify from '../media/leetify.svg'
import { formatDateTime } from '../utils/utils'

function Row(props: {
  player: Player
  mySteamIds: string[]
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>
}) {
  const { player, mySteamIds, setPlayers } = props
  const [open, setOpen] = React.useState(false)

  const cellStyle = { paddingTop: '8px', paddingBottom: '8px' }

  const vsMatches = player.matches
    .filter((match) => match.vs)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const withMatches = player.matches
    .filter((match) => !match.vs)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const getWinPerc = (matches: Match[]) => {
    if (matches.length === 0) return 0
    let won = 0
    for (const match of matches) {
      if (
        mySteamIds.some((steamId) => match.players_team1.includes(steamId)) &&
        match.rounds_team1 > match.rounds_team2
      )
        won++
      if (
        mySteamIds.some((steamId) => match.players_team2.includes(steamId)) &&
        match.rounds_team2 > match.rounds_team1
      )
        won++
    }
    return (won / matches.length) * 100
  }

  const vs_perc = getWinPerc(vsMatches)
  const with_perc = getWinPerc(withMatches)

  const HistoryTable = ({ matches }: { matches: Match[] }) => {
    const matchResult = (match: Match) => {
      if (mySteamIds.some((steamId) => match.players_team1.includes(steamId))) {
        return {
          display: `${match.rounds_team1}-${match.rounds_team2}`,
          color:
            match.rounds_team1 > match.rounds_team2
              ? 'green'
              : match.rounds_team1 < match.rounds_team2
              ? 'red'
              : 'black'
        }
      }
      return {
        display: `${match.rounds_team2}-${match.rounds_team1}`,
        color:
          match.rounds_team2 > match.rounds_team1 ? 'green' : match.rounds_team2 < match.rounds_team1 ? 'red' : 'black'
      }
    }

    return (
      <Table size="small" aria-label="matches">
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: '25%' }}>Date</TableCell>
            <TableCell sx={{ width: '25%' }}>Map</TableCell>
            <TableCell sx={{ width: '25%' }} align="center">
              Result
            </TableCell>
            <TableCell sx={{ width: '25%' }} align="right">
              Link
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {matches.map((match) => (
            <TableRow key={match.id}>
              <TableCell component="th" scope="row">
                {formatDateTime(match.date)}
              </TableCell>
              <TableCell>{match.map}</TableCell>
              <TableCell align="center" sx={{ color: matchResult(match).color, fontWeight: 'bold' }}>
                {matchResult(match).display}
              </TableCell>
              <TableCell align="right">
                <a
                  href={`https://leetify.com/app/match-details/${match.id}/overview/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img src={Leetify} alt="Leetify" style={{ width: '30px', height: '30px' }} />
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  return (
    <React.Fragment>
      <TableRow
        onClick={player.matches.length > 0 ? () => setOpen(!open) : undefined}
        sx={{ '& > *': { borderBottom: 'unset' }, cursor: player.matches.length > 0 ? 'pointer' : 'auto' }}
      >
        <TableCell sx={cellStyle}>
          {player.matches.length > 0 && (
            <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          )}
        </TableCell>
        <TableCell sx={cellStyle} component="th" scope="row">
          <img height={50} width={50} alt="profilPic" src={player.profilePictureUrl}></img>
        </TableCell>
        <TableCell sx={cellStyle}>{player.name}</TableCell>
        <TableCell sx={cellStyle} align="right">
          {!vsMatches.length ? '0' : `${vsMatches.length} (${Math.round(vs_perc)}%)`}
        </TableCell>
        <TableCell sx={cellStyle} align="right">
          {!withMatches.length ? '0' : `${withMatches.length} (${Math.round(with_perc)}%)`}
        </TableCell>
        <TableCell sx={cellStyle} align="right">
          <div
            style={{
              display: 'flex',
              gap: '10px',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end'
            }}
          >
            <a
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              href={'https://leetify.com/app/profile/' + player.steamId}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={Leetify} alt="Leetify" style={{ width: '30px', height: '30px' }} />
            </a>
            <a
              href={'https://csstats.gg/player/' + player.steamId}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                height: 22,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '3px'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <img src={'https://csstats.gg/favicon.ico'} alt="Leetify" height={22} width={22} />
            </a>
          </div>
        </TableCell>
        <TableCell sx={cellStyle} align="right">
          <IconButton
            onClick={() => setPlayers((players) => [...players.filter((p) => p.steamId !== player.steamId)])}
            aria-label="delete"
            color="primary"
          >
            <DeleteIcon />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {vsMatches.length > 0 && (
                <>
                  <Typography variant="h6" gutterBottom component="div">
                    Against
                  </Typography>
                  <HistoryTable matches={vsMatches} />{' '}
                </>
              )}
              {withMatches.length > 0 && (
                <>
                  <Typography variant="h6" gutterBottom component="div">
                    Together
                  </Typography>
                  <HistoryTable matches={withMatches} />{' '}
                </>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  )
}

export const PlayerTable = ({
  players,
  mySteamIds,
  setPlayers
}: {
  players: Player[]
  mySteamIds: string[]
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>
}) => {
  return (
    <TableContainer component={Paper} sx={{ maxWidth: '75%' }}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: '5%' }} />
            <TableCell sx={{ width: '10%' }} />
            <TableCell sx={{ width: '35%' }}>Name</TableCell>
            <TableCell sx={{ width: '10%' }} align="right">
              VS
            </TableCell>
            <TableCell sx={{ width: '10%' }} align="right">
              With
            </TableCell>
            <TableCell sx={{ width: '20%' }} align="right">
              Links
            </TableCell>
            <TableCell sx={{ width: '10%' }} align="right">
              <IconButton onClick={() => setPlayers([])} aria-label="delete" color="primary">
                <DeleteIcon />
              </IconButton>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {players.map((player) => (
            <Row key={player.name} player={player} mySteamIds={mySteamIds} setPlayers={setPlayers} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
