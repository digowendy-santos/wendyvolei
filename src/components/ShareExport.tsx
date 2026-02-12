import { Share2, Download, MessageCircle, Trophy, BarChart3, FileText } from 'lucide-react';
import { Standing, Team, Match, AnnualRankingEntry, GameFormat, FORMAT_LABELS } from '@/lib/types';
import jsPDF from 'jspdf';

interface Props {
  currentDate: string;
  teams: Team[];
  matches: Match[];
  standings: Standing[];
  annualRanking: AnnualRankingEntry[];
  format: GameFormat;
  phase: 'setup' | 'playing' | 'finished';
}

type ShareMode = 'all' | 'standings' | 'ranking';

function fmt(dateStr: string) {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function clock(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ─── WhatsApp Text Builders ───────────────────────────────

function whatsappResults({ currentDate, teams, matches, standings, format }: Props): string {
  const lines: string[] = [
    `🏐 *ARENA BEACH VOLLEY*`,
    `📅 ${fmt(currentDate)} • ${FORMAT_LABELS[format]}s`,
    '',
    '🏆 *TIMES*',
    ...teams.map(t =>
      `  ${t.name}: ${t.players.map(p => p.isCaptain ? `★${p.name}` : p.name).join(', ')}`
    ),
    '',
    '⚔️ *JOGOS*',
    ...matches.map((m, i) => {
      const t1 = teams.find(t => t.id === m.team1Id)!;
      const t2 = teams.find(t => t.id === m.team2Id)!;
      const score = m.isFinished ? `${m.score1} x ${m.score2}` : '_ x _';
      const time = m.isFinished && m.timerSeconds > 0 ? ` ⏱${clock(m.timerSeconds)}` : '';
      return `  ${i + 1}. ${t1.name} ${score} ${t2.name}${time}`;
    }),
    '',
    '📊 *CLASSIFICAÇÃO*',
    ...standings.map((s, i) => {
      const pos = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}°`;
      return `  ${pos} ${s.teamName}  V${s.wins} D${s.losses}  SP:${s.pointsDiff > 0 ? '+' : ''}${s.pointsDiff}  (${s.winPercentage}%)`;
    }),
  ];
  return lines.join('\n');
}

function whatsappStandings({ currentDate, standings, format }: Props): string {
  return [
    `🏐 *CLASSIFICAÇÃO FINAL*`,
    `📅 ${fmt(currentDate)} • ${FORMAT_LABELS[format]}s`,
    '',
    ...standings.map((s, i) => {
      const pos = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}°`;
      return `${pos} ${s.teamName}  V${s.wins} D${s.losses}  SP:${s.pointsDiff > 0 ? '+' : ''}${s.pointsDiff}  (${s.winPercentage}%)`;
    }),
  ].join('\n');
}

function whatsappRanking(ranking: AnnualRankingEntry[]): string {
  const year = new Date().getFullYear();
  return [
    `🏐 *RANKING ANUAL ${year}*`,
    '',
    ...ranking.map((r, i) => {
      const pos = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}°`;
      return `${pos} ${r.playerName} — ${r.totalPoints} pts (${r.daysPlayed} dias)`;
    }),
    '',
    '_Pontuação: 1°=5  2°=3  3°=2  4°=1_',
  ].join('\n');
}

// ─── PDF Builder ──────────────────────────────────────────

function drawTableRow(doc: jsPDF, cols: { text: string; x: number; w: number; align?: 'center' | 'left' | 'right' }[], y: number) {
  cols.forEach(col => {
    const align = col.align || 'left';
    if (align === 'center') {
      doc.text(col.text, col.x + col.w / 2, y, { align: 'center' });
    } else if (align === 'right') {
      doc.text(col.text, col.x + col.w, y, { align: 'right' });
    } else {
      doc.text(col.text, col.x, y);
    }
  });
}

function generatePDF(props: Props, mode: ShareMode) {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();
  let y = 20;
  const marginL = 14;
  const contentW = pageW - 28;

  // Header bar
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(0, 0, pageW, 36, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('ARENA BEACH VOLLEY', pageW / 2, 16, { align: 'center' });
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  const subtitle = mode === 'ranking'
    ? `Ranking Anual ${new Date().getFullYear()}`
    : `${fmt(props.currentDate)} • ${FORMAT_LABELS[props.format]}s`;
  doc.text(subtitle, pageW / 2, 28, { align: 'center' });

  doc.setTextColor(30, 41, 59);
  y = 48;

  if (mode === 'all' || mode === 'standings') {
    // ── Classification Table ──
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('CLASSIFICAÇÃO', marginL, y);
    y += 8;

    // Table header
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(marginL, y - 5, contentW, 8, 'F');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    const stCols = [
      { text: '#', x: marginL + 2, w: 10, align: 'center' as const },
      { text: 'TIME', x: marginL + 14, w: 50, align: 'left' as const },
      { text: 'V', x: marginL + 70, w: 15, align: 'center' as const },
      { text: 'D', x: marginL + 88, w: 15, align: 'center' as const },
      { text: 'PM', x: marginL + 106, w: 18, align: 'center' as const },
      { text: 'PS', x: marginL + 126, w: 18, align: 'center' as const },
      { text: 'SP', x: marginL + 146, w: 18, align: 'center' as const },
      { text: '%', x: marginL + 164, w: 16, align: 'center' as const },
    ];
    drawTableRow(doc, stCols, y);
    y += 7;

    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    props.standings.forEach((s, i) => {
      if (i % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(marginL, y - 4.5, contentW, 7, 'F');
      }
      const posLabel = i === 0 ? '1' : i === 1 ? '2' : i === 2 ? '3' : `${i + 1}`;
      drawTableRow(doc, [
        { text: posLabel, x: marginL + 2, w: 10, align: 'center' },
        { text: s.teamName, x: marginL + 14, w: 50, align: 'left' },
        { text: String(s.wins), x: marginL + 70, w: 15, align: 'center' },
        { text: String(s.losses), x: marginL + 88, w: 15, align: 'center' },
        { text: String(s.pointsFor), x: marginL + 106, w: 18, align: 'center' },
        { text: String(s.pointsAgainst), x: marginL + 126, w: 18, align: 'center' },
        { text: `${s.pointsDiff > 0 ? '+' : ''}${s.pointsDiff}`, x: marginL + 146, w: 18, align: 'center' },
        { text: `${s.winPercentage}%`, x: marginL + 164, w: 16, align: 'center' },
      ], y);
      y += 7;
    });
    y += 6;
  }

  if (mode === 'all') {
    // ── Matches ──
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(30, 41, 59);
    doc.text('JOGOS', marginL, y);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    props.matches.forEach((m, i) => {
      const t1 = props.teams.find(t => t.id === m.team1Id)!;
      const t2 = props.teams.find(t => t.id === m.team2Id)!;
      const score = m.isFinished ? `${m.score1} x ${m.score2}` : '_ x _';
      const time = m.isFinished && m.timerSeconds > 0 ? `  (${clock(m.timerSeconds)})` : '';
      doc.text(`${i + 1}. ${t1.name}  ${score}  ${t2.name}${time}`, marginL, y);
      y += 6;
    });
    y += 6;

    // ── Teams ──
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('TIMES', marginL, y);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    props.teams.forEach(t => {
      doc.text(`${t.name}: ${t.players.map(p => p.name).join(', ')}`, marginL, y);
      y += 6;
    });
  }

  if (mode === 'ranking') {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('RANKING', marginL, y);
    y += 8;

    doc.setFillColor(241, 245, 249);
    doc.rect(marginL, y - 5, contentW, 8, 'F');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    drawTableRow(doc, [
      { text: '#', x: marginL + 2, w: 10, align: 'center' },
      { text: 'JOGADOR', x: marginL + 14, w: 80, align: 'left' },
      { text: 'PTS', x: marginL + 100, w: 20, align: 'center' },
      { text: 'DIAS', x: marginL + 125, w: 20, align: 'center' },
    ], y);
    y += 7;

    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    props.annualRanking.forEach((r, i) => {
      if (i % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(marginL, y - 4.5, contentW, 7, 'F');
      }
      drawTableRow(doc, [
        { text: `${i + 1}`, x: marginL + 2, w: 10, align: 'center' },
        { text: r.playerName, x: marginL + 14, w: 80, align: 'left' },
        { text: String(r.totalPoints), x: marginL + 100, w: 20, align: 'center' },
        { text: String(r.daysPlayed), x: marginL + 125, w: 20, align: 'center' },
      ], y);
      y += 7;
    });

    y += 4;
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Pontuacao: 1o=5pts  2o=3pts  3o=2pts  4o=1pt', marginL, y);
  }

  // Footer
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Arena Beach Volley', pageW / 2, pageH - 10, { align: 'center' });

  const titles: Record<ShareMode, string> = {
    all: `resultados-${props.currentDate}`,
    standings: `classificacao-${props.currentDate}`,
    ranking: `ranking-anual-${new Date().getFullYear()}`,
  };
  doc.save(`${titles[mode]}.pdf`);
}

// ─── Share Helpers ────────────────────────────────────────

function openWhatsApp(text: string) {
  window.location.href = `https://wa.me/?text=${encodeURIComponent(text)}`;
}

// ─── Component ────────────────────────────────────────────

export function ShareExport(props: Props) {
  const { teams, annualRanking, phase } = props;
  const hasResults = teams.length > 0;
  const hasRanking = annualRanking.length > 0;

  if (!hasResults && !hasRanking) return null;

  const share = (mode: ShareMode, method: 'whatsapp' | 'pdf') => {
    if (method === 'pdf') {
      generatePDF(props, mode);
      return;
    }
    const textFn: Record<ShareMode, () => string> = {
      all: () => whatsappResults(props),
      standings: () => whatsappStandings(props),
      ranking: () => whatsappRanking(annualRanking),
    };
    openWhatsApp(textFn[mode]());
  };

  const cards: { mode: ShareMode; icon: typeof FileText; label: string; show: boolean }[] = [
    { mode: 'all', icon: FileText, label: 'Resultados do Dia', show: hasResults },
    { mode: 'standings', icon: BarChart3, label: 'Classificação Final', show: hasResults && phase === 'finished' },
    { mode: 'ranking', icon: Trophy, label: 'Ranking Anual', show: hasRanking },
  ];

  return (
    <section className="section-card animate-fade-in">
      <div className="section-title">
        <Share2 className="h-6 w-6 text-primary" />
        <h2>Compartilhar</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {cards.filter(c => c.show).map(({ mode, icon: Icon, label }) => (
          <div key={mode} className="bg-secondary/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
              <Icon className="h-4 w-4 text-primary" />
              {label}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => share(mode, 'whatsapp')}
                className="flex-1 flex items-center justify-center gap-1.5 bg-[hsl(142,70%,40%)] text-white text-xs font-semibold px-3 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                WhatsApp
              </button>
              <button
                onClick={() => share(mode, 'pdf')}
                className="flex-1 flex items-center justify-center gap-1.5 bg-secondary text-secondary-foreground text-xs font-semibold px-3 py-2 rounded-lg hover:bg-muted transition-colors border border-border"
              >
                <Download className="h-3.5 w-3.5" />
                PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
