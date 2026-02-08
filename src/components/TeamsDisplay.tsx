import { Team } from '@/lib/types';
import { Users } from 'lucide-react';

interface Props {
  teams: Team[];
}

export function TeamsDisplay({ teams }: Props) {
  return (
    <section className="section-card animate-fade-in">
      <div className="section-title">
        <span className="text-2xl">🏆</span>
        <h2>Times Sorteados</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {teams.map((team, i) => (
          <div
            key={team.id}
            className="bg-secondary/60 border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-primary" />
              <h3 className="font-bold text-foreground text-sm">{team.name}</h3>
            </div>
            <ul className="space-y-1">
              {team.players.map(p => (
                <li key={p.id} className="text-sm text-secondary-foreground flex items-center gap-1.5">
                  {p.isCaptain && <span className="text-trophy text-xs">★</span>}
                  {p.name}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
