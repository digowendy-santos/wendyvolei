import { GameDay } from './types';

const DAYS_KEY = 'volleyball_days';
const HALL_KEY = 'volleyball_hall';

export function loadAllDays(): GameDay[] {
  try {
    const data = localStorage.getItem(DAYS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveDay(day: GameDay): void {
  const days = loadAllDays();
  const updated = days.filter(d => d.date !== day.date);
  updated.push(day);
  localStorage.setItem(DAYS_KEY, JSON.stringify(updated));
}

export function deleteDayData(date: string): void {
  const days = loadAllDays().filter(d => d.date !== date);
  localStorage.setItem(DAYS_KEY, JSON.stringify(days));
}

export function loadPlayerHall(): string[] {
  try {
    const data = localStorage.getItem(HALL_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function savePlayerHall(names: string[]): void {
  localStorage.setItem(HALL_KEY, JSON.stringify(names));
}

export function addToPlayerHall(name: string): string[] {
  const hall = loadPlayerHall();
  if (!hall.includes(name)) {
    hall.push(name);
    hall.sort((a, b) => a.localeCompare(b));
    savePlayerHall(hall);
  }
  return hall;
}

export function removeFromPlayerHall(name: string): string[] {
  const hall = loadPlayerHall().filter(n => n !== name);
  savePlayerHall(hall);
  return hall;
}

export function clearPlayerHall(): void {
  savePlayerHall([]);
}
