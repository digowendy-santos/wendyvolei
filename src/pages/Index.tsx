import { useGameState } from '@/hooks/useGameState';
import { Header } from '@/components/Header';
import { PlayerRegistration } from '@/components/PlayerRegistration';
import { TeamsDisplay } from '@/components/TeamsDisplay';
import { StandingsTable } from '@/components/StandingsTable';
import { MatchSchedule } from '@/components/MatchSchedule';
import { WinnerBanner } from '@/components/WinnerBanner';
import { AnnualRanking } from '@/components/AnnualRanking';
import { CalendarDays } from '@/components/CalendarDays';
import { ShareExport } from '@/components/ShareExport';

const Index = () => {
  const game = useGameState();

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background image */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/images/beach-bg.jpg)',
          opacity: 0.3,
        }}
      />
      <div className="fixed inset-0 z-0 bg-background/80" />

      <div className="relative z-10">
        <Header
          currentDate={game.currentDate}
          onDateChange={game.setCurrentDate}
          onReset={game.resetDay}
          hasTeams={game.teams.length > 0}
        />

        <main className="container mx-auto px-4 py-6 space-y-6 max-w-5xl">
          <PlayerRegistration
            players={game.players}
            format={game.format}
            roundType={game.roundType}
            playerHall={game.playerHall}
            canDraw={game.canDraw}
            validationMessage={game.validationMessage}
            phase={game.phase}
            onAddPlayer={game.addPlayer}
            onRemovePlayer={game.removePlayer}
            onToggleCaptain={game.toggleCaptain}
            onSetFormat={game.setFormat}
            onSetRoundType={game.setRoundType}
            onDraw={game.drawTeams}
            onFormManually={game.formTeamsManually}
            onAddFromHall={game.addPlayerFromHall}
            onRemoveFromHall={game.removeFromHall}
            onClearHall={game.clearHall}
          />

          {game.teams.length > 0 && (
            <>
              <TeamsDisplay teams={game.teams} />
              <StandingsTable standings={game.standings} teams={game.teams} />
              <MatchSchedule
                matches={game.matches}
                teams={game.teams}
                onScoreUpdate={game.updateMatchScore}
                onFinish={game.finishMatch}
              />
              {game.phase === 'finished' && game.winner && (
                <WinnerBanner winner={game.winner} />
              )}
            </>
          )}

          {/* Share / Export section */}
          <ShareExport
            currentDate={game.currentDate}
            teams={game.teams}
            matches={game.matches}
            standings={game.standings}
            annualRanking={game.annualRanking}
            format={game.format}
            phase={game.phase}
          />

          <CalendarDays
            savedDays={game.savedDays}
            currentDate={game.currentDate}
            onSelectDate={game.setCurrentDate}
          />

          <AnnualRanking ranking={game.annualRanking} />
        </main>
      </div>
    </div>
  );
};

export default Index;