import { useState } from 'react';
import { Plus, Star, X, Shuffle, Users, Trash2, Hand, ClipboardPaste } from 'lucide-react';
import { ManualTeamBuilder } from './ManualTeamBuilder';
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
  onFormManually: (assignments: Player[][]) => void;
  onAddFromHall: (name: string) => void;
  onRemoveFromHall: (name: string) => void;
  onClearHall: () => void;
}

export function PlayerRegistration({
  players, format, roundType, playerHall, canDraw, validationMessage, phase,
  onAddPlayer, onRemovePlayer, onToggleCaptain, onSetFormat, onSetRoundType,
  onDraw, onFormManually, onAddFromHall, onRemoveFromHall, onClearHall,
}: Props) {
  const [name, setName] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [bulkText, setBulkText] = useState('');

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

      {/* Bulk paste */}
      {!showBulk ? (
        <button
          onClick={() => setShowBulk(true)}
          className="mb-4 text-sm text-primary hover:text-primary/80 flex items-center gap-1.5 transition-colors"
        >
          <ClipboardPaste className="h-4 w-4" />
          Colar lista de jogadores
        </button>
      ) : (
        <div className="mb-4 space-y-2">
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder={"Cole a lista aqui (um nome por linha):\nJoão\nMaria\nPedro"}
            rows={5}
            className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                const names = bulkText
                  .split(/[\n,;]+/)
                  .map(n => n.replace(/^\d+[\.\)\-\s]*/, '').trim())
                  .filter(n => n.length > 0 && n.length <= 30);
                names.forEach(n => onAddPlayer(n));
                setBulkText('');
                setShowBulk(false);
              }}
              disabled={!bulkText.trim()}
              className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              Adicionar todos
            </button>
            <button
              onClick={() => { setBulkText(''); setShowBulk(false); }}
              className="bg-secondary border border-border text-foreground px-4 py-2 rounded-lg text-sm hover:bg-secondary/80 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Hall */}
      {playerHall.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Jogadores Frequentes ({playerHall.length})</p>
            <button
              onClick={() => { if (confirm('Apagar todos os jogadores frequentes?')) onClearHall(); }}
              className="text-xs text-destructive hover:text-destructive/80 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="h-3 w-3" />
              Limpar todos
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {playerHall.map(n => {
              const isInList = players.some(p => p.name.toLowerCase() === n.toLowerCase());
              return (
                <div key={n} className="flex items-center gap-0.5">
                  {!isInList ? (
                    <button
                      onClick={() => onAddFromHall(n)}
                      className="text-xs bg-secondary hover:bg-primary/20 text-secondary-foreground hover:text-primary px-2.5 py-1 rounded-l-md transition-colors border border-transparent hover:border-primary/30"
                    >
                      + {n}
                    </button>
                  ) : (
                    <span className="text-xs bg-primary/15 text-primary px-2.5 py-1 rounded-l-md border border-primary/20">
                      ✓ {n}
                    </span>
                  )}
                  <button
                    onClick={() => { if (confirm(`Remover "${n}" dos frequentes?`)) onRemoveFromHall(n); }}
                    className="text-xs bg-secondary hover:bg-destructive/20 text-muted-foreground hover:text-destructive px-1.5 py-1 rounded-r-md transition-colors border-l border-border"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
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

      {/* Manual builder */}
      {showManual && canDraw ? (
        <ManualTeamBuilder
          players={players}
          format={format}
          onConfirm={(assignments) => {
            onFormManually(assignments);
            setShowManual(false);
          }}
          onCancel={() => setShowManual(false)}
        />
      ) : (
        <>
          {/* Draw button */}
          <button
            onClick={onDraw}
            disabled={!canDraw}
            className="w-full gradient-primary text-primary-foreground py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Shuffle className="h-5 w-5" />
            SORTEAR TIMES
          </button>

          {/* Manual button */}
          <button
            onClick={() => setShowManual(true)}
            disabled={!canDraw}
            className="w-full mt-2 bg-secondary border border-border text-foreground py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-secondary/80 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Hand className="h-5 w-5" />
            FORMAR TIMES MANUALMENTE
          </button>
        </>
      )}
    </section>
  );
}
