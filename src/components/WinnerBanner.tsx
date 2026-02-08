import { Team } from '@/lib/types';
import { Trophy } from 'lucide-react';

interface Props {
  winner: Team;
}

export function WinnerBanner({ winner }: Props) {
  return (
    <section className="animate-fade-in">
      <div className="gradient-trophy rounded-2xl p-8 text-center animate-winner-glow">
        <Trophy className="h-12 w-12 mx-auto mb-3 text-primary-foreground" />
        <h2 className="text-3xl font-extrabold text-primary-foreground mb-2">
          🎉 CAMPEÃO DO DIA! 🎉
        </h2>
        <p className="text-2xl font-bold text-primary-foreground mb-3">{winner.name}</p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {winner.players.map(p => (
            <span
              key={p.id}
              className="bg-primary-foreground/20 backdrop-blur-sm text-primary-foreground px-4 py-1.5 rounded-full font-semibold text-sm"
            >
              {p.isCaptain && '★ '}{p.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
