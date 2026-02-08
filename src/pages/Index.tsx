import { useGameState } from '@/hooks/useGameState';
import { Header } from '@/components/Header';
import { PlayerRegistration } from '@/components/PlayerRegistration';
import { TeamsDisplay } from '@/components/TeamsDisplay';
import { StandingsTable } from '@/components/StandingsTable';
import { MatchSchedule } from '@/components/MatchSchedule';
import { WinnerBanner } from '@/components/WinnerBanner';
import { AnnualRanking } from '@/components/AnnualRanking';
import { CalendarDays } from '@/components/CalendarDays';

const Index = () => {
  const game = useGameState();

  return (
    <div className="min-h-screen bg-background">
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
          onAddFromHall={game.addPlayerFromHall}
          onRemoveFromHall={game.removeFromHall}
        />

        {game.teams.length > 0 && (
          <>
            <TeamsDisplay teams={game.teams} />
            <StandingsTable standings={game.standings} />
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

        <CalendarDays
          savedDays={game.savedDays}
          currentDate={game.currentDate}
          onSelectDate={game.setCurrentDate}
        />

        <AnnualRanking ranking={game.annualRanking} />
      </main>
    </div>
  );
};

export default Index;
