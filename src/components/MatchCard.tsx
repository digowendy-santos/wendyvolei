import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Check } from 'lucide-react';
import { Match, Team } from '@/lib/types';
import { useTimer } from '@/hooks/useTimer';

interface Props {
  match: Match;
  team1: Team;
  team2: Team;
  onScoreUpdate: (matchId: number, s1: number | null, s2: number | null) => void;
  onFinish: (matchId: number, timerSeconds: number) => void;
}

export function MatchCard({ match, team1, team2, onScoreUpdate, onFinish }: Props) {
  const { seconds, isRunning, start, stop, reset, formatTime } = useTimer(match.timerSeconds);
  const [s1, setS1] = useState(match.score1?.toString() ?? '');
  const [s2, setS2] = useState(match.score2?.toString() ?? '');

  useEffect(() => {
    setS1(match.score1?.toString() ?? '');
    setS2(match.score2?.toString() ?? '');
  }, [match.score1, match.score2]);

  const handleScoreChange = (side: 1 | 2, val: string) => {
    const num = val === '' ? null : parseInt(val, 10);
    if (val !== '' && isNaN(num!)) return;
    if (side === 1) {
      setS1(val);
      onScoreUpdate(match.id, num, s2 === '' ? null : parseInt(s2, 10));
    } else {
      setS2(val);
      onScoreUpdate(match.id, s1 === '' ? null : parseInt(s1, 10), num);
    }
  };

  const canFinish = s1 !== '' && s2 !== '' && !match.isFinished;

  const handleFinish = () => {
    if (canFinish) {
      stop();
      onFinish(match.id, seconds);
    }
  };

  return (
    <div className={`bg-secondary/40 border border-border rounded-xl p-4 transition-all ${match.isFinished ? 'match-finished' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Jogo {match.id}
        </span>
        {match.isFinished && (
          <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded-full font-semibold">
            Finalizado
          </span>
        )}
      </div>

      {/* Score */}
      <div className="flex items-center justify-center gap-3 mb-3">
        <div className="flex-1 text-right">
          <p className="font-bold text-foreground text-sm truncate">{team1.name}</p>
          <p className="text-xs text-muted-foreground truncate">
            {team1.players.map(p => p.name).join(', ')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            value={s1}
            onChange={(e) => handleScoreChange(1, e.target.value)}
            disabled={match.isFinished}
            className="w-12 h-10 text-center bg-card border border-border rounded-lg text-foreground font-bold text-lg outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
          />
          <span className="text-muted-foreground font-bold">×</span>
          <input
            type="number"
            min="0"
            value={s2}
            onChange={(e) => handleScoreChange(2, e.target.value)}
            disabled={match.isFinished}
            className="w-12 h-10 text-center bg-card border border-border rounded-lg text-foreground font-bold text-lg outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
          />
        </div>
        <div className="flex-1">
          <p className="font-bold text-foreground text-sm truncate">{team2.name}</p>
          <p className="text-xs text-muted-foreground truncate">
            {team2.players.map(p => p.name).join(', ')}
          </p>
        </div>
      </div>

      {/* Timer & Actions */}
      <div className="flex items-center justify-center gap-3">
        <span className="font-mono text-lg text-foreground tabular-nums">
          ⏱ {formatTime(seconds)}
        </span>
        {!match.isFinished && (
          <>
            <button
              onClick={isRunning ? stop : start}
              className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button
              onClick={reset}
              className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleFinish}
              disabled={!canFinish}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-success/20 text-success font-semibold text-xs hover:bg-success/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Check className="h-3.5 w-3.5" />
              Finalizar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
