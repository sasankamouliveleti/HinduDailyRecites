import React, { createContext, useState, useEffect, useCallback } from 'react';
import { CompletionRecord, StreakData } from '../types';
import { getCompletionHistory, saveCompletion } from '../services/storage';
import {
  getStreakData,
  isCompletedToday,
  getTodayCompletions,
} from '../services/streaks';
import { auth } from '../config/firebase';
import { syncOnAppOpen } from '../services/syncService';

export interface StreaksContextValue {
  history: CompletionRecord[];
  streakData: StreakData;
  todayCompletions: string[];
  isReciteCompletedToday: (reciteId: string) => boolean;
  isAnyCompletedToday: boolean;
  markComplete: (reciteId: string, via: 'audio' | 'manual') => Promise<void>;
  refresh: () => Promise<void>;
  loading: boolean;
}

export const StreaksContext = createContext<StreaksContextValue>({
  history: [],
  streakData: {
    globalStreak: 0,
    longestGlobalStreak: 0,
    perReciteStreaks: {},
    longestPerReciteStreaks: {},
    totalCompletions: 0,
  },
  todayCompletions: [],
  isReciteCompletedToday: () => false,
  isAnyCompletedToday: false,
  markComplete: async () => {},
  refresh: async () => {},
  loading: true,
});

export function StreaksProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<CompletionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [streakData, setStreakData] = useState<StreakData>({
    globalStreak: 0,
    longestGlobalStreak: 0,
    perReciteStreaks: {},
    longestPerReciteStreaks: {},
    totalCompletions: 0,
  });

  const refresh = useCallback(async () => {
    const h = await getCompletionHistory();
    setHistory(h);
    setStreakData(getStreakData(h));
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh().then(() => {
      const uid = auth.currentUser?.uid;
      if (uid) {
        syncOnAppOpen(uid)
          .then(() => refresh())
          .catch(() => {});
      }
    });
  }, [refresh]);

  const markComplete = useCallback(
    async (reciteId: string, via: 'audio' | 'manual') => {
      await saveCompletion(reciteId, via);
      await refresh();
    },
    [refresh]
  );

  const isReciteCompletedToday = useCallback(
    (reciteId: string) => isCompletedToday(history, reciteId),
    [history]
  );

  const todayCompletions = getTodayCompletions(history);
  const isAnyCompletedToday = isCompletedToday(history);

  return (
    <StreaksContext.Provider
      value={{
        history,
        streakData,
        todayCompletions,
        isReciteCompletedToday,
        isAnyCompletedToday,
        markComplete,
        refresh,
        loading,
      }}
    >
      {children}
    </StreaksContext.Provider>
  );
}
