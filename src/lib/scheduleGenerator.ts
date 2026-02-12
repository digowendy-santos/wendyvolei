import { Team, Match, GameFormat, RoundType } from './types';

/**
 * Generate round-robin rounds using the circle method.
 * Each round contains matches where every team plays exactly once (even count)
 * or all but one team plays (odd count with bye).
 * Flattening rounds in order guarantees no team waits more than 1 match.
 */
function generateRounds(numTeams: number): [number, number][][] {
  const isOdd = numTeams % 2 !== 0;
  const totalTeams = isOdd ? numTeams + 1 : numTeams;
  const rounds: [number, number][][] = [];

  // Build initial array: indices 0..totalTeams-1
  // We'll fix index 0 and rotate the rest (standard circle method)
  const circle: number[] = [];
  for (let i = 1; i < totalTeams; i++) circle.push(i);

  for (let round = 0; round < totalTeams - 1; round++) {
    const roundMatches: [number, number][] = [];

    // First match always involves team 0
    const opp = circle[0];
    if (0 < numTeams && opp < numTeams) {
      roundMatches.push([0, opp]);
    }

    // Remaining matches pair from outside-in
    for (let i = 1; i < totalTeams / 2; i++) {
      const t1 = circle[i];
      const t2 = circle[circle.length - i];
      if (t1 < numTeams && t2 < numTeams) {
        roundMatches.push([t1, t2]);
      }
    }

    rounds.push(roundMatches);

    // Rotate circle array: last element goes to front
    circle.unshift(circle.pop()!);
  }

  return rounds;
}

export function generateSchedule(
  teams: Team[],
  format: GameFormat,
  roundType: RoundType
): Match[] {
  const n = teams.length;
  if (n < 2) return [];

  const rounds = generateRounds(n);

  // Turno: flatten rounds in natural order (max 1 game wait)
  let allPairings: [number, number][] = rounds.flat();

  if (roundType === 'turno-returno') {
    // Returno: same round structure but swap home/away
    const returnPairings: [number, number][] = rounds
      .flat()
      .map(([a, b]) => [b, a] as [number, number]);
    allPairings = [...allPairings, ...returnPairings];
  }

  return allPairings.map((pair, index) => ({
    id: index + 1,
    team1Id: teams[pair[0]].id,
    team2Id: teams[pair[1]].id,
    score1: null,
    score2: null,
    timerSeconds: 0,
    isFinished: false,
  }));
}
