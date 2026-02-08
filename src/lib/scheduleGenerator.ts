import { Team, Match, GameFormat, RoundType } from './types';

function generateRounds(numTeams: number): [number, number][][] {
  const isOdd = numTeams % 2 !== 0;
  const totalTeams = isOdd ? numTeams + 1 : numTeams;
  const rounds: [number, number][][] = [];
  const teams = Array.from({ length: totalTeams }, (_, i) => i);

  for (let round = 0; round < totalTeams - 1; round++) {
    const roundMatches: [number, number][] = [];
    for (let i = 0; i < totalTeams / 2; i++) {
      const t1 = teams[i];
      const t2 = teams[totalTeams - 1 - i];
      if (t1 < numTeams && t2 < numTeams) {
        roundMatches.push([t1, t2]);
      }
    }
    rounds.push(roundMatches);
    // Rotate: fix teams[0], rotate the rest
    const last = teams.pop()!;
    teams.splice(1, 0, last);
  }
  return rounds;
}

function optimizeMatchOrder(
  allMatches: [number, number][],
  numTeams: number
): [number, number][] {
  const result: [number, number][] = [];
  const remaining = allMatches.map((m, i) => ({ match: m, idx: i }));
  const lastPlayed = new Map<number, number>();

  for (let i = 0; i < numTeams; i++) {
    lastPlayed.set(i, -10);
  }

  for (let step = 0; remaining.length > 0; step++) {
    let bestIdx = 0;
    let bestPriority = -Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const [t1, t2] = remaining[i].match;
      const wait1 = step - (lastPlayed.get(t1) ?? -10);
      const wait2 = step - (lastPlayed.get(t2) ?? -10);
      const priority = Math.max(wait1, wait2) * 100 + Math.min(wait1, wait2);
      if (priority > bestPriority) {
        bestPriority = priority;
        bestIdx = i;
      }
    }

    const picked = remaining.splice(bestIdx, 1)[0];
    result.push(picked.match);
    lastPlayed.set(picked.match[0], step);
    lastPlayed.set(picked.match[1], step);
  }

  return result;
}

export function generateSchedule(
  teams: Team[],
  format: GameFormat,
  roundType: RoundType
): Match[] {
  const n = teams.length;
  if (n < 2) return [];

  const rounds = generateRounds(n);
  let allPairings: [number, number][] = rounds.flat();

  if (roundType === 'turno-returno') {
    const returnPairings = allPairings.map(
      ([a, b]) => [b, a] as [number, number]
    );
    allPairings = [...allPairings, ...returnPairings];
  }

  const optimized = optimizeMatchOrder(allPairings, n);

  return optimized.map((pair, index) => ({
    id: index + 1,
    team1Id: teams[pair[0]].id,
    team2Id: teams[pair[1]].id,
    score1: null,
    score2: null,
    timerSeconds: 0,
    isFinished: false,
  }));
}
