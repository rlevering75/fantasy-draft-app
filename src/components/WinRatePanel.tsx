import type { Player } from '../types'
import { STRATEGIES } from '../data/strategies'

interface Props {
  myPicks: Player[]
  currentRound: number
}

export default function WinRatePanel({ myPicks, currentRound }: Props) {
  const activeIds = new Set(
    STRATEGIES.filter(s => s.detect(myPicks, currentRound)).map(s => s.id),
  )

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Win Rate Benchmarks</h3>
        <span className="text-xs text-gray-600">Redraft leagues</span>
      </div>

      <p className="text-xs text-gray-600 leading-relaxed">
        Based on large-sample redraft research. Highlighted strategies match your current draft.
      </p>

      <div className="space-y-1.5">
        {STRATEGIES.sort((a, b) => b.winRate - a.winRate).map(strategy => {
          const isActive = activeIds.has(strategy.id)
          return (
            <div
              key={strategy.id}
              className={`rounded-lg p-2.5 transition-colors ${
                isActive
                  ? 'bg-gray-700/80 border border-gray-500/50'
                  : 'bg-gray-800/50 border border-gray-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  {isActive && (
                    <span className="text-xs font-bold text-green-400">✓</span>
                  )}
                  <span className={`text-xs font-medium ${isActive ? 'text-white' : 'text-gray-400'}`}>
                    {strategy.label}
                  </span>
                </div>
                <span className={`text-sm font-bold tabular-nums ${isActive ? 'text-white' : 'text-gray-500'}`}>
                  {strategy.winRate}%
                </span>
              </div>

              {/* Bar */}
              <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isActive ? strategy.color : 'bg-gray-600'
                  }`}
                  style={{ width: `${strategy.winRate}%` }}
                />
              </div>

              {isActive && (
                <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{strategy.description}</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Current win rate estimate */}
      {myPicks.length >= 3 && (
        <ActiveStrategyCard picks={myPicks} activeIds={activeIds} currentRound={currentRound} />
      )}
    </div>
  )
}

function ActiveStrategyCard({
  picks,
  activeIds,
  currentRound,
}: {
  picks: Player[]
  activeIds: Set<string>
  currentRound: number
}) {
  const active = STRATEGIES.filter(s => activeIds.has(s.id))
  if (active.length === 0) return null

  const best = active.reduce((a, b) => (a.winRate > b.winRate ? a : b))

  return (
    <div className="mt-3 rounded-xl border border-blue-600/40 bg-blue-900/20 p-3">
      <div className="text-xs text-blue-400 font-semibold mb-1">Your Current Strategy</div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-white font-medium">{best.label}</span>
        <span className="text-xl font-bold text-green-400">{best.winRate}%</span>
      </div>
      <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${best.color}`}
          style={{ width: `${best.winRate}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-1.5">{best.description}</p>
    </div>
  )
}
