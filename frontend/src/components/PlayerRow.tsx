import React from 'react'
import {
  Avatar,
  Box,
  Chip,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import Leetify from '../media/leetify.svg'
import Csrep from '../media/csrep.png'
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
import { EloIcon } from './EloIcon'
import { FACEIT_ELO_TIERS } from '../constants'
import { Match, Player } from '../types'
import { formatDateTime } from '../utils/utils'

const FACEIT_IMAGES = [
  Faceit1, Faceit2, Faceit3, Faceit4, Faceit5,
  Faceit6, Faceit7, Faceit8, Faceit9, Faceit10,
]

function getFaceitImage(elo: number): string {
  const tier = FACEIT_ELO_TIERS.find((t) => elo >= t.minElo) ?? FACEIT_ELO_TIERS[FACEIT_ELO_TIERS.length - 1]
  return FACEIT_IMAGES[tier.level - 1]
}

function getWinPerc(matches: Match[], mySteamIds: string[]): number {
  if (matches.length === 0) return 0
  let won = 0
  for (const match of matches) {
    const myTeam1 = mySteamIds.some((id) => match.players_team1.includes(id))
    if (myTeam1 && match.rounds_team1 > match.rounds_team2) won++
    if (!myTeam1 && match.rounds_team2 > match.rounds_team1) won++
  }
  return (won / matches.length) * 100
}

function getWinColor(perc: number, count: number, isDark: boolean): string {
  if (count === 0) return 'text.disabled'
  if (perc >= 55) return isDark ? '#4ade80' : '#16a34a'
  if (perc <= 45) return isDark ? '#f87171' : '#dc2626'
  return isDark ? '#fbbf24' : '#d97706'
}

function getMatchResult(
  match: Match,
  mySteamIds: string[],
  isDark: boolean
): { display: string; color: string } {
  const isTeam1 = mySteamIds.some((id) => match.players_team1.includes(id))
  const roundsFor = isTeam1 ? match.rounds_team1 : match.rounds_team2
  const roundsAgainst = isTeam1 ? match.rounds_team2 : match.rounds_team1
  const isWin = roundsFor > roundsAgainst
  const isLoss = roundsFor < roundsAgainst
  return {
    display: `${roundsFor} – ${roundsAgainst}`,
    color: isDark
      ? isWin ? '#4ade80' : isLoss ? '#f87171' : '#94a3b8'
      : isWin ? '#16a34a' : isLoss ? '#dc2626' : '#64748b',
  }
}

function StatChip({ count, perc, isDark }: { count: number; perc: number; isDark: boolean }) {
  return (
    <Box sx={{ textAlign: 'right' }}>
      {count === 0 ? (
        <Typography variant="body2" sx={{ color: 'text.disabled' }}>—</Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.25 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1 }}>{count}</Typography>
          <Typography
            variant="caption"
            sx={{ color: getWinColor(perc, count, isDark), fontWeight: 700, lineHeight: 1 }}
          >
            {Math.round(perc)}%
          </Typography>
        </Box>
      )}
    </Box>
  )
}

function HistoryTable({
  matches,
  label,
  mySteamIds,
  isDark,
}: {
  matches: Match[]
  label: string
  mySteamIds: string[]
  isDark: boolean
}) {
  return (
    <Box>
      <Typography
        variant="overline"
        sx={{
          fontWeight: 700,
          letterSpacing: '0.1em',
          color: 'text.secondary',
          fontSize: '0.65rem',
          display: 'block',
          mb: 1,
        }}
      >
        {label}
      </Typography>
      <Table size="small" aria-label="matches">
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: 'text.secondary', fontSize: '0.75rem', py: 0.75 }}>Date</TableCell>
            <TableCell sx={{ color: 'text.secondary', fontSize: '0.75rem', py: 0.75 }}>Map</TableCell>
            <TableCell align="center" sx={{ color: 'text.secondary', fontSize: '0.75rem', py: 0.75 }}>Result</TableCell>
            <TableCell align="right" sx={{ color: 'text.secondary', fontSize: '0.75rem', py: 0.75 }}>Match</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {matches.map((match) => {
            const result = getMatchResult(match, mySteamIds, isDark)
            return (
              <TableRow
                key={match.id}
                sx={{ '&:last-child td': { border: 0 }, '&:hover': { backgroundColor: 'action.hover' } }}
              >
                <TableCell sx={{ fontSize: '0.8rem', py: 0.75 }}>{formatDateTime(match.date)}</TableCell>
                <TableCell sx={{ fontSize: '0.8rem', py: 0.75 }}>{match.map}</TableCell>
                <TableCell align="center" sx={{ color: result.color, fontWeight: 700, fontSize: '0.85rem', py: 0.75 }}>
                  {result.display}
                </TableCell>
                <TableCell align="right" sx={{ py: 0.75 }}>
                  <a
                    href={`https://leetify.com/app/match-details/${match.id}/overview/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{ display: 'inline-flex', opacity: 0.85 }}
                  >
                    <img src={Leetify} alt="Leetify" style={{ width: 22, height: 22 }} />
                  </a>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Box>
  )
}

export interface PlayerRowProps {
  player: Player
  mySteamIds: string[]
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>
  fetchPlayer: (id: string) => Promise<void>
}

export function PlayerRow({ player, mySteamIds, setPlayers, fetchPlayer }: PlayerRowProps) {
  const [open, setOpen] = React.useState(false)
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const vsMatches = player.matches
    .filter((m) => m.vs)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const withMatches = player.matches
    .filter((m) => !m.vs)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const vsPerc = getWinPerc(vsMatches, mySteamIds)
  const withPerc = getWinPerc(withMatches, mySteamIds)

  let elo = 0
  if (typeof player.faceit === 'object') {
    elo = player.faceit.games.cs2?.faceit_elo ?? player.faceit.games.csgo?.faceit_elo ?? 0
  }

  const hasMatches = player.matches.length > 0

  return (
    <React.Fragment>
      <TableRow
        onClick={hasMatches ? () => setOpen((v) => !v) : undefined}
        sx={{
          '& > *': { borderBottom: open ? 'unset' : undefined },
          cursor: hasMatches ? 'pointer' : 'auto',
          '&:hover': { backgroundColor: 'action.hover' },
          transition: 'background-color 0.15s ease',
        }}
      >
        {/* Expand */}
        <TableCell sx={{ py: 1, pl: 1, pr: 0, width: 36 }}>
          {hasMatches && (
            <IconButton
              size="small"
              aria-label={open ? 'Collapse row' : 'Expand row'}
              onClick={(e) => { setOpen((v) => !v); e.stopPropagation() }}
              sx={{ p: 0.5 }}
            >
              {open ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
            </IconButton>
          )}
        </TableCell>

        {/* Avatar + Name */}
        <TableCell sx={{ py: 1 }} colSpan={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <a
              href={`https://steamcommunity.com/profiles/${player.steamId}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <Avatar
                src={player.profilePictureUrl}
                alt={player.name}
                sx={{ width: 36, height: 36, border: '2px solid', borderColor: isDark ? '#30363d' : '#e2e8f0' }}
              />
            </a>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{player.name}</Typography>
          </Box>
        </TableCell>

        {/* VS */}
        <TableCell align="right" sx={{ py: 1 }}>
          <StatChip count={vsMatches.length} perc={vsPerc} isDark={isDark} />
        </TableCell>

        {/* With */}
        <TableCell align="right" sx={{ py: 1 }}>
          <StatChip count={withMatches.length} perc={withPerc} isDark={isDark} />
        </TableCell>

        {/* Links + FACEIT */}
        <TableCell align="right" sx={{ py: 1 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
            {typeof player.faceit === 'object' && (
              <Tooltip title={`FACEIT ELO: ${elo}`}>
                <a
                  href={player.faceit.faceit_url.replace('{lang}', 'en')}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}
                >
                  <Chip
                    icon={<EloIcon />}
                    label={elo}
                    size="small"
                    sx={{
                      fontSize: '0.7rem',
                      height: 22,
                      fontWeight: 700,
                      color: isDark ? 'white' : 'black',
                      backgroundColor: isDark ? '#21262d' : '#f1f5f9',
                      '& .MuiChip-icon': { fontSize: 14, ml: 0.5 },
                    }}
                  />
                  <img alt="FACEIT level" src={getFaceitImage(elo)} width={22} height={22} />
                </a>
              </Tooltip>
            )}
            {player.faceit === 'timeout' && (
              <Tooltip title="FACEIT API timeout — click to retry">
                <WarningAmberIcon
                  fontSize="small"
                  color="warning"
                  sx={{ cursor: 'pointer' }}
                  onClick={(e) => { fetchPlayer(player.steamId); e.stopPropagation() }}
                />
              </Tooltip>
            )}
            <Tooltip title="CSRep">
              <a
                href={`https://csrep.gg/player/${player.steamId}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{ display: 'flex', opacity: 0.85 }}
              >
                <img src={Csrep} alt="CSRep" style={{ width: 22, height: 22 }} />
              </a>
            </Tooltip>
            <Tooltip title="Leetify profile">
              <a
                href={`https://leetify.com/app/profile/${player.steamId}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{ display: 'flex', opacity: 0.85 }}
              >
                <img src={Leetify} alt="Leetify" style={{ width: 24, height: 24 }} />
              </a>
            </Tooltip>
            <Tooltip title="CSStats">
              <a
                href={`https://csstats.gg/player/${player.steamId}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{ display: 'flex', opacity: 0.85 }}
              >
                <img src="https://csstats.gg/favicon.ico" alt="CSStats" height={22} width={22} />
              </a>
            </Tooltip>
          </Box>
        </TableCell>

        {/* Delete */}
        <TableCell align="right" sx={{ py: 1, pr: 1 }}>
          <Tooltip title="Remove">
            <IconButton
              size="small"
              aria-label="Remove player"
              onClick={(e) => {
                setPlayers((prev) => prev.filter((p) => p.steamId !== player.steamId))
                e.stopPropagation()
              }}
              sx={{ opacity: 0.5, '&:hover': { opacity: 1, color: 'error.main' } }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>

      {/* Expanded match history */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box
              sx={{
                mx: 2,
                my: 2,
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                gap: 4,
              }}
            >
              {vsMatches.length > 0 && (
                <Box sx={{ flex: 1 }}>
                  <HistoryTable matches={vsMatches} label="Against" mySteamIds={mySteamIds} isDark={isDark} />
                </Box>
              )}
              {withMatches.length > 0 && (
                <Box sx={{ flex: 1 }}>
                  <HistoryTable matches={withMatches} label="Together" mySteamIds={mySteamIds} isDark={isDark} />
                </Box>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  )
}
