import { useState, useEffect, useCallback, useRef } from 'react'
import type { Player, SleeperDraftInfo, SleeperPick, SleeperRawPlayer } from '../types'
import { FALLBACK_PLAYERS, calculateTier } from '../data/players'

const BASE = 'https://api.sleeper.app/v1'

// ── Player loading ────────────────────────────────────────────────────────────

export function useSleeperPlayers() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState<'sleeper' | 'fallback'>('sleeper')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`${BASE}/players/nfl`)
        if (!res.ok) throw new Error('non-200')
        const raw: Record<string, SleeperRawPlayer> = await res.json()

        const skill = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF']
        const parsed: Player[] = Object.values(raw)
          .filter(
            p =>
              skill.includes(p.position) &&
              p.active !== false &&
              p.search_rank != null &&
              p.search_rank < 600,
          )
          .map(p => ({
            id: p.player_id,
            name:
              p.position === 'DEF'
                ? p.full_name ?? `${p.last_name} D/ST`
                : `${p.first_name} ${p.last_name}`.trim(),
            position: p.position as Player['position'],
            team: p.team ?? 'FA',
            adp: p.search_rank ?? 999,
            rank: p.search_rank ?? 999,
            bye: p.bye_week ?? 0,
            tier: calculateTier(p.search_rank ?? 999, p.position),
            age: p.age ?? undefined,
            injuryStatus: p.injury_status ?? null,
          }))
          .sort((a, b) => a.rank - b.rank)

        if (!cancelled) {
          setPlayers(parsed)
          setSource('sleeper')
        }
      } catch {
        if (!cancelled) {
          setPlayers(FALLBACK_PLAYERS)
          setSource('fallback')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  return { players, loading, source }
}

// ── Draft room polling ────────────────────────────────────────────────────────

export interface SleeperDraftState {
  info: SleeperDraftInfo | null
  picks: SleeperPick[]
  loading: boolean
  error: string | null
  connected: boolean
}

export function useSleeperDraft(
  draftId: string | null,
  onNewPicks: (picks: SleeperPick[]) => void,
) {
  const [state, setState] = useState<SleeperDraftState>({
    info: null,
    picks: [],
    loading: false,
    error: null,
    connected: false,
  })
  const knownCount = useRef(0)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const connect = useCallback(async (id: string) => {
    setState(s => ({ ...s, loading: true, error: null }))
    try {
      const [infoRes, picksRes] = await Promise.all([
        fetch(`${BASE}/draft/${id}`),
        fetch(`${BASE}/draft/${id}/picks`),
      ])
      if (!infoRes.ok || !picksRes.ok) throw new Error('Draft not found. Check the draft ID.')
      const info: SleeperDraftInfo = await infoRes.json()
      const picks: SleeperPick[] = await picksRes.json()
      knownCount.current = picks.length
      setState({ info, picks, loading: false, error: null, connected: true })
      onNewPicks(picks)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to connect to Sleeper draft.'
      setState(s => ({ ...s, loading: false, error: msg, connected: false }))
    }
  }, [onNewPicks])

  // Poll every 5 s for new picks while connected
  useEffect(() => {
    if (!draftId || !state.connected) return
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${BASE}/draft/${draftId}/picks`)
        if (!res.ok) return
        const picks: SleeperPick[] = await res.json()
        if (picks.length > knownCount.current) {
          const newPicks = picks.slice(knownCount.current)
          knownCount.current = picks.length
          setState(s => ({ ...s, picks }))
          onNewPicks(newPicks)
        }
      } catch { /* swallow poll errors silently */ }
    }, 5000)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [draftId, state.connected, onNewPicks])

  const disconnect = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current)
    knownCount.current = 0
    setState({ info: null, picks: [], loading: false, error: null, connected: false })
  }, [])

  return { ...state, connect, disconnect }
}
