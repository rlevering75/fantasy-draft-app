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
              p.search_rank < 1500,
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
  loadedOnConnect: number   // how many picks existed when we first connected
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
    loadedOnConnect: 0,
  })
  const knownCount = useRef(0)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  // Keep a ref to onNewPicks so the poll closure always calls the latest version
  // without restarting the interval on every parent re-render.
  const onNewPicksRef = useRef(onNewPicks)
  useEffect(() => { onNewPicksRef.current = onNewPicks }, [onNewPicks])

  const connect = useCallback(async (id: string) => {
    setState(s => ({ ...s, loading: true, error: null }))
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 10_000)
    try {
      const [infoRes, picksRes] = await Promise.all([
        fetch(`${BASE}/draft/${id}`, { signal: controller.signal }),
        fetch(`${BASE}/draft/${id}/picks`, { signal: controller.signal }),
      ])
      clearTimeout(timer)
      if (!infoRes.ok) throw new Error(`Draft not found (${infoRes.status}). Check the ID.`)
      if (!picksRes.ok) throw new Error(`Couldn't load picks (${picksRes.status}).`)
      const info: SleeperDraftInfo = await infoRes.json()
      const raw = await picksRes.json()
      const picks: SleeperPick[] = Array.isArray(raw) ? raw : []
      knownCount.current = picks.length
      // Set connected state first, then fire picks in a microtask so
      // React has flushed the state update (and rawPlayers closure is fresh).
      setState({ info, picks, loading: false, error: null, connected: true, loadedOnConnect: picks.length })
      setTimeout(() => onNewPicksRef.current(picks), 0)
    } catch (e: unknown) {
      clearTimeout(timer)
      const msg =
        e instanceof Error
          ? e.name === 'AbortError'
            ? 'Connection timed out. Check the draft ID and try again.'
            : e.message
          : 'Failed to connect to Sleeper draft.'
      setState(s => ({ ...s, loading: false, error: msg, connected: false }))
    }
  }, [])   // no deps — uses ref for onNewPicks

  // Poll every 2 s while connected; uses ref so interval never restarts mid-draft
  useEffect(() => {
    if (!draftId || !state.connected) return
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${BASE}/draft/${draftId}/picks`)
        if (!res.ok) return
        const raw = await res.json()
        const picks: SleeperPick[] = Array.isArray(raw) ? raw : []
        if (picks.length > knownCount.current) {
          const newPicks = picks.slice(knownCount.current)
          knownCount.current = picks.length
          setState(s => ({ ...s, picks }))
          onNewPicksRef.current(newPicks)
        }
      } catch { /* swallow poll errors silently */ }
    }, 2000)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [draftId, state.connected])   // stable — no onNewPicks dep needed

  const disconnect = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current)
    knownCount.current = 0
    setState({ info: null, picks: [], loading: false, error: null, connected: false, loadedOnConnect: 0 })
  }, [])

  return { ...state, connect, disconnect }
}
