import { useState } from 'react';
import { Plus, Star, X, Shuffle, Users } from 'lucide-react';
import { Player, GameFormat, RoundType, FORMAT_LABELS, TEAM_SIZES } from '@/lib/types';

interface Props {
  players: Player[];
  format: GameFormat;
  roundType: RoundType;
  playerHall: string[];
  canDraw: boolean;
  validationMessage: string | null;
  phase: 'setup' | 'playing' | 'finished';
  onAddPlayer: (name: string) => void;
  onRemovePlayer: (id: string) => void;
  onToggleCaptain: (id: string) => void;
  onSetFormat: (f: GameFormat) => void;
  onSetRoundType: (r: RoundType) => void;
  onDraw: () => void;
  onAddFromHall: (name: string) => void;
  onRemoveFromHall: (name: string) => void;
}

export function PlayerRegistration({
  players, format, roundType, playerHall, canDraw, validationMessage, phase,
  onAddPlayer, onRemovePlayer, onToggleCaptain, onSetFormat, onSetRoundType,
  onDraw, onAddFromHall, onRemoveFromHall,
}: Props) {
  const [name, setName] = useState('');

  const handleAdd = () => {
    if (name.trim()) {
      onAddPlayer(name);
      setName('');
    }
  };

  if (phase !== 'setup') {
    return (
      <section className="section-card animate-fade-in">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">
              {players.length} jogadores • {FORMAT_LABELS[format]}s • {roundType === 'turno' ? 'Turno' : 'Turno e Returno'}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {players.map(p => (
              <span key={p.id} className="text-xs bg-secondary px-2 py-1 rounded-md text-secondary-foreground">
                {p.isCaptain && <span className="text-trophy mr-1">★</span>}
                {p.name}
              </span>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const formats: GameFormat[] = ['duplas', 'trios', 'quartetos'];
  const hallAvailable = playerHall.filter(n => !players.some(p => p.name.toLowerCase() === n.toLowerCase()));

  return (
    <section className="section-card animate-fade-in">
      <div className="section-title">
        <span className="text-2xl">⚡</span>
        <h2>Escalação do Dia</h2>
      </div>

      {/* Add player */}
      <div className="flex gap-2 mb-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Nome do jogador"
          maxLength={30}
          className="flex-1 bg-secondary border border-border rounded-lg px-4 py-2.5 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        />
        <button
          onClick={handleAdd}
          disabled={!name.trim() || players.length >= 16}
          className="gradient-primary text-primary-foreground px-4 py-2.5 rounded-lg font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
          Adicionar
        </button>
      </div>

      {/* Hall */}
      {hallAvailable.length > 0 && (
        <div className="mb-5">
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Jogadores Frequentes</p>
          <div className="flex flex-wrap gap-1.5">
            {hallAvailable.map(n => (
              <button
                key={n}
                onClick={() => onAddFromHall(n)}
                className="text-xs bg-secondary hover:bg-primary/20 text-secondary-foreground hover:text-primary px-2.5 py-1 rounded-md transition-colors border border-transparent hover:border-primary/30"
              >
                + {n}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Format selection */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex gap-2">
          {formats.map(f => (
            <button
              key={f}
              onClick={() => onSetFormat(f)}
              className={`btn-format ${f === format ? 'btn-format-active' : 'btn-format-inactive'}`}
            >
              {FORMAT_LABELS[f]}s
            </button>
          ))}
        </div>
        <div className="h-8 w-px bg-border mx-1 hidden sm:block" />
        <div className="flex gap-2">
          <button
            onClick={() => onSetRoundType('turno')}
            className={`btn-format ${roundType === 'turno' ? 'btn-format-active' : 'btn-format-inactive'}`}
          >
            Turno
          </button>
          <button
            onClick={() => onSetRoundType('turno-returno')}
            className={`btn-format ${roundType === 'turno-returno' ? 'btn-format-active' : 'btn-format-inactive'}`}
          >
            Turno e Returno
          </button>
        </div>
      </div>

      {/* Player list */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Jogadores ({players.length}/16)
          </h3>
          {players.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {Math.floor(players.length / TEAM_SIZES[format])} {FORMAT_LABELS[format].toLowerCase()}(s)
            </span>
          )}
        </div>
        {players.length === 0 ? (
          <p className="text-muted-foreground text-sm py-4 text-center">Adicione jogadores para começar</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {players.map((p, i) => (
              <div
                key={p.id}
                className="flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-2 group hover:bg-secondary transition-colors"
              >
                <span className="text-xs text-muted-foreground w-5">{i + 1}</span>
                <button
                  onClick={() => onToggleCaptain(p.id)}
                  className={`transition-colors ${p.isCaptain ? 'text-trophy' : 'text-muted-foreground/30 hover:text-trophy/60'}`}
                  title={p.isCaptain ? 'Remover capitão' : 'Tornar capitão'}
                >
                  <Star className="h-4 w-4" fill={p.isCaptain ? 'currentColor' : 'none'} />
                </button>
                <span className="flex-1 text-foreground text-sm font-medium">{p.name}</span>
                <button
                  onClick={() => onRemovePlayer(p.id)}
                  className="text-muted-foreground/40 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Validation */}
      {validationMessage && players.length > 0 && (
        <p className="text-sm text-accent mb-4">{validationMessage}</p>
      )}

      {/* Draw button */}
      <button
        onClick={onDraw}
        disabled={!canDraw}
        className="w-full gradient-primary text-primary-foreground py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Shuffle className="h-5 w-5" />
        SORTEAR TIMES
      </button>
    </section>
  );
}
