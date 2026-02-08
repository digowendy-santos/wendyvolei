export type GameFormat = 'duplas' | 'trios' | 'quartetos';
export type RoundType = 'turno' | 'turno-returno';

export interface Player {
  id: string;
  name: string;
  isCaptain: boolean;
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
}

export interface Match {
  id: number;
  team1Id: string;
  team2Id: string;
  score1: number | null;
  score2: number | null;
  timerSeconds: number;
  isFinished: boolean;
}

export interface Standing {
  teamId: string;
  teamName: string;
  played: number;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  pointsDiff: number;
  winPercentage: number;
}

export interface GameDay {
  date: string;
  players: Player[];
  format: GameFormat;
  roundType: RoundType;
  teams: Team[];
  matches: Match[];
}

export interface AnnualRankingEntry {
  playerName: string;
  totalPoints: number;
  daysPlayed: number;
}

export const FORMAT_LABELS: Record<GameFormat, string> = {
  duplas: 'Dupla',
  trios: 'Trio',
  quartetos: 'Quarteto',
};

export const TEAM_SIZES: Record<GameFormat, number> = {
  duplas: 2,
  trios: 3,
  quartetos: 4,
};

export const RANKING_POINTS = [5, 3, 2, 1];
