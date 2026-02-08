import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  Player, Team, Match, Standing, GameDay,
  GameFormat, RoundType, TEAM_SIZES, FORMAT_LABELS,
  RANKING_POINTS, AnnualRankingEntry,
} from '@/lib/types';
import { generateSchedule } from '@/lib/scheduleGenerator';
import {
  loadAllDays, saveDay, deleteDayData,
  loadPlayerHall, addToPlayerHall, removeFromPlayerHall, clearPlayerHall,
} from '@/lib/storage';

function computeStandings(teams: Team[], matches: Match[]): Standing[] {
  const standings: Standing[] = teams.map(team => ({
    teamId: team.id,
    teamName: team.name,
    played: 0, wins: 0, losses: 0,
    pointsFor: 0, pointsAgainst: 0, pointsDiff: 0,
    winPercentage: 0,
  }));

  for (const match of matches) {
    if (!match.isFinished || match.score1 === null || match.score2 === null) continue;
    const s1 = standings.find(s => s.teamId === match.team1Id);
    const s2 = standings.find(s => s.teamId === match.team2Id);
    if (!s1 || !s2) continue;

    s1.played++; s2.played++;
    s1.pointsFor += match.score1; s1.pointsAgainst += match.score2;
    s2.pointsFor += match.score2; s2.pointsAgainst += match.score1;

    if (match.score1 > match.score2) { s1.wins++; s2.losses++; }
    else if (match.score2 > match.score1) { s2.wins++; s1.losses++; }
  }

  for (const s of standings) {
    s.pointsDiff = s.pointsFor - s.pointsAgainst;
    s.winPercentage = s.played > 0 ? Math.round((s.wins / s.played) * 100) : 0;
  }

  standings.sort((a, b) => {
    if (a.wins !== b.wins) return b.wins - a.wins;
    if (a.pointsDiff !== b.pointsDiff) return b.pointsDiff - a.pointsDiff;
    return b.pointsFor - a.pointsFor;
  });

  return standings;
}

function shuffle<T>(arr: T[]): T[] {
  const s = [...arr];
  for (let i = s.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [s[i], s[j]] = [s[j], s[i]];
  }
  return s;
}

export function useGameState() {
  const [currentDate, setCurrentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [format, setFormat] = useState<GameFormat>('duplas');
  const [roundType, setRoundType] = useState<RoundType>('turno');
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [playerHall, setPlayerHall] = useState<string[]>(() => loadPlayerHall());
  const skipSave = useRef(true);

  // Load day on date change
  useEffect(() => {
    skipSave.current = true;
    const days = loadAllDays();
    const day = days.find(d => d.date === currentDate);
    if (day) {
      setPlayers(day.players);
      setFormat(day.format);
      setRoundType(day.roundType);
      setTeams(day.teams);
      setMatches(day.matches);
    } else {
      setPlayers([]);
      setFormat('duplas');
      setRoundType('turno');
      setTeams([]);
      setMatches([]);
    }
  }, [currentDate]);

  // Auto-save
  useEffect(() => {
    if (skipSave.current) {
      skipSave.current = false;
      return;
    }
    if (teams.length > 0) {
      saveDay({ date: currentDate, players, format, roundType, teams, matches });
    }
  }, [teams, matches, currentDate, players, format, roundType]);

  const phase = useMemo(() => {
    if (teams.length === 0) return 'setup' as const;
    if (matches.length > 0 && matches.every(m => m.isFinished)) return 'finished' as const;
    return 'playing' as const;
  }, [teams, matches]);

  const standings = useMemo(() => computeStandings(teams, matches), [teams, matches]);

  const winner = useMemo(() => {
    if (phase !== 'finished' || standings.length === 0) return null;
    return teams.find(t => t.id === standings[0].teamId) || null;
  }, [phase, standings, teams]);

  const addPlayer = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setPlayers(prev => {
      if (prev.length >= 16) return prev;
      if (prev.some(p => p.name.toLowerCase() === trimmed.toLowerCase())) return prev;
      return [...prev, { id: crypto.randomUUID(), name: trimmed, isCaptain: false }];
    });
    const updatedHall = addToPlayerHall(trimmed);
    setPlayerHall(updatedHall);
  }, []);

  const removePlayer = useCallback((id: string) => {
    setPlayers(prev => prev.filter(p => p.id !== id));
  }, []);

  const toggleCaptain = useCallback((id: string) => {
    setPlayers(prev => prev.map(p =>
      p.id === id ? { ...p, isCaptain: !p.isCaptain } : p
    ));
  }, []);

  const addPlayerFromHall = useCallback((name: string) => {
    setPlayers(prev => {
      if (prev.length >= 16) return prev;
      if (prev.some(p => p.name.toLowerCase() === name.toLowerCase())) return prev;
      return [...prev, { id: crypto.randomUUID(), name, isCaptain: false }];
    });
  }, []);

  const removeFromHall = useCallback((name: string) => {
    const updated = removeFromPlayerHall(name);
    setPlayerHall(updated);
  }, []);

  const clearHall = useCallback(() => {
    clearPlayerHall();
    setPlayerHall([]);
  }, []);

  const drawTeams = useCallback(() => {
    const teamSize = TEAM_SIZES[format];
    if (players.length < 6 || players.length % teamSize !== 0) return;
    const numTeams = players.length / teamSize;
    const captains = shuffle(players.filter(p => p.isCaptain));
    const nonCaptains = shuffle(players.filter(p => !p.isCaptain));
    const label = FORMAT_LABELS[format];

    const newTeams: Team[] = Array.from({ length: numTeams }, (_, i) => ({
      id: crypto.randomUUID(),
      name: `${label} ${i + 1}`,
      players: [],
    }));

    // Assign captains to different teams
    captains.forEach((cap, i) => {
      if (i < numTeams) newTeams[i].players.push(cap);
    });

    // Pool remaining players (excess captains + non-captains)
    const pool = shuffle([...captains.slice(numTeams), ...nonCaptains]);
    let pi = 0;
    for (const team of newTeams) {
      while (team.players.length < teamSize && pi < pool.length) {
        team.players.push(pool[pi++]);
      }
    }

    const newMatches = generateSchedule(newTeams, format, roundType);
    setTeams(newTeams);
    setMatches(newMatches);
  }, [players, format, roundType]);

  const updateMatchScore = useCallback((matchId: number, score1: number | null, score2: number | null) => {
    setMatches(prev => prev.map(m =>
      m.id === matchId ? { ...m, score1, score2 } : m
    ));
  }, []);

  const finishMatch = useCallback((matchId: number, timerSeconds: number) => {
    setMatches(prev => prev.map(m =>
      m.id === matchId ? { ...m, isFinished: true, timerSeconds } : m
    ));
  }, []);

  const resetDay = useCallback(() => {
    skipSave.current = true;
    setPlayers([]);
    setFormat('duplas');
    setRoundType('turno');
    setTeams([]);
    setMatches([]);
    deleteDayData(currentDate);
  }, [currentDate]);

  const teamSize = TEAM_SIZES[format];
  const canDraw = players.length >= 6 && players.length % teamSize === 0;

  const validationMessage = useMemo(() => {
    if (players.length < 6) return `Mínimo de 6 jogadores (faltam ${6 - players.length})`;
    if (players.length % teamSize !== 0) {
      const next = Math.ceil(players.length / teamSize) * teamSize;
      return `Para ${format}, adicione mais ${next - players.length} jogador(es)`;
    }
    return null;
  }, [players.length, format, teamSize]);

  const annualRanking = useMemo((): AnnualRankingEntry[] => {
    const currentYear = new Date().getFullYear();
    const allDays = loadAllDays().filter(d => {
      if (!d.date.startsWith(String(currentYear))) return false;
      return d.matches.length > 0 && d.matches.every(m => m.isFinished);
    });
    const pp: Record<string, { points: number; days: number }> = {};
    for (const day of allDays) {
      const ds = computeStandings(day.teams, day.matches);
      ds.forEach((st, idx) => {
        const team = day.teams.find(t => t.id === st.teamId);
        if (!team) return;
        const pts = idx < RANKING_POINTS.length ? RANKING_POINTS[idx] : 0;
        for (const p of team.players) {
          if (!pp[p.name]) pp[p.name] = { points: 0, days: 0 };
          pp[p.name].points += pts;
          pp[p.name].days++;
        }
      });
    }
    return Object.entries(pp)
      .map(([name, d]) => ({ playerName: name, totalPoints: d.points, daysPlayed: d.days }))
      .sort((a, b) => b.totalPoints - a.totalPoints);
  }, [matches, teams]);

  const savedDays = useMemo(() => loadAllDays(), [matches, teams]);

  return {
    currentDate, setCurrentDate,
    players, format, setFormat, roundType, setRoundType,
    teams, matches, phase, standings, winner,
    playerHall, annualRanking, savedDays,
    canDraw, validationMessage,
    addPlayer, removePlayer, toggleCaptain,
    addPlayerFromHall, removeFromHall, clearHall,
    drawTeams, updateMatchScore, finishMatch, resetDay,
  };
}
