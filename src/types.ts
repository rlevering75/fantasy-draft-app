export type Position = 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF'
export type ScoringFormat = 'standard' | 'half-ppr' | 'ppr'

export interface Player {
  id: string
  name: string
  position: Position
  team: string
  adp: number   // half-ppr adp; lower = earlier pick
  rank: number
  bye: number
  tier: number
  age?: number
  injuryStatus?: string | null
  notes?: string
}

export interface DraftPick {
  overallPick: number
  round: number
  roundPick: number
  teamSlot: number   // 1-based draft slot of the team that picked
  player: Player
  isMyPick: boolean
}

export interface DraftSettings {
  teamCount: number
  rounds: number
  myPickPosition: number   // 1-based snake draft slot
  scoringFormat: ScoringFormat
}

export interface Recommendation {
  priority: 'must' | 'high' | 'value'
  label: string
  reason: string
  positions: Position[]
  players: Player[]
}

export interface Strategy {
  id: string
  label: string
  description: string
  winRate: number         // 0-100
  color: string           // tailwind bg class
  detect: (picks: Player[], round: number) => boolean
}

export interface SleeperRawPlayer {
  player_id: string
  first_name: string
  last_name: string
  full_name?: string
  position: string
  team: string | null
  age: number | null
  search_rank: number | null
  active: boolean
  injury_status: string | null
  bye_week?: number | null
  status?: string
}

export interface SleeperDraftInfo {
  draft_id: string
  type: string
  status: 'pre_draft' | 'drafting' | 'complete' | 'paused'
  settings: {
    teams: number
    rounds: number
  }
  season: string
}

export interface SleeperPick {
  pick_no: number
  round: number
  draft_slot: number
  player_id: string
  roster_id: number
  metadata: {
    first_name: string
    last_name: string
    position: string
    team: string
    injury_status?: string
  }
}
