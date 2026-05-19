import type { Recommendation } from '../types'

const PRIORITY_CONFIG = {
  must:  { label: 'MUST',  cls: 'bg-red-600/20 border-red-600/40 text-red-300' },
  high:  { label: 'HIGH',  cls: 'bg-blue-600/20 border-blue-600/40 text-blue-300' },
  value: { label: 'VALUE', cls: 'bg-green-600/20 border-green-600/40 text-green-300' },
}

const POS_CHIP: Record<string, string> = {
  QB:  'bg-red-900/50 text-red-300',
  RB:  'bg-green-900/50 text-green-300',
  WR:  'bg-blue-900/50 text-blue-300',
  TE:  'bg-yellow-900/50 text-yellow-300',
  K:   'bg-gray-900/50 text-gray-300',
  DEF: 'bg-purple-900/50 text-purple-300',
}

interface Props {
  round: number
  overallPick: number
  isMyTurn: boolean
  recommendations: Recommendation[]
}

export default function RoundGuide({ round, overallPick, isMyTurn, recommendations }: Props) {
  return (
    <div className="space-y-3">
      {/* Round header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Round {round}</div>
          <div className="text-xs text-gray-600">Overall pick #{overallPick}</div>
        </div>
        {isMyTurn && (
          <span className="text-xs font-bold bg-green-600 text-white px-2.5 py-1 rounded-full animate-pulse">
            YOUR TURN
          </span>
        )}
      </div>

      {/* Recommendation cards */}
      {recommendations.map((rec, i) => {
        const cfg = PRIORITY_CONFIG[rec.priority]
        return (
          <div key={i} className={`rounded-xl border p-3 ${cfg.cls}`}>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${cfg.cls}`}>
                {cfg.label}
              </span>
              <span className="text-sm font-semibold text-white">{rec.label}</span>
            </div>
            <p className="text-xs text-gray-400 mb-2 leading-relaxed">{rec.reason}</p>

            {/* Target positions */}
            <div className="flex gap-1 mb-2">
              {rec.positions.map(pos => (
                <span key={pos} className={`text-xs px-2 py-0.5 rounded-full font-medium ${POS_CHIP[pos]}`}>
                  {pos}
                </span>
              ))}
            </div>

            {/* Top available players */}
            {rec.players.length > 0 && (
              <div className="space-y-1">
                {rec.players.slice(0, 4).map(p => (
                  <div key={p.id} className="flex items-center justify-between text-xs">
                    <span className="text-gray-200 truncate">{p.name}</span>
                    <span className="text-gray-500 ml-2 flex-shrink-0">{p.team} · ADP {p.adp.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
