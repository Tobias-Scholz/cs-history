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
  Typography,
  Tooltip
} from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import WarningIcon from '@mui/icons-material/Warning'
import DeleteIcon from '@mui/icons-material/Delete'
import Leetify from '../media/leetify.svg'
import Faceit1 from '../media/faceit1.png'
import Faceit2 from '../media/faceit2.png'
import Faceit3 from '../media/faceit3.png'
import Faceit4 from '../media/faceit4.png'
import Faceit5 from '../media/faceit5.png'
import Faceit6 from '../media/faceit6.png'
import Faceit7 from '../media/faceit7.png'
import Faceit8 from '../media/faceit8.png'
import Faceit9 from '../media/faceit9.png'
import Faceit10 from '../media/faceit10.png'
import { formatDateTime } from '../utils/utils'
import { EloIcon } from './EloIcon'

function Row(props: {
  player: Player
  mySteamIds: string[]
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>
  fetchPlayer: (id: string) => Promise<void>
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

  const getFaceitImage = (elo: number) => {
    if (elo >= 2001) return Faceit10
    if (elo >= 1751) return Faceit9
    if (elo >= 1531) return Faceit8
    if (elo >= 1351) return Faceit7
    if (elo >= 1201) return Faceit6
    if (elo >= 1051) return Faceit5
    if (elo >= 901) return Faceit4
    if (elo >= 751) return Faceit3
    if (elo >= 501) return Faceit2
    return Faceit1
  }

  let elo = 0
  if (typeof player.faceit === 'object') {
    if (player.faceit.games.cs2) elo = player.faceit.games.cs2.faceit_elo
    else if (player.faceit.games.csgo) elo = player.faceit.games.csgo.faceit_elo
  }

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
          <a target="_blank" href={`https://steamcommunity.com/profiles/${player.steamId}`} rel="noopener noreferrer">
            <img height={40} width={40} alt="profilPic" src={player.profilePictureUrl} />
          </a>
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
            {typeof player.faceit === 'object' && (
              <a
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 2,
                  gap: 8,
                  textDecoration: 'none',
                  color: 'black'
                }}
                href={player.faceit.faceit_url.replace('{lang}', 'en')}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                ({elo}
                <EloIcon />)<img alt="faceit lvl" src={getFaceitImage(elo)} width={23} height={23}></img>
              </a>
            )}
            {player.faceit === 'timeout' && (
              <Tooltip title="Faceit API Timeout">
                <WarningIcon
                  style={{ cursor: 'pointer' }}
                  color="warning"
                  onClick={(e) => {
                    props.fetchPlayer(player.steamId)
                    e.stopPropagation()
                  }}
                />
              </Tooltip>
            )}
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <img src={'https://csstats.gg/favicon.ico'} alt="Leetify" height={28} width={28} />
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
  setPlayers,
  fetchPlayer
}: {
  players: Player[]
  mySteamIds: string[]
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>
  fetchPlayer: (id: string) => Promise<void>
}) => {
  return (
    <TableContainer component={Paper} sx={{ maxWidth: '75%' }}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: '0%' }} />
            <TableCell sx={{ width: '10%' }} />
            <TableCell sx={{ width: '30%' }}>Name</TableCell>
            <TableCell sx={{ width: '10%' }} align="right">
              VS
            </TableCell>
            <TableCell sx={{ width: '10%' }} align="right">
              With
            </TableCell>
            <TableCell sx={{ width: '25%' }} align="right">
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
            <Row
              key={player.name}
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
