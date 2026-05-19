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

  // ── Rounds 1-2: BPA RB/WR only — QB has zero value here in 1-QB ─────────────
  if (round <= 2) {
    recs.push({
      priority: 'must',
      label: 'Best Player Available',
      reason: 'Rounds 1-2: RB/WR only. In 1-QB leagues QB provides no early-round edge — the position is too deep.',
      positions: ['RB', 'WR'],
      players: available.filter(p => p.position === 'RB' || p.position === 'WR').slice(0, 6),
    })
    const eliteTE = available.find(p => p.position === 'TE' && p.adp <= 25)
    if (eliteTE && teCount === 0) {
      recs.push({
        priority: 'value',
        label: 'Elite TE Exception',
        reason: `${eliteTE.name} is rare enough to consider — a season-long positional advantage at TE.`,
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
        label: 'Lock In RB2',
        reason: 'RB is the scarcest position. Secure your second before the pool dries up — you can always find a QB late.',
        positions: ['RB'],
        players: topAvailable(available, 'RB', 5),
      })
    }
    if (wrCount < 2) {
      recs.push({
        priority: 'must',
        label: 'Lock In WR2',
        reason: 'Two reliable WRs in rounds 1-5 gives you a floor every week.',
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
          reason: 'TE dries up fast. Top streamers go rounds 4-6 — waiting too long leaves you streaming weekly.',
          positions: ['TE'],
          players: topAvailable(available, 'TE', 4),
        })
      }
    }
    // Don't recommend QB in rounds 3-5 in 1-QB leagues — it's a waste
    if (recs.length === 0) {
      recs.push({
        priority: 'high',
        label: 'Best Available RB/WR',
        reason: 'Core is set — stack more depth at RB/WR before targeting QB or TE.',
        positions: ['RB', 'WR'],
        players: available.filter(p => p.position === 'RB' || p.position === 'WR').slice(0, 5),
      })
    }
    return recs
  }

  // ── Rounds 6-8: TE must-fill window, QB starts becoming relevant ─────────────
  if (round <= 8) {
    if (teCount === 0) {
      recs.push({
        priority: 'must',
        label: 'Must-Fill: TE',
        reason: "Waiting past round 8 for TE means streaming all season. Lock in a starter now.",
        positions: ['TE'],
        players: topAvailable(available, 'TE', 4),
      })
    }
    recs.push({
      priority: teCount > 0 ? 'must' : 'high',
      label: 'WR Depth & Upside',
      reason: 'Rounds 6-8 are the sweet spot for WR3 upside. Best value window before QB run.',
      positions: ['WR'],
      players: topAvailable(available, 'WR', 5),
    })
    // Only flag QB here if a clear elite option is available — otherwise wait
    if (qbCount === 0) {
      const topQB = available.find(p => p.position === 'QB')
      if (topQB && topQB.adp <= 70) {
        recs.push({
          priority: 'value',
          label: 'Elite QB Falling',
          reason: `${topQB.name} is elite value here. Otherwise, wait — QB depth is strong in 1-QB leagues.`,
          positions: ['QB'],
          players: topAvailable(available, 'QB', 2),
        })
      }
    }
    return recs
  }

  // ── Rounds 9-11: QB window, RB handcuffs ─────────────────────────────────────
  if (round <= 11) {
    if (qbCount === 0) {
      recs.push({
        priority: 'must',
        label: 'QB — Target Now',
        reason: "1-QB leagues: rounds 9-11 are optimal. You get a starter without sacrificing early skill picks.",
        positions: ['QB'],
        players: topAvailable(available, 'QB', 4),
      })
    }
    recs.push({
      priority: 'high',
      label: 'RB Handcuffs',
      reason: 'Handcuff your RB1 — injuries are inevitable and a clear backup is free equity.',
      positions: ['RB'],
      players: topAvailable(available, 'RB', 4),
    })
    recs.push({
      priority: 'value',
      label: 'WR Lottery Tickets',
      reason: 'High-upside WRs in good offenses with a path to targets.',
      positions: ['WR'],
      players: topAvailable(available, 'WR', 4),
    })
    return recs
  }

  // ── Rounds 12-13 ────────────────────────────────────────────────────────────
  if (round <= 13) {
    if (qbCount === 0) {
      recs.push({
        priority: 'must',
        label: 'QB — Last Call',
        reason: "Don't enter the season without a QB. Grab a streamer now.",
        positions: ['QB'],
        players: topAvailable(available, 'QB', 3),
      })
    }
    recs.push({
      priority: 'must',
      label: 'DEF — Lock in Value',
      reason: 'Top defenses crater in value if you wait. Grab a top-8 D/ST here.',
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
  { pos: 'QB', label: 'QB', count: 1 },
  { pos: 'RB', label: 'RB', count: 4 },
  { pos: 'WR', label: 'WR', count: 4 },
  { pos: 'TE', label: 'TE', count: 1 },
  { pos: 'DEF', label: 'D/ST', count: 1 },
  { pos: 'K', label: 'K', count: 1 },
]
