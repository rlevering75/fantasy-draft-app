import { useState, useEffect } from 'react'

const BASE = 'https://api.sleeper.app/v1'

export interface ExpertData {
  projectedPts: Record<string, number>   // player_id → projected PPR pts (weekly)
  source: string
}

export function useExpertRankings(season = '2026') {
  const [data, setData] = useState<ExpertData | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      // Sleeper exposes per-player PPR projections via their projections endpoint.
      // Week 1 is the best pre-season approximation; we display relative rankings.
      try {
        const res = await fetch(`${BASE}/projections/nfl/${season}/1`)
        if (!res.ok) throw new Error('no data')
        const raw: Record<string, Record<string, number | null>> = await res.json()
        const projectedPts: Record<string, number> = {}
        for (const [id, stats] of Object.entries(raw)) {
          const pts = stats?.pts_ppr ?? stats?.pts_half_ppr
          if (pts != null && pts > 0) projectedPts[id] = pts
        }
        if (!cancelled && Object.keys(projectedPts).length > 0) {
          setData({ projectedPts, source: 'Sleeper Projections' })
        }
      } catch { /* no projections — panel degrades gracefully */ }
    })()
    return () => { cancelled = true }
  }, [season])

  return data
}
