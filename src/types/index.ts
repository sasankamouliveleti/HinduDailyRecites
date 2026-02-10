export interface Recite {
  id: string;
  title: string;
  deity: string;
  category: 'stotra' | 'chalisa' | 'sahasranamam' | 'chapter' | 'hymn';
  description: string;
  textOriginal: string;
  textEnglish: string;
  audioFile: string | null;
  durationMinutes: number;
  icon: string;
}

export interface CompletionRecord {
  reciteId: string;
  date: string; // YYYY-MM-DD
  completedVia: 'audio' | 'manual';
  timestamp: number;
}

export interface StreakData {
  globalStreak: number;
  longestGlobalStreak: number;
  perReciteStreaks: Record<string, number>;
  longestPerReciteStreaks: Record<string, number>;
  totalCompletions: number;
}

export interface UserSettings {
  reminderEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
  defaultTextMode: TextMode;
}

export type TextMode = 'original' | 'english' | 'both';

export type RootStackParamList = {
  MainTabs: undefined;
  ReciteDetail: { reciteId: string };
  Auth: undefined;
};

export type TabParamList = {
  Home: undefined;
  Library: undefined;
  Streaks: undefined;
  Settings: undefined;
};
