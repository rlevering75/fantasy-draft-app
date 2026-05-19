import { useState } from 'react'
import type { DraftSettings } from '../types'

interface Props {
  onStart: (settings: DraftSettings) => void
  loading: boolean
  dataSource: 'sleeper' | 'fallback'
}

export default function SetupScreen({ onStart, loading, dataSource }: Props) {
  const [teamCount, setTeamCount] = useState(12)
  const [rounds, setRounds] = useState(15)
  const [myPickPosition, setMyPickPosition] = useState(1)
  const [scoringFormat, setScoringFormat] = useState<DraftSettings['scoringFormat']>('half-ppr')

  function handleStart() {
    onStart({ teamCount, rounds, myPickPosition, scoringFormat })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-3">🏈</div>
          <h1 className="text-3xl font-bold text-white">Fantasy Draft Assistant</h1>
          <p className="text-gray-400 mt-2">Round-by-round targets · Win rate benchmarks · Sleeper integration</p>
        </div>

        {/* Data source badge */}
        {!loading && (
          <div
            className={`text-xs text-center mb-6 px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 mx-auto w-full justify-center ${
              dataSource === 'sleeper'
                ? 'bg-green-900/40 text-green-400 border border-green-700/50'
                : 'bg-yellow-900/40 text-yellow-400 border border-yellow-700/50'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${dataSource === 'sleeper' ? 'bg-green-400' : 'bg-yellow-400'}`} />
            {dataSource === 'sleeper'
              ? 'Live player data loaded from Sleeper API'
              : 'Using built-in 2025 rankings (Sleeper API unavailable)'}
          </div>
        )}

        {loading && (
          <div className="text-center text-gray-400 mb-6 text-sm animate-pulse">
            Loading player data from Sleeper…
          </div>
        )}

        {/* Settings card */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 space-y-5">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">League Settings</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Teams</label>
              <select
                value={teamCount}
                onChange={e => {
                  const n = Number(e.target.value)
                  setTeamCount(n)
                  if (myPickPosition > n) setMyPickPosition(n)
                }}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[8, 10, 12, 14].map(n => (
                  <option key={n} value={n}>{n} teams</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Rounds</label>
              <select
                value={rounds}
                onChange={e => setRounds(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[13, 14, 15, 16, 17].map(n => (
                  <option key={n} value={n}>{n} rounds</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1.5">My Draft Pick</label>
              <select
                value={myPickPosition}
                onChange={e => setMyPickPosition(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: teamCount }, (_, i) => i + 1).map(n => (
                  <option key={n} value={n}>Pick {n}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Scoring</label>
              <select
                value={scoringFormat}
                onChange={e => setScoringFormat(e.target.value as DraftSettings['scoringFormat'])}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="standard">Standard</option>
                <option value="half-ppr">Half PPR</option>
                <option value="ppr">Full PPR</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-base"
          >
            {loading ? 'Loading…' : 'Start Draft'}
          </button>
        </div>

        <p className="text-center text-gray-600 text-xs mt-4">
          Connect to a Sleeper mock draft from inside the app after starting
        </p>
      </div>
    </div>
  )
}
