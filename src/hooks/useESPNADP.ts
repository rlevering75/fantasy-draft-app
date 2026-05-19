import { useState, useEffect } from 'react'

// ESPN Fantasy API — public endpoint, 1-QB PPR scoring, no auth required for basic views.
// Returns averageDraftPosition from ESPN mock/public drafts for the given season.
const ESPN_URL = (season: string) =>
  `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${season}/players` +
  `?scoringPeriodId=0&view=kona_player_info`

interface ESPNRaw {
  id?: number
  onTeamId?: number
  playerPoolEntry?: {
    averageDraftPosition?: number
    player?: {
      fullName?: string
      defaultPositionId?: number  // 1=QB 2=RB 3=WR 4=TE 5=K 16=D/ST
    }
  }
}

export interface ESPNADPResult {
  // name (lowercased, trimmed) → ESPN ADP
  adpByName: Record<string, number>
  loaded: boolean
  success: boolean
}

export function useESPNADP(season = '2026'): ESPNADPResult {
  const [adpByName, setAdpByName] = useState<Record<string, number>>({})
  const [loaded, setLoaded]       = useState(false)
  const [success, setSuccess]     = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(ESPN_URL(season), {
          headers: { 'X-Fantasy-Source': 'kona', 'X-Fantasy-Platform': 'kona-PROD-m.fantasy.espn.com' },
        })
        if (!res.ok) throw new Error(`ESPN ${res.status}`)
        const body = await res.json()
        // Response is either a bare array or { players: [...] }
        const rows: ESPNRaw[] = Array.isArray(body) ? body : (body?.players ?? [])

        const map: Record<string, number> = {}
        for (const row of rows) {
          const adp  = row?.playerPoolEntry?.averageDraftPosition
          const name = row?.playerPoolEntry?.player?.fullName?.toLowerCase().trim()
          if (name && typeof adp === 'number' && adp > 0 && adp < 250) {
            map[name] = adp
          }
        }

        if (!cancelled && Object.keys(map).length > 10) {
          setAdpByName(map)
          setSuccess(true)
        }
      } catch {
        // CORS or auth block — degrade gracefully, Sleeper ADP still shown
      } finally {
        if (!cancelled) setLoaded(true)
      }
    })()
    return () => { cancelled = true }
  }, [season])

  return { adpByName, loaded, success }
}
