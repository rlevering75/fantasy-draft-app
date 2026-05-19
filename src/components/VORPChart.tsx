import { useMemo } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ReferenceLine, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import type { Player } from '../types'

// Replacement-level positional rank for 12-team 1QB PPR
// QB13, RB25 (2 starters + flex), WR30 (2-3 starters + flex), TE13
const REPLACEMENT: Record<string, number> = { QB: 13, RB: 25, WR: 30, TE: 13 }

const POS_COLOR: Record<string, string> = {
  QB: '#f87171', RB: '#4ade80', WR: '#60a5fa', TE: '#facc15',
}

interface VORPPoint {
  rank: number
  vorp: number
  name: string
  drafted: boolean
}

interface ChartProps {
  pos: string
  data: VORPPoint[]
  bestAvailRank: number   // positional rank of the top player still on the board
}

function CustomTooltip({ active, payload, label, posData }: {
  active?: boolean
  payload?: { value: number }[]
  label?: number
  posData: VORPPoint[]
}) {
  if (!active || !payload?.length || label == null) return null
  const p = posData[label - 1]
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs shadow-lg">
      <div className="font-semibold text-white truncate max-w-[120px]">{p?.name ?? `Rank ${label}`}</div>
      <div className="text-gray-400">VORP <span className="text-white font-mono">{payload[0].value.toFixed(1)}</span></div>
      {p?.drafted && <div className="text-red-400 text-[10px]">Drafted</div>}
    </div>
  )
}

function PositionChart({ pos, data, bestAvailRank }: ChartProps) {
  const color = POS_COLOR[pos]
  const repRank = REPLACEMENT[pos]

  return (
    <div>
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-[10px] font-bold" style={{ color }}>{pos} VORP</span>
        <span className="text-[9px] text-gray-600">repl = {pos}{repRank}</span>
      </div>
      <ResponsiveContainer width="100%" height={72}>
        <AreaChart data={data} margin={{ top: 4, right: 2, bottom: 0, left: -28 }}>
          <CartesianGrid strokeDasharray="2 4" stroke="#1f2937" vertical={false} />
          <XAxis
            dataKey="rank"
            tick={{ fontSize: 8, fill: '#4b5563' }}
            interval={9}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 7, fill: '#4b5563' }}
            tickLine={false}
            axisLine={false}
            width={28}
          />
          <Tooltip
            content={<CustomTooltip posData={data} />}
            cursor={{ stroke: '#374151', strokeWidth: 1 }}
          />
          {/* Replacement-level line (VORP = 0 is implicit at the x-axis) */}
          <ReferenceLine
            x={repRank}
            stroke="#374151"
            strokeWidth={1}
            strokeDasharray="4 2"
          />
          {/* Moving bar: best available player's positional rank */}
          {bestAvailRank <= 50 && (
            <ReferenceLine
              x={bestAvailRank}
              stroke="#ffffff"
              strokeWidth={1.5}
              strokeOpacity={0.7}
              label={{
                value: `${pos}${bestAvailRank}`,
                fill: '#9ca3af',
                fontSize: 8,
                position: 'insideTopRight',
                dy: -2,
              }}
            />
          )}
          <Area
            type="monotone"
            dataKey="vorp"
            stroke={color}
            strokeWidth={1.5}
            fill={color}
            fillOpacity={0.12}
            dot={false}
            activeDot={{ r: 3, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

interface Props {
  allPlayers: Player[]       // full pool — for VORP curve (top 50 per pos regardless of draft status)
  availablePlayers: Player[] // still on the board — for moving bar position
}

export default function VORPChart({ allPlayers, availablePlayers }: Props) {
  const availableIds = useMemo(
    () => new Set(availablePlayers.map(p => p.id)),
    [availablePlayers],
  )

  const { posData, bestAvailRank } = useMemo(() => {
    const posData: Record<string, VORPPoint[]> = {}
    const bestAvailRank: Record<string, number> = {}

    for (const pos of ['RB', 'WR', 'TE', 'QB']) {
      const sorted = allPlayers
        .filter(p => p.position === pos)
        .sort((a, b) => a.adp - b.adp)
        .slice(0, 50)

      const repRank = REPLACEMENT[pos]
      const repADP  = sorted[repRank - 1]?.adp ?? 200

      posData[pos] = sorted.map((p, i) => ({
        rank:    i + 1,
        vorp:    Math.max(0, repADP - p.adp),
        name:    p.name,
        drafted: !availableIds.has(p.id),
      }))

      // First player still on the board = where the moving bar sits
      const firstAvail = posData[pos].find(d => !d.drafted)
      bestAvailRank[pos] = firstAvail?.rank ?? posData[pos].length + 1
    }

    return { posData, bestAvailRank }
  }, [allPlayers, availableIds])

  return (
    <div className="space-y-3">
      <p className="text-[9px] text-gray-700 leading-tight">
        White bar = best available. Gray dashed = replacement level. ADP-based value proxy.
      </p>
      {(['RB', 'WR', 'TE', 'QB'] as const).map(pos => (
        <PositionChart
          key={pos}
          pos={pos}
          data={posData[pos] ?? []}
          bestAvailRank={bestAvailRank[pos] ?? 1}
        />
      ))}
    </div>
  )
}
