import { useState, useMemo, useRef, useEffect } from 'react'
import type { Player } from '../types'
import type { ExpertData } from '../hooks/useExpertRankings'
import type { FPEcrData } from '../hooks/useFantasyProsECR'

const POS_TEXT: Record<string, string> = {
  QB: 'text-red-400', RB: 'text-green-400',
  WR: 'text-blue-400', TE: 'text-yellow-400',
  K: 'text-gray-400', DEF: 'text-purple-400',
}
const POS_BADGE: Record<string, string> = {
  QB: 'bg-red-500/20 text-red-300 border-red-700/40',
  RB: 'bg-green-500/20 text-green-300 border-green-700/40',
  WR: 'bg-blue-500/20 text-blue-300 border-blue-700/40',
  TE: 'bg-yellow-500/20 text-yellow-300 border-yellow-700/40',
  K: 'bg-gray-500/20 text-gray-300 border-gray-700/40',
  DEF: 'bg-purple-500/20 text-purple-300 border-purple-700/40',
}

// Position-specific prime-age windows (Flock Fantasy-style age curve)
const PEAK: Record<string, [number, number]> = {
  QB: [26, 34], RB: [22, 26], WR: [23, 29], TE: [25, 30], K: [25, 38], DEF: [25, 35],
}
const MAX_AGE: Record<string, number> = {
  QB: 38, RB: 32, WR: 34, TE: 34, K: 42, DEF: 38,
}
const MIN_AGE = 20

function careerPhase(age: number, pos: string) {
  const [s, e] = PEAK[pos] ?? [24, 30]
  if (age < s)      return { label: 'Ascending',  color: 'text-blue-400',   dot: 'bg-blue-400',   risk: 'Low',  riskColor: 'text-green-400' }
  if (age <= e)     return { label: 'Prime',       color: 'text-green-400',  dot: 'bg-green-400',  risk: 'Low',  riskColor: 'text-green-400' }
  if (age <= e + 2) return { label: 'Late Prime',  color: 'text-yellow-400', dot: 'bg-yellow-400', risk: 'Med',  riskColor: 'text-yellow-400' }
  return                   { label: 'Declining',   color: 'text-orange-400', dot: 'bg-orange-400', risk: 'High', riskColor: 'text-orange-400' }
}

function AgeBar({ age, pos }: { age: number; pos: string }) {
  const [peakStart, peakEnd] = PEAK[pos] ?? [24, 30]
  const maxAge = MAX_AGE[pos] ?? 36
  const range = maxAge - MIN_AGE
  const pct = (a: number) => Math.max(0, Math.min(100, ((a - MIN_AGE) / range) * 100))

  return (
    <div className="mt-1.5 mb-3">
      <div className="relative h-1.5 bg-gray-800 rounded-full">
        {/* Prime zone */}
        <div
          className="absolute h-full bg-green-900/70 rounded-full"
          style={{ left: `${pct(peakStart)}%`, width: `${pct(peakEnd) - pct(peakStart)}%` }}
        />
        {/* Age marker */}
        <div
          className="absolute w-2.5 h-2.5 rounded-full bg-white border-2 border-gray-900 -top-0.5"
          style={{ left: `calc(${pct(age)}% - 5px)` }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[8px] text-gray-700">{MIN_AGE}</span>
        <span className="text-[8px] text-green-900 font-medium">peak {peakStart}–{peakEnd}</span>
        <span className="text-[8px] text-gray-700">{maxAge}</span>
      </div>
    </div>
  )
}

function Metric({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="flex items-baseline justify-between py-0.5">
      <span className="text-[9px] text-gray-600">{label}</span>
      <div className="text-right">
        <span className="text-[10px] text-gray-200 font-medium">{value}</span>
        {sub && <span className="text-[8px] text-gray-600 ml-1">{sub}</span>}
      </div>
    </div>
  )
}

function Divider({ label }: { label: string }) {
  return (
    <div className="text-[9px] font-semibold text-gray-600 uppercase tracking-wider pt-2 pb-0.5 border-t border-gray-800/60 mt-1">
      {label}
    </div>
  )
}

interface CardProps {
  player: Player
  availableIds: Set<string>
  currentRound: number
  expertData: ExpertData | null
  espnAdpByName: Record<string, number> | null
  fpEcr: FPEcrData | null
  posRank: number
}

function PlayerCard({ player, availableIds, currentRound, expertData, espnAdpByName, fpEcr, posRank }: CardProps) {
  const available = availableIds.has(player.id)
  const adpRound = player.adp / 10
  const roundDiff = adpRound - currentRound
  const valueLabel = roundDiff >= 2 ? '▲ steal' : roundDiff >= 1 ? '▲ value' : roundDiff <= -2 ? '▽ reach' : '—'
  const valueColor = roundDiff >= 1 ? 'text-green-400' : roundDiff <= -2 ? 'text-orange-400' : 'text-gray-500'

  const slrAdp  = player.sleeperAdp ?? player.adp
  const espnAdp = espnAdpByName?.[player.name.toLowerCase().trim()] ?? null
  const projPts = expertData?.projectedPts[player.id] ?? null
  const fpData  = fpEcr?.byName[player.name.toLowerCase().trim()] ?? null
  const phase   = player.age != null ? careerPhase(player.age, player.position) : null

  return (
    <div className={`rounded-xl border flex flex-col overflow-hidden text-xs ${
      available ? 'border-gray-700' : 'border-gray-800/50 opacity-55'
    }`}>
      {/* Header */}
      <div className="bg-gray-800/50 px-2.5 py-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${POS_BADGE[player.position] ?? ''}`}>
            {player.position}
          </span>
          {!available && <span className="text-[8px] text-red-500 font-bold">DRAFTED</span>}
        </div>
        <div className="font-bold text-white mt-1 leading-tight text-[11px]">{player.name}</div>
        <div className="text-[10px] text-gray-500">{player.team}</div>
      </div>

      <div className="px-2.5 py-2 flex-1 space-y-0">
        {/* Age / career phase (Flock Fantasy-style) */}
        {player.age != null ? (
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-gray-500">Age {player.age}</span>
              {phase && (
                <div className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${phase.dot}`} />
                  <span className={`text-[9px] font-semibold ${phase.color}`}>{phase.label}</span>
                </div>
              )}
            </div>
            <AgeBar age={player.age} pos={player.position} />
            {phase && (
              <div className="text-[9px] text-gray-600 -mt-1">
                Age risk: <span className={phase.riskColor}>{phase.risk}</span>
              </div>
            )}
          </div>
        ) : (
          <span className="text-[9px] text-gray-700">Age unavailable</span>
        )}

        <Divider label="ADP" />
        <Metric label="Consensus" value={player.adp.toFixed(1)} />
        <Metric label="Sleeper" value={slrAdp.toFixed(1)} />
        {espnAdp != null && <Metric label="ESPN" value={espnAdp.toFixed(1)} />}
        {fpData   && <Metric label="FP ECR" value={fpData.rank} sub={fpData.posRank} />}

        <Divider label="Rankings" />
        <Metric label="Tier" value={player.tier} />
        <Metric
          label="Pos rank"
          value={<span className={POS_TEXT[player.position]}>{player.position}{posRank}</span>}
        />
        <Metric
          label="Value"
          value={<span className={valueColor}>{valueLabel}</span>}
        />

        {projPts != null && (
          <>
            <Divider label="Projections" />
            <Metric label="Sleeper proj pts" value={projPts.toFixed(1)} sub="PPR" />
          </>
        )}
      </div>
    </div>
  )
}

interface Props {
  allPlayers: Player[]
  availableIds: Set<string>
  currentRound: number
  expertData: ExpertData | null
  espnAdpByName: Record<string, number> | null
  fpEcr: FPEcrData | null
}

export default function ComparePanel({ allPlayers, availableIds, currentRound, expertData, espnAdpByName, fpEcr }: Props) {
  const [slots, setSlots] = useState<(Player | null)[]>([null, null, null])
  const [queries, setQueries] = useState(['', '', ''])
  const [openSlot, setOpenSlot] = useState<number | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpenSlot(null)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  const posRanks = useMemo(() => {
    const counters: Record<string, number> = {}
    const out: Record<string, number> = {}
    for (const p of [...allPlayers].sort((a, b) => a.adp - b.adp)) {
      counters[p.position] = (counters[p.position] ?? 0) + 1
      out[p.id] = counters[p.position]
    }
    return out
  }, [allPlayers])

  function dropdownResults(slotIdx: number) {
    const q = queries[slotIdx].toLowerCase().trim()
    if (!q) return []
    const taken = new Set(slots.map(s => s?.id).filter(Boolean))
    return allPlayers
      .filter(p => !taken.has(p.id) && (p.name.toLowerCase().includes(q) || p.team.toLowerCase().includes(q)))
      .slice(0, 8)
  }

  function selectPlayer(slotIdx: number, player: Player) {
    setSlots(prev => { const n = [...prev]; n[slotIdx] = player; return n })
    setQueries(prev => { const n = [...prev]; n[slotIdx] = ''; return n })
    setOpenSlot(null)
  }

  function clearSlot(slotIdx: number) {
    setSlots(prev => { const n = [...prev]; n[slotIdx] = null; return n })
  }

  const hasAny = slots.some(s => s !== null)

  return (
    <div ref={panelRef} className="flex flex-col h-full overflow-hidden">
      {/* Search bars */}
      <div className="grid grid-cols-3 gap-2 p-3 border-b border-gray-800 flex-shrink-0">
        {[0, 1, 2].map(i => (
          <div key={i} className="relative">
            {slots[i] ? (
              <div className="flex items-center gap-1 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5">
                <span className={`text-[10px] font-bold truncate flex-1 ${POS_TEXT[slots[i]!.position]}`}>
                  {slots[i]!.name.split(' ').pop()}
                </span>
                <button onClick={() => clearSlot(i)} className="text-gray-600 hover:text-white text-sm leading-none flex-shrink-0">×</button>
              </div>
            ) : (
              <input
                type="text"
                placeholder={`Player ${i + 1}…`}
                value={queries[i]}
                onChange={e => {
                  const n = [...queries]; n[i] = e.target.value; setQueries(n)
                  setOpenSlot(e.target.value ? i : null)
                }}
                onFocus={() => { if (queries[i]) setOpenSlot(i) }}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-[11px] text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            )}

            {openSlot === i && dropdownResults(i).length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
                {dropdownResults(i).map(p => (
                  <button
                    key={p.id}
                    onMouseDown={() => selectPlayer(i, p)}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-gray-800 text-left"
                  >
                    <span className={`text-[9px] font-bold flex-shrink-0 ${POS_TEXT[p.position]}`}>{p.position}</span>
                    <span className="text-[11px] text-white truncate">{p.name}</span>
                    <span className="text-[9px] text-gray-600 flex-shrink-0">{p.team}</span>
                    {!availableIds.has(p.id) && <span className="text-[8px] text-red-500 flex-shrink-0">drafted</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto p-3">
        {!hasAny ? (
          <div className="text-center text-gray-700 text-sm py-16">
            Search for up to 3 players to compare
          </div>
        ) : (
          <>
            {fpEcr && (
              <div className="text-[9px] text-green-800 font-semibold mb-2">● FantasyPros ECR loaded</div>
            )}
            <div className="grid grid-cols-3 gap-2">
              {slots.map((player, i) =>
                player ? (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    availableIds={availableIds}
                    currentRound={currentRound}
                    expertData={expertData}
                    espnAdpByName={espnAdpByName}
                    fpEcr={fpEcr}
                    posRank={posRanks[player.id] ?? 0}
                  />
                ) : (
                  <div key={i} className="rounded-xl border-2 border-dashed border-gray-800 min-h-32 flex items-center justify-center">
                    <span className="text-[10px] text-gray-700">empty</span>
                  </div>
                )
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
