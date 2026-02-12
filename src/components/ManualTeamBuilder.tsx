import { useState } from 'react';
import { Player, GameFormat, TEAM_SIZES } from '@/lib/types';
import { Users, ChevronRight, Check } from 'lucide-react';

interface Props {
  players: Player[];
  format: GameFormat;
  onConfirm: (assignments: Player[][]) => void;
  onCancel: () => void;
}

export function ManualTeamBuilder({ players, format, onConfirm, onCancel }: Props) {
  const teamSize = TEAM_SIZES[format];
  const numTeams = Math.floor(players.length / teamSize);
  const [assignments, setAssignments] = useState<Player[][]>(
    () => Array.from({ length: numTeams }, () => [])
  );
  const [currentTeam, setCurrentTeam] = useState(0);

  const assigned = new Set(assignments.flat().map(p => p.id));
  const available = players.filter(p => !assigned.has(p.id));
  const isComplete = assignments.every(t => t.length === teamSize);

  const assignPlayer = (player: Player) => {
    if (assignments[currentTeam].length >= teamSize) return;
    setAssignments(prev => {
      const next = prev.map((t, i) => i === currentTeam ? [...t, player] : t);
      // Auto-advance to next incomplete team
      if (next[currentTeam].length === teamSize) {
        const nextIncomplete = next.findIndex(t => t.length < teamSize);
        if (nextIncomplete !== -1) setCurrentTeam(nextIncomplete);
      }
      return next;
    });
  };

  const removeFromTeam = (teamIdx: number, playerId: string) => {
    setAssignments(prev =>
      prev.map((t, i) => i === teamIdx ? t.filter(p => p.id !== playerId) : t)
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Formação Manual dos Times
        </h3>
        <button onClick={onCancel} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          Cancelar
        </button>
      </div>

      {/* Team slots */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {assignments.map((team, i) => (
          <button
            key={i}
            onClick={() => setCurrentTeam(i)}
            className={`text-left border rounded-xl p-3 transition-all ${
              i === currentTeam
                ? 'border-primary bg-primary/10'
                : team.length === teamSize
                ? 'border-success/30 bg-success/5'
                : 'border-border bg-secondary/40 hover:border-primary/30'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <Users className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-bold text-foreground">Time {i + 1}</span>
              <span className="text-xs text-muted-foreground ml-auto">{team.length}/{teamSize}</span>
            </div>
            <ul className="space-y-0.5">
              {team.map(p => (
                <li key={p.id} className="text-xs text-secondary-foreground flex items-center justify-between">
                  <span className="truncate">
                    {p.isCaptain && <span className="text-trophy mr-0.5">★</span>}
                    {p.name}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFromTeam(i, p.id); }}
                    className="text-muted-foreground/40 hover:text-destructive ml-1"
                  >
                    ✕
                  </button>
                </li>
              ))}
              {Array.from({ length: teamSize - team.length }).map((_, j) => (
                <li key={`empty-${j}`} className="text-xs text-muted-foreground/30 italic">vago</li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      {/* Available players */}
      {available.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">
            <ChevronRight className="h-3 w-3 inline" /> Selecione para o <span className="text-primary font-semibold">Time {currentTeam + 1}</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {available.map(p => (
              <button
                key={p.id}
                onClick={() => assignPlayer(p)}
                disabled={assignments[currentTeam].length >= teamSize}
                className="text-xs bg-secondary hover:bg-primary/20 text-secondary-foreground hover:text-primary px-3 py-1.5 rounded-md transition-colors border border-transparent hover:border-primary/30 disabled:opacity-30"
              >
                {p.isCaptain && <span className="text-trophy mr-1">★</span>}
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Confirm */}
      <button
        onClick={() => onConfirm(assignments)}
        disabled={!isComplete}
        className="w-full bg-success/20 text-success py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-success/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Check className="h-5 w-5" />
        CONFIRMAR TIMES
      </button>
    </div>
  );
}
