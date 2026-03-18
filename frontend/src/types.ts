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

export type GameInfo = {
  region: string
  game_player_id: string
  skill_level: number
  faceit_elo: number
  game_player_name: string
  skill_level_label: string
  regions: Record<string, unknown>
  game_profile_id: string
}

export type FaceitPlayerInfo = {
  player_id: string
  nickname: string
  avatar: string
  country: string
  cover_image: string
  platforms: { steam: string }
  games: {
    csgo?: GameInfo
    cs2?: GameInfo
  }
  settings: { language: string }
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

export interface Player {
  steamId: string
  name: string
  profilePictureUrl: string
  matches: Match[]
  faceit?: FaceitPlayerInfo | 'timeout'
}
