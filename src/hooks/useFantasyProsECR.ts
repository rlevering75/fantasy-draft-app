import { useState, useEffect } from 'react'

export interface FPEcrData {
  byName: Record<string, { rank: number; posRank: string; tier: number }>
}

export function useFantasyProsECR(season = '2026') {
  const [data, setData] = useState<FPEcrData | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        // FantasyPros CDN — CORS may block from browser; graceful fallback
        const res = await fetch(
          `https://www.fantasypros.com/mv-api/data/nfl/${season}/overall-draft-ranks-PPR.json`,
        )
        if (!res.ok) throw new Error('not ok')
        const raw = await res.json()
        const players: unknown[] = Array.isArray(raw) ? raw : (raw?.players ?? [])
        const byName: FPEcrData['byName'] = {}
        for (const p of players) {
          if (typeof p !== 'object' || p === null) continue
          const obj = p as Record<string, unknown>
          const name = String(obj.player_name ?? obj.full_name ?? '').toLowerCase().trim()
          if (!name) continue
          byName[name] = {
            rank:    Number(obj.rank_ecr ?? obj.rank ?? 999),
            posRank: String(obj.pos_rank ?? ''),
            tier:    Number(obj.tier ?? 5),
          }
        }
        if (!cancelled && Object.keys(byName).length > 0) setData({ byName })
      } catch { /* CORS or 404 — panel hides FP column gracefully */ }
    })()
    return () => { cancelled = true }
  }, [season])

  return data
}
