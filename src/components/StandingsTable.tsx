import { Standing } from '@/lib/types';

interface Props {
  standings: Standing[];
}

export function StandingsTable({ standings }: Props) {
  return (
    <section className="section-card animate-fade-in">
      <div className="section-title">
        <span className="text-2xl">📊</span>
        <h2>Classificação</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
              <th className="text-left py-2 px-2 w-8">#</th>
              <th className="text-left py-2 px-2">Time</th>
              <th className="text-center py-2 px-2">J</th>
              <th className="text-center py-2 px-2">V</th>
              <th className="text-center py-2 px-2">D</th>
              <th className="text-center py-2 px-2">PM</th>
              <th className="text-center py-2 px-2">PS</th>
              <th className="text-center py-2 px-2">SP</th>
              <th className="text-center py-2 px-2">Aprov.</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s, i) => (
              <tr
                key={s.teamId}
                className={`border-b border-border/50 transition-colors ${i === 0 && s.wins > 0 ? 'bg-primary/5' : 'hover:bg-secondary/30'}`}
              >
                <td className="py-2.5 px-2 font-bold text-muted-foreground">{i + 1}</td>
                <td className="py-2.5 px-2 font-semibold text-foreground">
                  {i === 0 && s.wins > 0 && <span className="text-trophy mr-1">👑</span>}
                  {s.teamName}
                </td>
                <td className="text-center py-2.5 px-2 text-secondary-foreground">{s.played}</td>
                <td className="text-center py-2.5 px-2 font-semibold text-success">{s.wins}</td>
                <td className="text-center py-2.5 px-2 text-destructive">{s.losses}</td>
                <td className="text-center py-2.5 px-2 text-secondary-foreground">{s.pointsFor}</td>
                <td className="text-center py-2.5 px-2 text-secondary-foreground">{s.pointsAgainst}</td>
                <td className="text-center py-2.5 px-2 font-semibold" style={{ color: s.pointsDiff >= 0 ? 'hsl(var(--success))' : 'hsl(var(--destructive))' }}>
                  {s.pointsDiff > 0 ? '+' : ''}{s.pointsDiff}
                </td>
                <td className="text-center py-2.5 px-2 font-bold text-primary">{s.winPercentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
