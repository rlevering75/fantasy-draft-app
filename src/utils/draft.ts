import type { Player, DraftSettings, DraftPick, Recommendation } from '../types'

// Returns all overall pick numbers that belong to myPickPosition in a snake draft
export function getMyOverallPicks(settings: DraftSettings): number[] {
  const { teamCount, rounds, myPickPosition } = settings
  const picks: number[] = []
  for (let round = 1; round <= rounds; round++) {
    const overall =
      round % 2 === 1
        ? (round - 1) * teamCount + myPickPosition
        : round * teamCount - myPickPosition + 1
    picks.push(overall)
  }
  return picks
}

export function getRound(overallPick: number, teamCount: number): number {
  return Math.ceil(overallPick / teamCount)
}

export function getTeamSlot(overallPick: number, teamCount: number): number {
  const round = getRound(overallPick, teamCount)
  const posInRound = ((overallPick - 1) % teamCount) + 1
  return round % 2 === 1 ? posInRound : teamCount - posInRound + 1
}

export function isMyPick(overallPick: number, settings: DraftSettings): boolean {
  const slot = getTeamSlot(overallPick, settings.teamCount)
  return slot === settings.myPickPosition
}

export function buildPick(
  player: Player,
  overallPick: number,
  settings: DraftSettings,
): DraftPick {
  const round = getRound(overallPick, settings.teamCount)
  const roundPick = ((overallPick - 1) % settings.teamCount) + 1
  const teamSlot = getTeamSlot(overallPick, settings.teamCount)
  return {
    overallPick,
    round,
    roundPick,
    teamSlot,
    player,
    isMyPick: teamSlot === settings.myPickPosition,
  }
}

// ── Recommendation engine ────────────────────────────────────────────────────

function topAvailable(players: Player[], pos: string, n: number): Player[] {
  return players.filter(p => p.position === pos).slice(0, n)
}

export function getRecommendations(
  round: number,
  myPicks: Player[],
  available: Player[],
  settings: DraftSettings,
): Recommendation[] {
  const rbCount = myPicks.filter(p => p.position === 'RB').length
  const wrCount = myPicks.filter(p => p.position === 'WR').length
  const qbCount = myPicks.filter(p => p.position === 'QB').length
  const teCount = myPicks.filter(p => p.position === 'TE').length
  const recs: Recommendation[] = []

  // ── Rounds 1-2: BPA from RB/WR ──────────────────────────────────────────────
  if (round <= 2) {
    const targets = available.filter(p => p.position === 'RB' || p.position === 'WR').slice(0, 6)
    recs.push({
      priority: 'must',
      label: 'Best Player Available',
      reason: 'Rounds 1-2 are all about talent. Grab the best RB or WR on the board.',
      positions: ['RB', 'WR'],
      players: targets,
    })
    const eliteTE = available.find(p => p.position === 'TE' && p.adp <= 25)
    if (eliteTE && teCount === 0) {
      recs.push({
        priority: 'value',
        label: 'Elite TE Value',
        reason: `${eliteTE.name} is elite and creates a season-long positional advantage.`,
        positions: ['TE'],
        players: [eliteTE],
      })
    }
    return recs
  }

  // ── Rounds 3-5 ──────────────────────────────────────────────────────────────
  if (round <= 5) {
    if (rbCount < 2) {
      recs.push({
        priority: 'must',
        label: 'Lock In Your RB2',
        reason: 'RB depth wins leagues. Secure your second early before the pool dries up.',
        positions: ['RB'],
        players: topAvailable(available, 'RB', 5),
      })
    }
    if (wrCount < 2) {
      recs.push({
        priority: 'must',
        label: 'Lock In Your WR2',
        reason: 'Two reliable WRs in the first 5 rounds gives you a weekly floor.',
        positions: ['WR'],
        players: topAvailable(available, 'WR', 5),
      })
    }
    if (teCount === 0) {
      const bestTE = available.find(p => p.position === 'TE' && p.adp <= 70)
      if (bestTE) {
        recs.push({
          priority: rbCount >= 2 && wrCount >= 2 ? 'must' : 'high',
          label: 'Grab TE Value Now',
          reason: 'TE is the scarce position. Top options disappear fast after round 4.',
          positions: ['TE'],
          players: topAvailable(available, 'TE', 4),
        })
      }
    }
    // BPA fallback if all positions filled
    if (recs.length === 0) {
      recs.push({
        priority: 'high',
        label: 'Best Available RB/WR',
        reason: 'Your core is set — add depth or grab the best value on the board.',
        positions: ['RB', 'WR'],
        players: available.filter(p => p.position === 'RB' || p.position === 'WR').slice(0, 5),
      })
    }
    return recs
  }

  // ── Rounds 6-8 ──────────────────────────────────────────────────────────────
  if (round <= 8) {
    if (teCount === 0) {
      recs.push({
        priority: 'must',
        label: 'Must-Fill: TE',
        reason: "You've waited long on TE. The top streamers go fast — grab one here.",
        positions: ['TE'],
        players: topAvailable(available, 'TE', 4),
      })
    }
    if (qbCount === 0) {
      const topQB = available.find(p => p.position === 'QB')
      if (topQB && topQB.adp <= 80) {
        recs.push({
          priority: 'high',
          label: 'QB Value Window',
          reason: `Top QBs fall here. ${topQB.name} offers elite upside at a discount.`,
          positions: ['QB'],
          players: topAvailable(available, 'QB', 3),
        })
      }
    }
    recs.push({
      priority: teCount > 0 && qbCount > 0 ? 'must' : 'value',
      label: 'WR Depth & Upside',
      reason: 'Round 6-8 is the best WR value window. Target high-upside WR3s.',
      positions: ['WR'],
      players: topAvailable(available, 'WR', 5),
    })
    return recs
  }

  // ── Rounds 9-11 ─────────────────────────────────────────────────────────────
  if (round <= 11) {
    if (qbCount === 0) {
      recs.push({
        priority: 'must',
        label: 'QB — Grab One Now',
        reason: "Waiting past round 10 for QB leaves you with streamers. Lock in a starter.",
        positions: ['QB'],
        players: topAvailable(available, 'QB', 4),
      })
    }
    recs.push({
      priority: 'high',
      label: 'RB Handcuffs & Upside',
      reason: 'Handcuff your starter. A backup in good situation can be the week-winner.',
      positions: ['RB'],
      players: topAvailable(available, 'RB', 4),
    })
    recs.push({
      priority: 'value',
      label: 'WR Lottery Tickets',
      reason: 'High-ceiling WRs with upside for breakout weeks.',
      positions: ['WR'],
      players: topAvailable(available, 'WR', 4),
    })
    return recs
  }

  // ── Rounds 12-13 ────────────────────────────────────────────────────────────
  if (round <= 13) {
    if (qbCount < 2) {
      recs.push({
        priority: 'high',
        label: 'Streaming QB',
        reason: 'A second QB gives you weekly streaming flexibility.',
        positions: ['QB'],
        players: topAvailable(available, 'QB', 3),
      })
    }
    recs.push({
      priority: 'must',
      label: 'DEF — Lock in Value',
      reason: 'Top defenses spike in value. Take a top-8 D/ST now.',
      positions: ['DEF'],
      players: topAvailable(available, 'DEF', 4),
    })
    recs.push({
      priority: 'value',
      label: 'RB Handcuffs',
      reason: "Insurance for your starters. A clear handcuff is pure free equity.",
      positions: ['RB'],
      players: topAvailable(available, 'RB', 3),
    })
    return recs
  }

  // ── Rounds 14-15 ────────────────────────────────────────────────────────────
  recs.push({
    priority: 'must',
    label: 'D/ST & Kicker',
    reason: 'Fill out your lineup. Grab a kicker and defense if you haven\'t.',
    positions: ['DEF', 'K'],
    players: available.filter(p => p.position === 'DEF' || p.position === 'K').slice(0, 4),
  })
  recs.push({
    priority: 'value',
    label: 'Deep Sleepers',
    reason: 'Swing for the fences — high-ceiling low-cost bets.',
    positions: ['RB', 'WR', 'QB'],
    players: available.filter(p => ['RB', 'WR', 'QB'].includes(p.position)).slice(0, 4),
  })
  return recs
}

// ── Roster display helpers ───────────────────────────────────────────────────

export const ROSTER_SLOTS: { pos: string; label: string; count: number }[] = [
  { pos: 'QB', label: 'QB', count: 2 },
  { pos: 'RB', label: 'RB', count: 4 },
  { pos: 'WR', label: 'WR', count: 4 },
  { pos: 'TE', label: 'TE', count: 2 },
  { pos: 'DEF', label: 'D/ST', count: 1 },
  { pos: 'K', label: 'K', count: 1 },
]
