import type { Player } from '../types'

// 2026 NFL season half-PPR redraft ADP estimates.
// Used only when Sleeper API is unavailable. Bye weeks TBD (set to 0).
export const FALLBACK_PLAYERS: Player[] = [
  // ── ROUND 1 ──────────────────────────────────────────────────────────────────
  { id: 'rb-barkley',    name: 'Saquon Barkley',       position: 'RB', team: 'PHI', adp: 1,  rank: 1,  bye: 0, tier: 1 },
  { id: 'wr-lamb',       name: 'CeeDee Lamb',           position: 'WR', team: 'DAL', adp: 2,  rank: 2,  bye: 0, tier: 1 },
  { id: 'wr-chase',      name: "Ja'Marr Chase",         position: 'WR', team: 'CIN', adp: 3,  rank: 3,  bye: 0, tier: 1 },
  { id: 'rb-hall',       name: 'Breece Hall',            position: 'RB', team: 'NYJ', adp: 4,  rank: 4,  bye: 0, tier: 1 },
  { id: 'wr-jefferson',  name: 'Justin Jefferson',       position: 'WR', team: 'MIN', adp: 5,  rank: 5,  bye: 0, tier: 1 },
  { id: 'rb-robinson',   name: 'Bijan Robinson',         position: 'RB', team: 'ATL', adp: 6,  rank: 6,  bye: 0, tier: 1 },
  { id: 'wr-stbrown',    name: 'Amon-Ra St. Brown',     position: 'WR', team: 'DET', adp: 7,  rank: 7,  bye: 0, tier: 1 },
  { id: 'wr-nabers',     name: 'Malik Nabers',           position: 'WR', team: 'NYG', adp: 8,  rank: 8,  bye: 0, tier: 1 },
  { id: 'wr-ajbrown',    name: 'A.J. Brown',             position: 'WR', team: 'PHI', adp: 9,  rank: 9,  bye: 0, tier: 1 },
  { id: 'rb-achane',     name: "De'Von Achane",          position: 'RB', team: 'MIA', adp: 10, rank: 10, bye: 0, tier: 1 },
  { id: 'rb-gibbs',      name: 'Jahmyr Gibbs',           position: 'RB', team: 'DET', adp: 11, rank: 11, bye: 0, tier: 1 },
  { id: 'rb-cook',       name: 'James Cook',             position: 'RB', team: 'BUF', adp: 12, rank: 12, bye: 0, tier: 1 },

  // ── ROUND 2 ──────────────────────────────────────────────────────────────────
  { id: 'wr-btjr',       name: 'Brian Thomas Jr.',       position: 'WR', team: 'JAX', adp: 13, rank: 13, bye: 0, tier: 2 },
  { id: 'wr-mhj',        name: 'Marvin Harrison Jr.',    position: 'WR', team: 'ARI', adp: 14, rank: 14, bye: 0, tier: 2 },
  { id: 'wr-waddle',     name: 'Jaylen Waddle',           position: 'WR', team: 'MIA', adp: 15, rank: 15, bye: 0, tier: 2 },
  { id: 'te-bowers',     name: 'Brock Bowers',           position: 'TE', team: 'LV',  adp: 16, rank: 16, bye: 0, tier: 1 },
  { id: 'te-kelce',      name: 'Travis Kelce',            position: 'TE', team: 'KC',  adp: 17, rank: 17, bye: 0, tier: 1 },
  { id: 'rb-walker',     name: 'Kenneth Walker III',      position: 'RB', team: 'SEA', adp: 18, rank: 18, bye: 0, tier: 2 },
  { id: 'wr-nacua',      name: 'Puka Nacua',             position: 'WR', team: 'LAR', adp: 19, rank: 19, bye: 0, tier: 2 },
  { id: 'rb-kyren',      name: 'Kyren Williams',          position: 'RB', team: 'LAR', adp: 20, rank: 20, bye: 0, tier: 2 },
  { id: 'rb-jacobs',     name: 'Josh Jacobs',             position: 'RB', team: 'GB',  adp: 21, rank: 21, bye: 0, tier: 2 },
  { id: 'wr-jsn',        name: 'Jaxon Smith-Njigba',     position: 'WR', team: 'SEA', adp: 22, rank: 22, bye: 0, tier: 2 },
  { id: 'wr-devontasmith', name: 'DeVonta Smith',        position: 'WR', team: 'PHI', adp: 23, rank: 23, bye: 0, tier: 2 },
  { id: 'wr-wilson',     name: 'Garrett Wilson',          position: 'WR', team: 'NYJ', adp: 24, rank: 24, bye: 0, tier: 2 },

  // ── ROUND 3 ──────────────────────────────────────────────────────────────────
  { id: 'te-laporta',    name: 'Sam LaPorta',             position: 'TE', team: 'DET', adp: 25, rank: 25, bye: 0, tier: 2 },
  { id: 'te-andrews',    name: 'Mark Andrews',            position: 'TE', team: 'BAL', adp: 26, rank: 26, bye: 0, tier: 2 },
  { id: 'qb-jackson',    name: 'Lamar Jackson',           position: 'QB', team: 'BAL', adp: 27, rank: 27, bye: 0, tier: 1 },
  { id: 'qb-allen',      name: 'Josh Allen',              position: 'QB', team: 'BUF', adp: 28, rank: 28, bye: 0, tier: 1 },
  { id: 'rb-taylor',     name: 'Jonathan Taylor',         position: 'RB', team: 'IND', adp: 29, rank: 29, bye: 0, tier: 2 },
  { id: 'wr-higgins',    name: 'Tee Higgins',             position: 'WR', team: 'CIN', adp: 30, rank: 30, bye: 0, tier: 2 },
  { id: 'wr-flowers',    name: 'Zay Flowers',             position: 'WR', team: 'BAL', adp: 31, rank: 31, bye: 0, tier: 2 },
  { id: 'wr-addison',    name: 'Jordan Addison',          position: 'WR', team: 'MIN', adp: 32, rank: 32, bye: 0, tier: 3 },
  { id: 'rb-henry',      name: 'Derrick Henry',           position: 'RB', team: 'BAL', adp: 33, rank: 33, bye: 0, tier: 3 },
  { id: 'wr-mclaurin',   name: 'Terry McLaurin',          position: 'WR', team: 'WAS', adp: 34, rank: 34, bye: 0, tier: 3 },
  { id: 'qb-hurts',      name: 'Jalen Hurts',             position: 'QB', team: 'PHI', adp: 35, rank: 35, bye: 0, tier: 1 },
  { id: 'qb-mahomes',    name: 'Patrick Mahomes',         position: 'QB', team: 'KC',  adp: 36, rank: 36, bye: 0, tier: 1 },

  // ── ROUND 4 ──────────────────────────────────────────────────────────────────
  { id: 'te-kittle',     name: 'George Kittle',           position: 'TE', team: 'SF',  adp: 37, rank: 37, bye: 0, tier: 2 },
  { id: 'wr-odunze',     name: 'Rome Odunze',             position: 'WR', team: 'CHI', adp: 38, rank: 38, bye: 0, tier: 3 },
  { id: 'wr-worthy',     name: 'Xavier Worthy',           position: 'WR', team: 'KC',  adp: 39, rank: 39, bye: 0, tier: 3 },
  { id: 'wr-rice',       name: 'Rashee Rice',             position: 'WR', team: 'KC',  adp: 40, rank: 40, bye: 0, tier: 3 },
  { id: 'wr-sutton',     name: 'Courtland Sutton',        position: 'WR', team: 'DEN', adp: 41, rank: 41, bye: 0, tier: 3 },
  { id: 'qb-daniels',    name: 'Jayden Daniels',          position: 'QB', team: 'WAS', adp: 42, rank: 42, bye: 0, tier: 2 },
  { id: 'wr-metcalf',    name: 'DK Metcalf',              position: 'WR', team: 'SEA', adp: 43, rank: 43, bye: 0, tier: 3 },
  { id: 'te-goedert',    name: 'Dallas Goedert',          position: 'TE', team: 'PHI', adp: 44, rank: 44, bye: 0, tier: 3 },
  { id: 'wr-pittman',    name: 'Michael Pittman Jr.',     position: 'WR', team: 'IND', adp: 45, rank: 45, bye: 0, tier: 3 },
  { id: 'qb-calieb',     name: 'Caleb Williams',          position: 'QB', team: 'CHI', adp: 46, rank: 46, bye: 0, tier: 2 },
  { id: 'rb-cmc',        name: 'Christian McCaffrey',     position: 'RB', team: 'SF',  adp: 47, rank: 47, bye: 0, tier: 3 },
  { id: 'wr-mike',       name: 'Mike Evans',              position: 'WR', team: 'TB',  adp: 48, rank: 48, bye: 0, tier: 3 },

  // ── ROUND 5 ──────────────────────────────────────────────────────────────────
  { id: 'rb-charbonnet', name: 'Zach Charbonnet',        position: 'RB', team: 'SEA', adp: 49, rank: 49, bye: 0, tier: 3 },
  { id: 'rb-kamara',     name: 'Alvin Kamara',            position: 'RB', team: 'NO',  adp: 50, rank: 50, bye: 0, tier: 3 },
  { id: 'qb-burrow',     name: 'Joe Burrow',              position: 'QB', team: 'CIN', adp: 51, rank: 51, bye: 0, tier: 2 },
  { id: 'qb-love',       name: 'Jordan Love',             position: 'QB', team: 'GB',  adp: 52, rank: 52, bye: 0, tier: 2 },
  { id: 'te-pitts',      name: 'Kyle Pitts',              position: 'TE', team: 'ATL', adp: 53, rank: 53, bye: 0, tier: 3 },
  { id: 'qb-purdy',      name: 'Brock Purdy',             position: 'QB', team: 'SF',  adp: 54, rank: 54, bye: 0, tier: 2 },
  { id: 'rb-swift',      name: "D'Andre Swift",           position: 'RB', team: 'CHI', adp: 55, rank: 55, bye: 0, tier: 3 },
  { id: 'rb-spears',     name: 'Tyjae Spears',            position: 'RB', team: 'TEN', adp: 56, rank: 56, bye: 0, tier: 3 },
  { id: 'te-engram',     name: 'Evan Engram',             position: 'TE', team: 'JAX', adp: 57, rank: 57, bye: 0, tier: 3 },
  { id: 'rb-white',      name: 'Rachaad White',           position: 'RB', team: 'TB',  adp: 58, rank: 58, bye: 0, tier: 3 },
  { id: 'qb-nix',        name: 'Bo Nix',                  position: 'QB', team: 'DEN', adp: 59, rank: 59, bye: 0, tier: 3 },
  { id: 'rb-hubbard',    name: 'Chuba Hubbard',           position: 'RB', team: 'CAR', adp: 60, rank: 60, bye: 0, tier: 3 },

  // ── ROUNDS 6-7 ───────────────────────────────────────────────────────────────
  { id: 'te-njoku',      name: 'David Njoku',             position: 'TE', team: 'CLE', adp: 61, rank: 61, bye: 0, tier: 3 },
  { id: 'te-hockenson',  name: 'T.J. Hockenson',         position: 'TE', team: 'MIN', adp: 62, rank: 62, bye: 0, tier: 3 },
  { id: 'wr-hill',       name: 'Tyreek Hill',             position: 'WR', team: 'MIA', adp: 63, rank: 63, bye: 0, tier: 3 },
  { id: 'wr-kupp',       name: 'Cooper Kupp',             position: 'WR', team: 'LAR', adp: 64, rank: 64, bye: 0, tier: 4 },
  { id: 'qb-maye',       name: 'Drake Maye',              position: 'QB', team: 'NE',  adp: 65, rank: 65, bye: 0, tier: 3 },
  { id: 'qb-richardson', name: 'Anthony Richardson',      position: 'QB', team: 'IND', adp: 66, rank: 66, bye: 0, tier: 3 },
  { id: 'qb-herbert',    name: 'Justin Herbert',          position: 'QB', team: 'LAC', adp: 67, rank: 67, bye: 0, tier: 3 },
  { id: 'rb-ford',       name: 'Jerome Ford',             position: 'RB', team: 'CLE', adp: 68, rank: 68, bye: 0, tier: 4 },
  { id: 'wr-doubs',      name: 'Romeo Doubs',             position: 'WR', team: 'GB',  adp: 69, rank: 69, bye: 0, tier: 4 },
  { id: 'te-kmet',       name: 'Cole Kmet',               position: 'TE', team: 'CHI', adp: 70, rank: 70, bye: 0, tier: 4 },
  { id: 'qb-murray',     name: 'Kyler Murray',            position: 'QB', team: 'ARI', adp: 71, rank: 71, bye: 0, tier: 3 },
  { id: 'te-kincaid',    name: 'Dalton Kincaid',          position: 'TE', team: 'BUF', adp: 72, rank: 72, bye: 0, tier: 4 },
  { id: 'wr-cooper',     name: 'Amari Cooper',            position: 'WR', team: 'NO',  adp: 73, rank: 73, bye: 0, tier: 4 },
  { id: 'wr-boyd',       name: 'Tyler Boyd',              position: 'WR', team: 'TEN', adp: 74, rank: 74, bye: 0, tier: 4 },
  { id: 'rb-pierce',     name: 'Dameon Pierce',           position: 'RB', team: 'HOU', adp: 75, rank: 75, bye: 0, tier: 4 },
  { id: 'rb-pollard',    name: 'Tony Pollard',            position: 'RB', team: 'TEN', adp: 76, rank: 76, bye: 0, tier: 4 },
  { id: 'qb-tua',        name: 'Tua Tagovailoa',          position: 'QB', team: 'MIA', adp: 77, rank: 77, bye: 0, tier: 4 },
  { id: 'rb-mclaughlin', name: 'Jaleel McLaughlin',       position: 'RB', team: 'DEN', adp: 78, rank: 78, bye: 0, tier: 4 },
  { id: 'qb-prescott',   name: 'Dak Prescott',            position: 'QB', team: 'DAL', adp: 79, rank: 79, bye: 0, tier: 3 },
  { id: 'wr-watson',     name: 'Christian Watson',        position: 'WR', team: 'GB',  adp: 80, rank: 80, bye: 0, tier: 4 },
  { id: 'qb-lawrence',   name: 'Trevor Lawrence',         position: 'QB', team: 'JAX', adp: 81, rank: 81, bye: 0, tier: 4 },
  { id: 'rb-mostert',    name: 'Raheem Mostert',          position: 'RB', team: 'MIA', adp: 82, rank: 82, bye: 0, tier: 5 },
  { id: 'rb-montgomery', name: 'David Montgomery',        position: 'RB', team: 'DET', adp: 83, rank: 83, bye: 0, tier: 4 },
  { id: 'qb-darnold',    name: 'Sam Darnold',             position: 'QB', team: 'MIN', adp: 84, rank: 84, bye: 0, tier: 4 },

  // ── ROUNDS 8-10 ──────────────────────────────────────────────────────────────
  { id: 'wr-nuk',        name: 'DeAndre Hopkins',         position: 'WR', team: 'TEN', adp: 86, rank: 86, bye: 0, tier: 5 },
  { id: 'rb-conner',     name: 'James Conner',            position: 'RB', team: 'ARI', adp: 88, rank: 88, bye: 0, tier: 5 },
  { id: 'te-schultz',    name: 'Juwan Johnson',           position: 'TE', team: 'NO',  adp: 90, rank: 90, bye: 0, tier: 4 },
  { id: 'rb-tucker',     name: 'Tyjae Spears',            position: 'RB', team: 'TEN', adp: 92, rank: 92, bye: 0, tier: 4 },
  { id: 'wr-kirk',       name: 'Christian Kirk',          position: 'WR', team: 'JAX', adp: 94, rank: 94, bye: 0, tier: 5 },
  { id: 'rb-mixon',      name: 'Joe Mixon',               position: 'RB', team: 'HOU', adp: 96, rank: 96, bye: 0, tier: 5 },
  { id: 'wr-gustin',     name: 'Rashid Shaheed',          position: 'WR', team: 'NO',  adp: 98, rank: 98, bye: 0, tier: 5 },
  { id: 'rb-stevenson',  name: 'Rhamondre Stevenson',     position: 'RB', team: 'NE',  adp: 100, rank: 100, bye: 0, tier: 5 },

  // ── ROUNDS 11-13: DEF window ──────────────────────────────────────────────────
  { id: 'def-phi',  name: 'Philadelphia Eagles D/ST',    position: 'DEF', team: 'PHI', adp: 110, rank: 110, bye: 0, tier: 1 },
  { id: 'def-bal',  name: 'Baltimore Ravens D/ST',       position: 'DEF', team: 'BAL', adp: 112, rank: 112, bye: 0, tier: 1 },
  { id: 'def-buf',  name: 'Buffalo Bills D/ST',          position: 'DEF', team: 'BUF', adp: 114, rank: 114, bye: 0, tier: 1 },
  { id: 'def-kc',   name: 'Kansas City Chiefs D/ST',     position: 'DEF', team: 'KC',  adp: 116, rank: 116, bye: 0, tier: 2 },
  { id: 'def-det',  name: 'Detroit Lions D/ST',          position: 'DEF', team: 'DET', adp: 118, rank: 118, bye: 0, tier: 2 },
  { id: 'def-was',  name: 'Washington Commanders D/ST',  position: 'DEF', team: 'WAS', adp: 120, rank: 120, bye: 0, tier: 2 },
  { id: 'def-dal',  name: 'Dallas Cowboys D/ST',         position: 'DEF', team: 'DAL', adp: 122, rank: 122, bye: 0, tier: 2 },
  { id: 'def-pit',  name: 'Pittsburgh Steelers D/ST',    position: 'DEF', team: 'PIT', adp: 124, rank: 124, bye: 0, tier: 3 },
  { id: 'def-min',  name: 'Minnesota Vikings D/ST',      position: 'DEF', team: 'MIN', adp: 126, rank: 126, bye: 0, tier: 3 },
  { id: 'def-hou',  name: 'Houston Texans D/ST',         position: 'DEF', team: 'HOU', adp: 128, rank: 128, bye: 0, tier: 3 },
  { id: 'def-sf',   name: 'San Francisco 49ers D/ST',    position: 'DEF', team: 'SF',  adp: 130, rank: 130, bye: 0, tier: 3 },
  { id: 'def-cle',  name: 'Cleveland Browns D/ST',       position: 'DEF', team: 'CLE', adp: 132, rank: 132, bye: 0, tier: 4 },

  // ── ROUNDS 14-15: Kickers ─────────────────────────────────────────────────────
  { id: 'k-butker',      name: 'Harrison Butker',         position: 'K', team: 'KC',  adp: 140, rank: 140, bye: 0, tier: 1 },
  { id: 'k-bass',        name: 'Tyler Bass',              position: 'K', team: 'BUF', adp: 142, rank: 142, bye: 0, tier: 1 },
  { id: 'k-mcpherson',   name: 'Evan McPherson',          position: 'K', team: 'CIN', adp: 144, rank: 144, bye: 0, tier: 1 },
  { id: 'k-aubrey',      name: 'Brandon Aubrey',          position: 'K', team: 'DAL', adp: 146, rank: 146, bye: 0, tier: 2 },
  { id: 'k-fairbairn',   name: "Ka'imi Fairbairn",        position: 'K', team: 'HOU', adp: 148, rank: 148, bye: 0, tier: 2 },
  { id: 'k-moody',       name: 'Jake Moody',              position: 'K', team: 'SF',  adp: 150, rank: 150, bye: 0, tier: 2 },
]

export function calculateTier(rank: number, position: string): number {
  if (position === 'K' || position === 'DEF') return rank <= 115 ? 1 : rank <= 125 ? 2 : 3
  if (rank <= 12) return 1
  if (rank <= 24) return 2
  if (rank <= 48) return 3
  if (rank <= 84) return 4
  return 5
}
