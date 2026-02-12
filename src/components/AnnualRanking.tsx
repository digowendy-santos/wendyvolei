import { AnnualRankingEntry } from '@/lib/types';
import { Medal } from 'lucide-react';

interface Props {
  ranking: AnnualRankingEntry[];
}

const medals = ['🥇', '🥈', '🥉'];

export function AnnualRanking({ ranking }: Props) {
  return (
    <section className="section-card animate-fade-in">
      <div className="section-title">
        <Medal className="h-6 w-6 text-trophy" />
        <h2>Ranking Anual {new Date().getFullYear()}</h2>
      </div>
      {ranking.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-4">
          Nenhum dia finalizado ainda. Complete todos os jogos de um dia para pontuar no ranking.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="text-left py-2 px-2 w-8">#</th>
                  <th className="text-left py-2 px-2">Jogador</th>
                  <th className="text-center py-2 px-2">Pts</th>
                  <th className="text-center py-2 px-2">Dias</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((r, i) => {
                  // Determine medal: only assign next medal when points drop
                  let medalIndex = 0;
                  for (let j = 0; j < i; j++) {
                    if (ranking[j].totalPoints > ranking[j + 1 > i ? i : j + 1].totalPoints) {
                      medalIndex++;
                    }
                  }
                  // Simpler: count distinct higher point values
                  const distinctHigher = new Set(ranking.slice(0, i).map(x => x.totalPoints).filter(p => p > r.totalPoints)).size;
                  const rank = distinctHigher;
                  const label = rank < 3 ? medals[rank] : i + 1;

                  return (
                  <tr key={r.playerName} className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="py-2.5 px-2 font-bold text-muted-foreground">
                      {label}
                    </td>
                    <td className="py-2.5 px-2 font-semibold text-foreground">{r.playerName}</td>
                    <td className="text-center py-2.5 px-2 font-bold text-primary">{r.totalPoints}</td>
                    <td className="text-center py-2.5 px-2 text-secondary-foreground">{r.daysPlayed}</td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Pontuação: 1° lugar = 5 pts • 2° = 3 pts • 3° = 2 pts • 4° = 1 pt
          </p>
        </>
      )}
    </section>
  );
}