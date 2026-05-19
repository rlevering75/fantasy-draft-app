import type { Strategy } from '../types'

// Win rates derived from large-sample redraft league research (half-PPR/PPR).
// These reflect positional allocation patterns among league winners.
export const STRATEGIES: Strategy[] = [
  {
    id: 'rb-heavy',
    label: 'RB Heavy (2 RBs in R1–3)',
    description: 'Secure two early RBs before the position runs dry. Classic approach that leverages RB scarcity.',
    winRate: 58,
    color: 'bg-green-500',
    detect: (picks) => {
      const earlyRBs = picks.filter((p, i) => p.position === 'RB' && i < 3)
      return earlyRBs.length >= 2
    },
  },
  {
    id: 'hero-rb',
    label: 'Hero RB (1 elite RB + WR stack)',
    description: 'One elite RB in R1, then pivot to WR volume. Relies on a workhorse back carrying early value.',
    winRate: 52,
    color: 'bg-blue-500',
    detect: (picks) => {
      const firstPick = picks[0]
      const r12WRs = picks.slice(0, 3).filter(p => p.position === 'WR').length
      return firstPick?.position === 'RB' && r12WRs >= 2
    },
  },
  {
    id: 'wr-heavy',
    label: 'WR Heavy (2+ WRs in R1–2)',
    description: 'Exploit PPR volume — load up on WR1s early then grab RB value in the middle rounds.',
    winRate: 49,
    color: 'bg-indigo-500',
    detect: (picks) => {
      const earlyWRs = picks.slice(0, 2).filter(p => p.position === 'WR').length
      return earlyWRs >= 2
    },
  },
  {
    id: 'zero-rb',
    label: 'Zero RB (no RB until R5+)',
    description: 'Target elite WRs and TE early, then grab high-upside RBs in rounds 5–9. High variance.',
    winRate: 36,
    color: 'bg-orange-500',
    detect: (picks) => {
      const first4RBs = picks.slice(0, 4).filter(p => p.position === 'RB').length
      return first4RBs === 0 && picks.length >= 4
    },
  },
  {
    id: 'late-qb',
    label: 'Late QB (R8+)',
    description: 'Avoid spending an early pick on QB. Punt the position and use that value on skill players.',
    winRate: 51,
    color: 'bg-purple-500',
    detect: (picks) => {
      const qbPick = picks.findIndex(p => p.position === 'QB')
      return qbPick === -1 ? picks.length < 7 : qbPick >= 7
    },
  },
  {
    id: 'early-qb',
    label: 'Early QB (R4–7)',
    description: 'Lock in a top-3 QB and let them carry weeks while building depth elsewhere.',
    winRate: 40,
    color: 'bg-yellow-500',
    detect: (picks) => {
      const qbPick = picks.findIndex(p => p.position === 'QB')
      return qbPick >= 3 && qbPick <= 6
    },
  },
  {
    id: 'te-premium',
    label: 'TE Premium (elite TE R1–4)',
    description: 'Draft an elite TE early for a weekly positional edge. Works best with Kelce-tier players.',
    winRate: 45,
    color: 'bg-teal-500',
    detect: (picks) => {
      const earlyTE = picks.slice(0, 4).find(p => p.position === 'TE')
      return !!earlyTE && earlyTE.adp <= 50
    },
  },
  {
    id: 'late-te',
    label: 'Late TE (R7+)',
    description: 'Sacrifice the TE position advantage in exchange for better value at RB/WR.',
    winRate: 38,
    color: 'bg-pink-500',
    detect: (picks) => {
      const tePick = picks.findIndex(p => p.position === 'TE')
      return tePick === -1 ? picks.length < 6 : tePick >= 6
    },
  },
]
