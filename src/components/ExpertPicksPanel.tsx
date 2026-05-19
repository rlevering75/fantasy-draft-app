import { useMemo } from 'react'
import type { Player } from '../types'
import type { ExpertData } from '../hooks/useExpertRankings'

const POS_TEXT: Record<string, string> = {
  QB: 'text-red-400', RB: 'text-green-400',
  WR: 'text-blue-400', TE: 'text-yellow-400',
  K: 'text-gray-400',  DEF: 'text-purple-400',
}
const POS_BG: Record<string, string> = {
  QB: 'bg-red-500/15 border-red-700/30',
  RB: 'bg-green-500/15 border-green-700/30',
  WR: 'bg-blue-500/15 border-blue-700/30',
  TE: 'bg-yellow-500/15 border-yellow-700/30',
}
const POS_BAR: Record<string, string> = {
  RB: 'bg-green-500', WR: 'bg-blue-500', QB: 'bg-red-500', TE: 'bg-yellow-500',
}
// Approximate full-roster starting counts for board-depth bars
const POS_START: Record<string, number> = { RB: 65, WR: 90, QB: 32, TE: 30 }

interface Props {
  availablePlayers: Player[]
  myPicks: Player[]
  currentRound: number
  expertData: ExpertData | null
  espnAdpByName: Record<string, number> | null
}

export default function ExpertPicksPanel({
  availablePlayers,
  myPicks,
  currentRound,
  expertData,
  espnAdpByName,
}: Props) {
  const skill = useMemo(
    () => availablePlayers.filter(p => ['QB', 'RB', 'WR', 'TE'].includes(p.position)),
    [availablePlayers],
  )

  // Position rank among still-available players
  const posRank = useMemo(() => {
    const counters: Record<string, number> = {}
    const out: Record<string, number> = {}
    for (const p of availablePlayers) {
      counters[p.position] = (counters[p.position] ?? 0) + 1
      out[p.id] = counters[p.position]
    }
    return out
  }, [availablePlayers])

  // Top 5 available skill players
  const topTargets = skill.slice(0, 5)

  // Steals: ADP implies they go ≥2 full rounds later than current pick
  const currentOverall = (currentRound - 1) * 12
  const steals = skill
    .filter(p => p.adp - currentOverall >= 20 && posRank[p.id] <= 15)
    .slice(0, 3)

  // Tier-drop alert: a tier is nearly gone when only 1-2 of that tier remain
  const tierAlerts = useMemo(() => {
    const alerts: { pos: string; tier: number; remaining: number }[] = []
    for (const pos of ['RB', 'WR', 'TE']) {
      const tier1 = availablePlayers.filter(p => p.position === pos && p.tier === 1)
      const tier2 = availablePlayers.filter(p => p.position === pos && p.tier === 2)
      if (tier1.length > 0 && tier1.length <= 2) alerts.push({ pos, tier: 1, remaining: tier1.length })
      else if (tier2.length > 0 && tier2.length <= 2) alerts.push({ pos, tier: 2, remaining: tier2.length })
    }
    return alerts.slice(0, 2)
  }, [availablePlayers])

  // Board depth
  const depth = useMemo(() =>
    ['RB', 'WR', 'TE', 'QB'].map(pos => ({
      pos,
      count: availablePlayers.filter(p => p.position === pos).length,
    })),
    [availablePlayers],
  )

  // If we have projections, build a sorted list for top proj. picks
  const projTargets = useMemo(() => {
    if (!expertData) return []
    return skill
      .filter(p => expertData.projectedPts[p.id] != null)
      .sort((a, b) => (expertData.projectedPts[b.id] ?? 0) - (expertData.projectedPts[a.id] ?? 0))
      .slice(0, 5)
  }, [skill, expertData])

  const hasProjData = projTargets.length > 0

  return (
    <div className="p-3 space-y-4 overflow-y-auto h-full">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-200 uppercase tracking-wider">Expert Picks</h3>
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-green-600 font-semibold">SLR</span>
          {espnAdpByName && <><span className="text-[9px] text-gray-700">+</span><span className="text-[9px] text-blue-600 font-semibold">ESPN</span></>}
        </div>
      </div>

      {/* ── Tier-drop alerts ─────────────────────────────────────────────────── */}
      {tierAlerts.map(a => (
        <div key={`${a.pos}-${a.tier}`}
          className="flex items-center gap-2 bg-orange-900/25 border border-orange-700/30 rounded-lg px-2.5 py-1.5">
          <span className="text-orange-400 text-xs">⚠</span>
          <span className="text-xs text-orange-300 leading-tight">
            <span className={`font-bold ${POS_TEXT[a.pos]}`}>{a.pos}</span> Tier {a.tier} nearly gone — {a.remaining} left
          </span>
        </div>
      ))}

      {/* ── Top Targets ─────────────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-semibold text-gray-400">
          {hasProjData ? 'Top Projected (PPR pts)' : 'Best Available'}
        </div>
        {(hasProjData ? projTargets : topTargets).map((player, i) => {
          const pr       = posRank[player.id] ?? 0
          const steal    = player.adp / 12 - currentRound >= 2
          const pts      = hasProjData ? expertData!.projectedPts[player.id] : null
          const slrAdp   = player.sleeperAdp ?? player.adp
          const espnAdp  = espnAdpByName ? espnAdpByName[player.name.toLowerCase().trim()] : null

          return (
            <div
              key={player.id}
              className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border ${
                i === 0
                  ? 'bg-blue-900/30 border-blue-700/40'
                  : 'bg-gray-800/40 border-gray-700/30'
              }`}
            >
              <span className="text-[10px] text-gray-600 w-3 tabular-nums flex-shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-white truncate">{player.name}</span>
                  {steal && <span className="text-[9px] font-bold text-green-400 flex-shrink-0">▲ STEAL</span>}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-[10px] font-bold ${POS_TEXT[player.position]}`}>
                    {player.position}{pr}
                  </span>
                  <span className="text-[10px] text-gray-600">{player.team}</span>
                </div>
                {/* Per-source ADP breakdown */}
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[9px] text-green-700 font-semibold">SLR</span>
                  <span className="text-[9px] text-gray-500 tabular-nums">{slrAdp.toFixed(1)}</span>
                  {espnAdp != null && (
                    <>
                      <span className="text-[9px] text-blue-700 font-semibold">ESPN</span>
                      <span className="text-[9px] text-gray-500 tabular-nums">{espnAdp.toFixed(1)}</span>
                    </>
                  )}
                </div>
              </div>
              {pts != null && (
                <div className="text-right flex-shrink-0">
                  <div className="text-xs font-bold text-white">{pts.toFixed(1)}</div>
                  <div className="text-[9px] text-gray-600">proj pts</div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Steals ──────────────────────────────────────────────────────────── */}
      {steals.length > 0 && (
        <div className="space-y-1.5 border-t border-gray-800 pt-3">
          <div className="text-[11px] font-semibold text-gray-400">Late-Round Value</div>
          {steals.map(player => {
            const pr = posRank[player.id] ?? 0
            const projRound = Math.ceil(player.adp / 12)
            return (
              <div
                key={player.id}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-green-900/20 border border-green-800/30"
              >
                <div className={`w-1 h-8 rounded-full flex-shrink-0 ${POS_BAR[player.position] ?? 'bg-gray-500'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white truncate">{player.name}</div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold ${POS_TEXT[player.position]}`}>
                      {player.position}{pr}
                    </span>
                    <span className="text-[10px] text-gray-500">{player.team}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs text-green-400 font-semibold">R{projRound}</div>
                  <div className="text-[9px] text-gray-600">proj'd go</div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Board Depth ─────────────────────────────────────────────────────── */}
      <div className="space-y-2 border-t border-gray-800 pt-3">
        <div className="text-[11px] font-semibold text-gray-400">Board Depth</div>
        {depth.map(({ pos, count }) => {
          const pct = Math.min(100, (count / POS_START[pos]) * 100)
          const low = pct < 25
          const mid = pct < 55
          return (
            <div key={pos} className="flex items-center gap-2">
              <span className={`text-[10px] w-5 font-semibold ${POS_TEXT[pos]}`}>{pos}</span>
              <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    low ? 'bg-red-500' : mid ? 'bg-yellow-500' : POS_BAR[pos]
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className={`text-[10px] w-5 text-right tabular-nums ${
                low ? 'text-red-400' : mid ? 'text-yellow-400' : 'text-gray-500'
              }`}>{count}</span>
            </div>
          )
        })}
        <p className="text-[9px] text-gray-700 leading-tight pt-1">
          Depth bar turns yellow/red as position pool thins.
        </p>
      </div>

      {/* ── My Roster Needs ─────────────────────────────────────────────────── */}
      {myPicks.length > 0 && (() => {
        const have = (pos: string) => myPicks.filter(p => p.position === pos).length
        const needs: string[] = []
        if (have('RB') < 2) needs.push('RB')
        if (have('WR') < 2) needs.push('WR')
        if (have('TE') < 1 && currentRound >= 4) needs.push('TE')
        if (have('QB') < 1 && currentRound >= 9) needs.push('QB')
        if (needs.length === 0) return null
        return (
          <div className="border-t border-gray-800 pt-3 space-y-1">
            <div className="text-[11px] font-semibold text-gray-400">Roster Gaps</div>
            <div className="flex flex-wrap gap-1.5">
              {needs.map(pos => (
                <span key={pos}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${POS_BG[pos] ?? ''} ${POS_TEXT[pos]}`}>
                  Need {pos}
                </span>
              ))}
            </div>
          </div>
        )
      })()}

    </div>
  )
}
