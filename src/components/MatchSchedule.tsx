import { Match, Team } from '@/lib/types';
import { MatchCard } from './MatchCard';

interface Props {
  matches: Match[];
  teams: Team[];
  onScoreUpdate: (matchId: number, s1: number | null, s2: number | null) => void;
  onFinish: (matchId: number, timerSeconds: number) => void;
}

export function MatchSchedule({ matches, teams, onScoreUpdate, onFinish }: Props) {
  const getTeam = (id: string) => teams.find(t => t.id === id)!;
  const finished = matches.filter(m => m.isFinished).length;

  return (
    <section className="section-card animate-fade-in">
      <div className="section-title">
        <span className="text-2xl">⚔️</span>
        <h2>Jogos do Dia</h2>
        <span className="text-sm text-muted-foreground ml-auto">
          {finished}/{matches.length} jogos finalizados
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {matches.map(m => (
          <MatchCard
            key={m.id}
            match={m}
            team1={getTeam(m.team1Id)}
            team2={getTeam(m.team2Id)}
            onScoreUpdate={onScoreUpdate}
            onFinish={onFinish}
          />
        ))}
      </div>
    </section>
  );
}
