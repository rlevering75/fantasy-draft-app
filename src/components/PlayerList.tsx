import { useState, useMemo } from 'react'
import type { Player } from '../types'

const POS_COLORS: Record<string, string> = {
  QB:  'bg-red-500/20 text-red-300 border-red-700/40',
  RB:  'bg-green-500/20 text-green-300 border-green-700/40',
  WR:  'bg-blue-500/20 text-blue-300 border-blue-700/40',
  TE:  'bg-yellow-500/20 text-yellow-300 border-yellow-700/40',
  K:   'bg-gray-500/20 text-gray-300 border-gray-700/40',
  DEF: 'bg-purple-500/20 text-purple-300 border-purple-700/40',
}

const POS_RANK_COLORS: Record<string, string> = {
  QB:  'text-red-400',
  RB:  'text-green-400',
  WR:  'text-blue-400',
  TE:  'text-yellow-400',
  K:   'text-gray-400',
  DEF: 'text-purple-400',
}

const TIER_DOT: Record<number, string> = {
  1: 'bg-amber-400',
  2: 'bg-blue-400',
  3: 'bg-green-400',
  4: 'bg-gray-400',
  5: 'bg-gray-600',
}

interface Props {
  players: Player[]
  currentRound: number
}

const POSITIONS = ['ALL', 'QB', 'RB', 'WR', 'TE', 'K', 'DEF'] as const

export default function PlayerList({ players, currentRound }: Props) {
  const [search, setSearch] = useState('')
  const [posFilter, setPosFilter] = useState<string>('ALL')

  // Position rank among still-available players (RB1 = best available RB on the board)
  const positionRanks = useMemo(() => {
    const counters: Record<string, number> = {}
    const ranks: Record<string, number> = {}
    for (const p of players) {
      counters[p.position] = (counters[p.position] || 0) + 1
      ranks[p.id] = counters[p.position]
    }
    return ranks
  }, [players])

  const visible = useMemo(() => {
    let list = players
    if (posFilter !== 'ALL') list = list.filter(p => p.position === posFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.team.toLowerCase().includes(q))
    }
    return list.slice(0, 80)
  }, [players, posFilter, search])

  return (
    <div className="flex flex-col h-full">
      {/* Search + filter */}
      <div className="p-3 border-b border-gray-800 space-y-2">
        <input
          type="text"
          placeholder="Search players…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <div className="flex gap-1 flex-wrap">
          {POSITIONS.map(pos => (
            <button
              key={pos}
              onClick={() => setPosFilter(pos)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                posFilter === pos
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      {/* Column headers — Rk | Player | Pos | PosRk | ADP */}
      <div className="grid grid-cols-[1.5rem_1fr_2.5rem_3.5rem_4rem] gap-2 px-3 py-1.5 text-xs text-gray-500 border-b border-gray-800">
        <span>#</span>
        <span>Player</span>
        <span>Pos</span>
        <span>PosRk</span>
        <span className="text-right">ADP</span>
      </div>

      {/* Player rows */}
      <div className="flex-1 overflow-y-auto">
        {visible.length === 0 ? (
          <div className="text-center text-gray-600 text-sm py-8">No players found</div>
        ) : (
          visible.map(player => (
            <PlayerRow
              key={player.id}
              player={player}
              globalRank={players.indexOf(player) + 1}
              posRank={positionRanks[player.id] ?? 0}
              currentRound={currentRound}
            />
          ))
        )}
      </div>

      <div className="text-center text-gray-600 text-xs py-2 border-t border-gray-800">
        {players.length} players available
      </div>
    </div>
  )
}

function PlayerRow({
  player,
  globalRank,
  posRank,
  currentRound,
}: {
  player: Player
  globalRank: number
  posRank: number
  currentRound: number
}) {
  const colorClass = POS_COLORS[player.position] ?? POS_COLORS.K
  const posRankColor = POS_RANK_COLORS[player.position] ?? 'text-gray-400'
  const tierDot = TIER_DOT[player.tier] ?? 'bg-gray-700'

  // Value vs current pick timing (ADP / 10 approximates the round it will be drafted)
  const adpRound = player.adp / 10
  const roundDiff = adpRound - currentRound
  const adpClass =
    roundDiff >= 2   ? 'text-green-400 font-bold'   // clear steal — going 2+ rounds later than now
    : roundDiff >= 1 ? 'text-green-300 font-semibold' // mild value
    : roundDiff <= -2 ? 'text-orange-400'              // clear reach
    : 'text-gray-400'

  const valueLabel =
    roundDiff >= 2   ? '▲ steal'
    : roundDiff >= 1 ? '▲ val'
    : roundDiff <= -2 ? '▽ reach'
    : null

  return (
    <div className="w-full grid grid-cols-[1.5rem_1fr_2.5rem_3.5rem_4rem] gap-2 items-center px-3 py-2 border-b border-gray-800/40">
      {/* Rank */}
      <span className="text-xs text-gray-600 tabular-nums">{globalRank}</span>

      {/* Name + team */}
      <div className="flex items-center gap-1.5 min-w-0">
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${tierDot}`} />
        <div className="min-w-0">
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="text-sm font-medium text-white truncate leading-tight">
              {player.name}
            </span>
            {player.injuryStatus && (
              <span className="text-red-400 text-xs flex-shrink-0">({player.injuryStatus})</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-600">{player.team}</span>
            {valueLabel && (
              <span className={`text-[10px] font-semibold ${roundDiff >= 1 ? 'text-green-500' : 'text-orange-400'}`}>
                {valueLabel}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Position badge */}
      <span className={`text-xs font-semibold px-1 py-0.5 rounded border text-center ${colorClass}`}>
        {player.position}
      </span>

      {/* Position rank among available players */}
      <span className={`text-xs font-bold tabular-nums ${posRankColor}`}>
        {player.position}{posRank}
      </span>

      {/* ADP */}
      <span className={`text-xs tabular-nums text-right ${adpClass}`}>
        {player.adp.toFixed(1)}
      </span>
    </div>
  )
}
