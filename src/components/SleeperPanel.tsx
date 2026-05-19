import { useState } from 'react'
import type { SleeperDraftInfo } from '../types'

interface Props {
  connected: boolean
  draftInfo: SleeperDraftInfo | null
  loading: boolean
  error: string | null
  onConnect: (draftId: string) => void
  onDisconnect: () => void
  pickCount: number
}

export default function SleeperPanel({
  connected,
  draftInfo,
  loading,
  error,
  onConnect,
  onDisconnect,
  pickCount,
}: Props) {
  const [draftId, setDraftId] = useState('')
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-left"
      >
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-gray-600'}`} />
          <span className="text-xs font-semibold text-gray-300">
            {connected ? `Sleeper Draft (${pickCount} picks synced)` : 'Connect Sleeper Draft'}
          </span>
        </div>
        <span className="text-gray-600 text-xs">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-2 border-t border-gray-800 pt-2">
          {!connected ? (
            <>
              <p className="text-xs text-gray-500 leading-relaxed">
                Enter your Sleeper mock draft ID (found in the draft room URL) to sync picks in real time.
              </p>
              <p className="text-xs text-gray-600">
                Example URL: sleeper.com/draft/nfl/<span className="text-blue-400">1234567890</span>
              </p>
              <input
                type="text"
                placeholder="Draft ID (e.g. 1234567890)"
                value={draftId}
                onChange={e => setDraftId(e.target.value.trim())}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {error && (
                <p className="text-xs text-red-400">{error}</p>
              )}
              <button
                onClick={() => draftId && onConnect(draftId)}
                disabled={!draftId || loading}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
              >
                {loading ? 'Connecting…' : 'Connect'}
              </button>
            </>
          ) : (
            <>
              {draftInfo && (
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-gray-400">
                    <span>Season</span>
                    <span className="text-white">{draftInfo.season}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Status</span>
                    <span className={`font-medium ${draftInfo.status === 'drafting' ? 'text-green-400' : 'text-gray-300'}`}>
                      {draftInfo.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Teams</span>
                    <span className="text-white">{draftInfo.settings.teams}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Rounds</span>
                    <span className="text-white">{draftInfo.settings.rounds}</span>
                  </div>
                </div>
              )}
              <div className="text-xs text-green-400 flex items-center gap-1.5">
                <span className="animate-pulse">●</span>
                Polling every 5 seconds
              </div>
              <button
                onClick={onDisconnect}
                className="w-full py-1.5 border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white text-xs rounded-lg transition-colors"
              >
                Disconnect
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
