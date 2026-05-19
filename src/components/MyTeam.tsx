import type { Player } from '../types'

const POS_COLORS: Record<string, string> = {
  QB:  'text-red-300',
  RB:  'text-green-300',
  WR:  'text-blue-300',
  TE:  'text-yellow-300',
  K:   'text-gray-300',
  DEF: 'text-purple-300',
}

const POS_BG: Record<string, string> = {
  QB:  'bg-red-900/30 border-red-800/40',
  RB:  'bg-green-900/30 border-green-800/40',
  WR:  'bg-blue-900/30 border-blue-800/40',
  TE:  'bg-yellow-900/30 border-yellow-800/40',
  K:   'bg-gray-800/30 border-gray-700/40',
  DEF: 'bg-purple-900/30 border-purple-800/40',
}

const ORDER: Player['position'][] = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF']

interface Props {
  myPicks: Player[]
  onUndo: () => void
  canUndo: boolean
}

export default function MyTeam({ myPicks, onUndo, canUndo }: Props) {
  const byPos = ORDER.reduce<Record<string, Player[]>>((acc, pos) => {
    acc[pos] = myPicks.filter(p => p.position === pos)
    return acc
  }, {})

  const total = myPicks.length

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-800">
        <h2 className="text-sm font-semibold text-gray-300">My Team</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{total} picks</span>
          {canUndo && (
            <button
              onClick={onUndo}
              className="text-xs text-blue-400 hover:text-blue-300 underline underline-offset-2"
            >
              Undo
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {total === 0 && (
          <p className="text-gray-600 text-xs text-center pt-6">Your picks will appear here</p>
        )}
        {ORDER.map(pos => {
          const group = byPos[pos]
          if (group.length === 0) return null
          return (
            <div key={pos}>
              <div className={`text-xs font-bold px-2 py-0.5 mb-0.5 ${POS_COLORS[pos]}`}>{pos}</div>
              {group.map((p, i) => (
                <div
                  key={p.id}
                  className={`rounded-md px-2 py-1.5 mb-0.5 border text-xs ${POS_BG[pos]}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium truncate">{p.name}</span>
                    <span className="text-gray-500 text-xs ml-1 flex-shrink-0">{p.team}</span>
                  </div>
                  {p.bye > 0 && (
                    <div className="text-gray-600 text-xs">Bye {p.bye}</div>
                  )}
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {/* Bye week summary */}
      {total > 0 && (
        <ByeWeekSummary picks={myPicks} />
      )}
    </div>
  )
}

function ByeWeekSummary({ picks }: { picks: Player[] }) {
  const byes = picks.reduce<Record<number, string[]>>((acc, p) => {
    if (p.bye > 0) {
      acc[p.bye] = acc[p.bye] ?? []
      acc[p.bye].push(p.position)
    }
    return acc
  }, {})

  const stacked = Object.entries(byes)
    .filter(([, positions]) => positions.length >= 3)
    .map(([week, positions]) => ({ week: Number(week), count: positions.length, positions }))

  if (stacked.length === 0) return null

  return (
    <div className="border-t border-gray-800 px-3 py-2">
      <div className="text-xs text-gray-500 mb-1">Bye week warnings</div>
      {stacked.map(({ week, count }) => (
        <div key={week} className="text-xs text-orange-400">
          Week {week}: {count} players off
        </div>
      ))}
    </div>
  )
}
