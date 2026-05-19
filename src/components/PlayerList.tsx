import { useState, useMemo } from 'react'
import type { Player } from '../types'

const POS_COLORS: Record<string, string> = {
  QB: 'bg-red-500/20 text-red-300 border-red-700/40',
  RB: 'bg-green-500/20 text-green-300 border-green-700/40',
  WR: 'bg-blue-500/20 text-blue-300 border-blue-700/40',
  TE: 'bg-yellow-500/20 text-yellow-300 border-yellow-700/40',
  K:  'bg-gray-500/20 text-gray-300 border-gray-700/40',
  DEF:'bg-purple-500/20 text-purple-300 border-purple-700/40',
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

      {/* Column headers */}
      <div className="grid grid-cols-[2rem_1fr_3rem_3rem_4rem] gap-2 px-3 py-1.5 text-xs text-gray-500 border-b border-gray-800">
        <span>Rk</span>
        <span>Player</span>
        <span>Pos</span>
        <span>Team</span>
        <span className="text-right">ADP</span>
      </div>

      {/* Player rows */}
      <div className="flex-1 overflow-y-auto">
        {visible.length === 0 ? (
          <div className="text-center text-gray-600 text-sm py-8">No players found</div>
        ) : (
          visible.map((player) => (
            <PlayerRow
              key={player.id}
              player={player}
              globalRank={players.indexOf(player) + 1}
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
  currentRound,
}: {
  player: Player
  globalRank: number
  currentRound: number
}) {
  const isValue = player.adp > currentRound * 1.2
  const colorClass = POS_COLORS[player.position] ?? POS_COLORS.K
  const tierDot = TIER_DOT[player.tier] ?? 'bg-gray-700'

  return (
    <div
      className="w-full grid grid-cols-[2rem_1fr_3rem_3rem_4rem] gap-2 items-center px-3 py-2.5 border-b border-gray-800/40"
    >
      {/* Rank */}
      <span className="text-xs text-gray-500 tabular-nums">{globalRank}</span>

      {/* Name + tier dot */}
      <div className="flex items-center gap-2 min-w-0">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${tierDot}`} />
        <div className="min-w-0">
          <div className="text-sm font-medium text-white truncate leading-tight">
            {player.name}
            {player.injuryStatus && (
              <span className="ml-1.5 text-red-400 text-xs">({player.injuryStatus})</span>
            )}
          </div>
          {player.bye > 0 && (
            <div className="text-xs text-gray-600">Bye {player.bye}</div>
          )}
        </div>
      </div>

      {/* Position badge */}
      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded border text-center ${colorClass}`}>
        {player.position}
      </span>

      {/* Team */}
      <span className="text-xs text-gray-400 text-center">{player.team}</span>

      {/* ADP */}
      <span className={`text-xs tabular-nums text-right ${isValue ? 'text-green-400 font-semibold' : 'text-gray-400'}`}>
        {player.adp.toFixed(1)}
      </span>
    </div>
  )
}
