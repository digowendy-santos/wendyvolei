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

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function buildResultsText(props: Props): string {
  const { currentDate, teams, matches, standings, format } = props;
  const lines: string[] = [];
  lines.push(`🏐 *ARENA BEACH VOLLEY*`);
  lines.push(`📅 ${formatDate(currentDate)}`);
  lines.push(`📋 Formato: ${FORMAT_LABELS[format]}s`);
  lines.push('');

  // Teams
  lines.push('*🏆 TIMES*');
  teams.forEach(t => {
    lines.push(`${t.name}: ${t.players.map(p => p.isCaptain ? `★${p.name}` : p.name).join(', ')}`);
  });
  lines.push('');

  // Matches
  lines.push('*⚔️ JOGOS*');
  matches.forEach((m, i) => {
    const t1 = teams.find(t => t.id === m.team1Id)!;
    const t2 = teams.find(t => t.id === m.team2Id)!;
    const score = m.isFinished ? `${m.score1} x ${m.score2}` : '_ x _';
    const time = m.isFinished && m.timerSeconds > 0 ? ` (${formatTime(m.timerSeconds)})` : '';
    lines.push(`${i + 1}. ${t1.name} ${score} ${t2.name}${time}`);
  });
  lines.push('');

  // Standings
  lines.push('*📊 CLASSIFICAÇÃO*');
  standings.forEach((s, i) => {
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
    lines.push(`${medal} ${s.teamName} | V:${s.wins} D:${s.losses} | PM:${s.pointsFor} PS:${s.pointsAgainst} SP:${s.pointsDiff > 0 ? '+' : ''}${s.pointsDiff} | ${s.winPercentage}%`);
  });

  return lines.join('\n');
}

function buildStandingsText(props: Props): string {
  const { currentDate, standings, format } = props;
  const lines: string[] = [];
  lines.push(`🏐 *CLASSIFICAÇÃO FINAL*`);
  lines.push(`📅 ${formatDate(currentDate)} • ${FORMAT_LABELS[format]}s`);
  lines.push('');
  standings.forEach((s, i) => {
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
    lines.push(`${medal} ${s.teamName} | V:${s.wins} D:${s.losses} | SP:${s.pointsDiff > 0 ? '+' : ''}${s.pointsDiff} | ${s.winPercentage}%`);
  });
  return lines.join('\n');
}

function buildRankingText(ranking: AnnualRankingEntry[]): string {
  const lines: string[] = [];
  const year = new Date().getFullYear();
  lines.push(`🏐 *RANKING ANUAL ${year}*`);
  lines.push('');
  ranking.forEach((r, i) => {
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
    lines.push(`${medal} ${r.playerName} — ${r.totalPoints} pts (${r.daysPlayed} dias)`);
  });
  lines.push('');
  lines.push('Pontuação: 1°=5pts • 2°=3pts • 3°=2pts • 4°=1pt');
  return lines.join('\n');
}

function generatePDF(text: string, title: string) {
  const doc = new jsPDF();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(title, 14, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  const cleanText = text.replace(/\*/g, '').replace(/[🏐📅📋🏆⚔️📊🥇🥈🥉★]/g, '').trim();
  const lines = doc.splitTextToSize(cleanText, 180);
  doc.text(lines, 14, 32);

  doc.save(`${title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
}

function shareWhatsApp(text: string) {
  const encoded = encodeURIComponent(text);
  window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
}

export function ShareExport(props: Props) {
  const { teams, annualRanking, phase } = props;

  const hasResults = teams.length > 0;
  const hasRanking = annualRanking.length > 0;

  if (!hasResults && !hasRanking) return null;

  const handleShare = (mode: ShareMode, method: 'whatsapp' | 'pdf') => {
    let text = '';
    let title = '';

    switch (mode) {
      case 'all':
        text = buildResultsText(props);
        title = `Resultados ${formatDate(props.currentDate)}`;
        break;
      case 'standings':
        text = buildStandingsText(props);
        title = `Classificação ${formatDate(props.currentDate)}`;
        break;
      case 'ranking':
        text = buildRankingText(annualRanking);
        title = `Ranking Anual ${new Date().getFullYear()}`;
        break;
    }

    if (method === 'whatsapp') {
      shareWhatsApp(text);
    } else {
      generatePDF(text, title);
    }
    // done
  };

  return (
    <section className="section-card animate-fade-in">
      <div className="section-title">
        <Share2 className="h-6 w-6 text-primary" />
        <h2>Compartilhar</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* All Results */}
        {hasResults && (
          <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
              <FileText className="h-4 w-4 text-primary" />
              Resultados do Dia
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleShare('all', 'whatsapp')}
                className="flex-1 flex items-center justify-center gap-1.5 bg-[hsl(142,70%,40%)] text-white text-xs font-semibold px-3 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                WhatsApp
              </button>
              <button
                onClick={() => handleShare('all', 'pdf')}
                className="flex-1 flex items-center justify-center gap-1.5 bg-secondary text-secondary-foreground text-xs font-semibold px-3 py-2 rounded-lg hover:bg-muted transition-colors border border-border"
              >
                <Download className="h-3.5 w-3.5" />
                PDF
              </button>
            </div>
          </div>
        )}

        {/* Standings Only */}
        {hasResults && phase === 'finished' && (
          <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
              <BarChart3 className="h-4 w-4 text-primary" />
              Classificação Final
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleShare('standings', 'whatsapp')}
                className="flex-1 flex items-center justify-center gap-1.5 bg-[hsl(142,70%,40%)] text-white text-xs font-semibold px-3 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                WhatsApp
              </button>
              <button
                onClick={() => handleShare('standings', 'pdf')}
                className="flex-1 flex items-center justify-center gap-1.5 bg-secondary text-secondary-foreground text-xs font-semibold px-3 py-2 rounded-lg hover:bg-muted transition-colors border border-border"
              >
                <Download className="h-3.5 w-3.5" />
                PDF
              </button>
            </div>
          </div>
        )}

        {/* Annual Ranking */}
        {hasRanking && (
          <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
              <Trophy className="h-4 w-4 text-trophy" />
              Ranking Anual
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleShare('ranking', 'whatsapp')}
                className="flex-1 flex items-center justify-center gap-1.5 bg-[hsl(142,70%,40%)] text-white text-xs font-semibold px-3 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                WhatsApp
              </button>
              <button
                onClick={() => handleShare('ranking', 'pdf')}
                className="flex-1 flex items-center justify-center gap-1.5 bg-secondary text-secondary-foreground text-xs font-semibold px-3 py-2 rounded-lg hover:bg-muted transition-colors border border-border"
              >
                <Download className="h-3.5 w-3.5" />
                PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}