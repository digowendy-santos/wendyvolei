import { Calendar, RotateCcw } from 'lucide-react';
interface HeaderProps {
  currentDate: string;
  onDateChange: (date: string) => void;
  onReset: () => void;
  hasTeams: boolean;
}
export function Header({
  currentDate,
  onDateChange,
  onReset,
  hasTeams
}: HeaderProps) {
  return <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🏐</span>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Rodrigo <span className="text-primary">Beach Volley</span></h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <input type="date" value={currentDate} onChange={e => onDateChange(e.target.value)} className="bg-transparent text-foreground text-sm outline-none" />
          </div>
          {hasTeams && <button onClick={() => {
          if (confirm('Resetar todos os dados do dia?')) onReset();
        }} className="flex items-center gap-1.5 text-sm text-destructive hover:text-destructive/80 transition-colors px-3 py-2 rounded-lg hover:bg-destructive/10">
              <RotateCcw className="h-3.5 w-3.5" />
              Resetar
            </button>}
        </div>
      </div>
    </header>;
}
