import { useState, useMemo, useCallback } from 'react'
import type { Player, DraftPick, DraftSettings, SleeperPick } from './types'
import { useSleeperPlayers, useSleeperDraft } from './hooks/useSleeper'
import { getRecommendations, buildPick, isMyPick, getRound, getTeamSlot } from './utils/draft'

import SetupScreen from './components/SetupScreen'
import PlayerList from './components/PlayerList'
import MyTeam from './components/MyTeam'
import RoundGuide from './components/RoundGuide'
import WinRatePanel from './components/WinRatePanel'
import SleeperPanel from './components/SleeperPanel'

export default function App() {
  const [phase, setPhase] = useState<'setup' | 'draft'>('setup')
  const [settings, setSettings] = useState<DraftSettings>({
    teamCount: 12,
    rounds: 15,
    myPickPosition: 1,
    scoringFormat: 'half-ppr',
  })
  const [allPicks, setAllPicks] = useState<DraftPick[]>([])
  const [sleeperDraftId, setSleeperDraftId] = useState<string | null>(null)

  const { players: rawPlayers, loading: playersLoading, source } = useSleeperPlayers()

  // ── Derived state ────────────────────────────────────────────────────────────
  const draftedIds = useMemo(() => new Set(allPicks.map(p => p.player.id)), [allPicks])

  const availablePlayers = useMemo(
    () => rawPlayers.filter(p => !draftedIds.has(p.id)),
    [rawPlayers, draftedIds],
  )

  const myPicks = useMemo(
    () => allPicks.filter(p => p.isMyPick).map(p => p.player),
    [allPicks],
  )

  const currentOverallPick = allPicks.length + 1
  const currentRound = getRound(currentOverallPick, settings.teamCount)
  const myTurn = isMyPick(currentOverallPick, settings)

  const recommendations = useMemo(
    () => getRecommendations(currentRound, myPicks, availablePlayers, settings),
    [currentRound, myPicks, availablePlayers, settings],
  )

  // ── Actions ──────────────────────────────────────────────────────────────────
  const draftPlayer = useCallback(
    (player: Player) => {
      const pick = buildPick(player, currentOverallPick, settings)
      setAllPicks(prev => [...prev, pick])
    },
    [currentOverallPick, settings],
  )

  const undoLastPick = useCallback(() => {
    setAllPicks(prev => prev.slice(0, -1))
  }, [])

  // ── Sleeper integration ──────────────────────────────────────────────────────
  const handleSleeperPicks = useCallback(
    (incomingPicks: SleeperPick[]) => {
      setAllPicks(prev => {
        const existingOverall = new Set(prev.map(p => p.overallPick))
        const existingIds    = new Set(prev.map(p => p.player.id))
        const newPicks: DraftPick[] = []

        for (const sp of incomingPicks) {
          if (existingOverall.has(sp.pick_no)) continue

          // 1. Match by Sleeper player_id (works when players loaded from Sleeper API)
          let player: Player | undefined = rawPlayers.find(p => p.id === sp.player_id)

          // 2. Name-based fallback (handles fallback player list with different IDs)
          if (!player && sp.metadata) {
            const full = `${sp.metadata.first_name} ${sp.metadata.last_name}`.toLowerCase().trim()
            player = rawPlayers.find(p => p.name.toLowerCase() === full)
          }

          // 3. Always create a minimal player from pick metadata so the pick is never dropped.
          //    This handles depth/handcuff players filtered out of our database.
          if (!player && sp.metadata) {
            const pos = sp.metadata.position as Player['position']
            if (['QB', 'RB', 'WR', 'TE', 'K', 'DEF'].includes(pos) && !existingIds.has(sp.player_id)) {
              player = {
                id: sp.player_id,
                name: `${sp.metadata.first_name} ${sp.metadata.last_name}`.trim(),
                position: pos,
                team: sp.metadata.team ?? 'UNK',
                adp: sp.pick_no,
                rank: sp.pick_no,
                bye: 0,
                tier: 5,
              }
            }
          }

          if (!player) continue

          const round    = getRound(sp.pick_no, settings.teamCount)
          const roundPick = ((sp.pick_no - 1) % settings.teamCount) + 1
          const teamSlot  = getTeamSlot(sp.pick_no, settings.teamCount)
          newPicks.push({
            overallPick: sp.pick_no,
            round,
            roundPick,
            teamSlot,
            player,
            isMyPick: sp.draft_slot === settings.myPickPosition,
          })
        }

        if (newPicks.length === 0) return prev
        return [...prev, ...newPicks].sort((a, b) => a.overallPick - b.overallPick)
      })
    },
    [rawPlayers, settings],
  )

  const {
    info: sleeperDraftInfo,
    picks: sleeperPicks,
    loading: sleeperLoading,
    error: sleeperError,
    connected: sleeperConnected,
    connect: connectSleeper,
    disconnect: disconnectSleeper,
  } = useSleeperDraft(sleeperDraftId, handleSleeperPicks)

  const handleConnect = useCallback(
    (id: string) => {
      setSleeperDraftId(id)
      connectSleeper(id)
    },
    [connectSleeper],
  )

  // ── Render ───────────────────────────────────────────────────────────────────
  if (phase === 'setup') {
    return (
      <SetupScreen
        loading={playersLoading}
        dataSource={source}
        onStart={s => {
          setSettings(s)
          setAllPicks([])
          setPhase('draft')
        }}
      />
    )
  }

  const totalPicks = settings.teamCount * settings.rounds
  const draftComplete = currentOverallPick > totalPicks

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-4 py-2.5 bg-gray-900 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-lg">🏈</span>
          <div>
            <h1 className="text-sm font-bold text-white leading-none">Fantasy Draft Assistant</h1>
            <div className="text-xs text-gray-500">
              {settings.scoringFormat.toUpperCase()} · {settings.teamCount} teams · {settings.rounds} rounds
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {draftComplete ? (
            <span className="text-sm font-bold text-green-400">Draft Complete!</span>
          ) : (
            <>
              <div className="text-center">
                <div className="text-xs text-gray-500">Round</div>
                <div className="text-sm font-bold text-white">{currentRound}/{settings.rounds}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Pick</div>
                <div className="text-sm font-bold text-white">#{currentOverallPick}</div>
              </div>
              {myTurn && (
                <span className="text-xs font-bold bg-green-600 text-white px-2.5 py-1 rounded-full">
                  ON THE CLOCK
                </span>
              )}
            </>
          )}
          <button
            onClick={() => {
              setPhase('setup')
              setAllPicks([])
              disconnectSleeper()
              setSleeperDraftId(null)
            }}
            className="text-xs text-gray-500 hover:text-white border border-gray-700 hover:border-gray-500 px-2.5 py-1 rounded-lg transition-colors"
          >
            Reset
          </button>
        </div>
      </header>

      {/* ── Progress bar ────────────────────────────────────────────────────── */}
      <div className="h-1 bg-gray-800 flex-shrink-0">
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${Math.min(100, ((currentOverallPick - 1) / totalPicks) * 100)}%` }}
        />
      </div>

      {/* ── Main layout ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: My Team */}
        <div className="w-52 flex-shrink-0 border-r border-gray-800 flex flex-col overflow-hidden">
          <MyTeam myPicks={myPicks} onUndo={undoLastPick} canUndo={allPicks.length > 0 && !sleeperConnected} />
        </div>

        {/* Center: Available Players */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-800 flex items-center justify-between flex-shrink-0">
            <h2 className="text-sm font-semibold text-gray-300">Available Players</h2>
            <span className="text-xs text-gray-500">{availablePlayers.length} remaining</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <PlayerList
              players={availablePlayers}
              currentRound={currentRound}
            />
          </div>

          {/* Recent picks ticker */}
          {allPicks.length > 0 && (
            <RecentPicks picks={allPicks} myPosition={settings.myPickPosition} />
          )}
        </div>

        {/* Right: Guide + Win Rate + Sleeper */}
        <div className="w-72 flex-shrink-0 border-l border-gray-800 overflow-y-auto">
          <div className="p-3 space-y-4">
            {/* Round Guide */}
            <section>
              <RoundGuide
                round={currentRound}
                overallPick={currentOverallPick}
                isMyTurn={myTurn}
                recommendations={recommendations}
              />
            </section>

            {/* Win Rate Panel */}
            <section className="border-t border-gray-800 pt-3">
              <WinRatePanel myPicks={myPicks} currentRound={currentRound} />
            </section>

            {/* Sleeper Panel */}
            <section className="border-t border-gray-800 pt-3">
              <SleeperPanel
                connected={sleeperConnected}
                draftInfo={sleeperDraftInfo}
                loading={sleeperLoading}
                error={sleeperError}
                onConnect={handleConnect}
                onDisconnect={() => {
                  disconnectSleeper()
                  setSleeperDraftId(null)
                }}
                pickCount={sleeperPicks.length}
              />
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Recent picks feed ─────────────────────────────────────────────────────────
function RecentPicks({ picks, myPosition }: { picks: DraftPick[]; myPosition: number }) {
  const recent = [...picks].reverse().slice(0, 5)
  const POS_COLOR: Record<string, string> = {
    QB: 'text-red-400', RB: 'text-green-400', WR: 'text-blue-400',
    TE: 'text-yellow-400', K: 'text-gray-400', DEF: 'text-purple-400',
  }
  return (
    <div className="border-t border-gray-800 bg-gray-900/50 px-3 py-1.5">
      <div className="text-xs text-gray-600 mb-1">Recent picks</div>
      <div className="flex gap-3 overflow-x-auto">
        {recent.map(pick => (
          <div
            key={pick.overallPick}
            className={`flex-shrink-0 text-xs ${pick.isMyPick ? 'text-white' : 'text-gray-500'}`}
          >
            <span className={POS_COLOR[pick.player.position]}>{pick.player.position}</span>
            {' '}
            <span className="font-medium">{pick.player.name.split(' ').slice(-1)[0]}</span>
            <span className="text-gray-600 ml-1">R{pick.round}.{pick.roundPick}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
