import { GameDay } from '@/lib/types';
import { CalendarDays as CalIcon } from 'lucide-react';

interface Props {
  savedDays: GameDay[];
  currentDate: string;
  onSelectDate: (date: string) => void;
}

export function CalendarDays({ savedDays, currentDate, onSelectDate }: Props) {
  const sorted = [...savedDays]
    .filter(d => d.teams.length > 0)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (sorted.length === 0) return null;

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  return (
    <section className="section-card animate-fade-in">
      <div className="section-title">
        <CalIcon className="h-6 w-6 text-primary" />
        <h2>Calendário</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {sorted.map(day => {
          const allDone = day.matches.every(m => m.isFinished);
          const isActive = day.date === currentDate;
          return (
            <button
              key={day.date}
              onClick={() => onSelectDate(day.date)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-secondary text-secondary-foreground border-border hover:border-primary/40'
              }`}
            >
              <span className="block">{formatDate(day.date)}</span>
              <span className="block text-xs opacity-70">
                {day.teams.length} times • {allDone ? '✓' : `${day.matches.filter(m => m.isFinished).length}/${day.matches.length}`}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
