import { CompletionRecord, StreakData } from '../types';

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getPreviousDay(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
}

function getUniqueDates(records: CompletionRecord[]): string[] {
  const dates = [...new Set(records.map((r) => r.date))];
  return dates.sort().reverse(); // Most recent first
}

export function calculateGlobalStreak(history: CompletionRecord[]): number {
  const dates = getUniqueDates(history);
  if (dates.length === 0) return 0;

  const today = getToday();
  let streak = 0;
  let checkDate = today;

  // If today is not completed, start from yesterday
  if (!dates.includes(today)) {
    checkDate = getPreviousDay(today);
    // If yesterday also not completed, streak is 0
    if (!dates.includes(checkDate)) return 0;
  }

  while (dates.includes(checkDate)) {
    streak++;
    checkDate = getPreviousDay(checkDate);
  }

  return streak;
}

export function calculateReciteStreak(
  history: CompletionRecord[],
  reciteId: string
): number {
  const filtered = history.filter((r) => r.reciteId === reciteId);
  return calculateGlobalStreak(filtered);
}

export function isCompletedToday(
  history: CompletionRecord[],
  reciteId?: string
): boolean {
  const today = getToday();
  if (reciteId) {
    return history.some((r) => r.reciteId === reciteId && r.date === today);
  }
  return history.some((r) => r.date === today);
}

export function getTodayCompletions(history: CompletionRecord[]): string[] {
  const today = getToday();
  return history.filter((r) => r.date === today).map((r) => r.reciteId);
}

export function getStreakData(history: CompletionRecord[]): StreakData {
  const reciteIds = [...new Set(history.map((r) => r.reciteId))];

  const perReciteStreaks: Record<string, number> = {};
  const longestPerReciteStreaks: Record<string, number> = {};

  for (const id of reciteIds) {
    const filtered = history.filter((r) => r.reciteId === id);
    perReciteStreaks[id] = calculateReciteStreak(history, id);
    longestPerReciteStreaks[id] = calculateLongestStreak(filtered);
  }

  return {
    globalStreak: calculateGlobalStreak(history),
    longestGlobalStreak: calculateLongestStreak(history),
    perReciteStreaks,
    longestPerReciteStreaks,
    totalCompletions: history.length,
  };
}

function calculateLongestStreak(records: CompletionRecord[]): number {
  const dates = getUniqueDates(records);
  if (dates.length === 0) return 0;

  let longest = 1;
  let current = 1;

  // Dates are sorted in reverse, so iterate reversed
  const sorted = [...dates].sort();

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    const prevDate = new Date(prev + 'T00:00:00');
    const currDate = new Date(curr + 'T00:00:00');
    const diffDays =
      (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  return longest;
}

export function getLast30DaysCompletions(
  history: CompletionRecord[]
): Record<string, boolean> {
  const result: Record<string, boolean> = {};
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    result[dateStr] = history.some((r) => r.date === dateStr);
  }

  return result;
}
