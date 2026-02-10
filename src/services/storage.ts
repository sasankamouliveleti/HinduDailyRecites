import AsyncStorage from '@react-native-async-storage/async-storage';
import { CompletionRecord, UserSettings } from '../types';
import { auth } from '../config/firebase';
import { addCompletion, uploadSettings } from './cloudStorage';

const KEYS = {
  COMPLETIONS: '@dailyrecites_completions',
  SETTINGS: '@dailyrecites_settings',
};

const DEFAULT_SETTINGS: UserSettings = {
  reminderEnabled: true,
  reminderHour: 7,
  reminderMinute: 0,
  defaultTextMode: 'both',
};

export async function getCompletionHistory(): Promise<CompletionRecord[]> {
  const data = await AsyncStorage.getItem(KEYS.COMPLETIONS);
  return data ? JSON.parse(data) : [];
}

export async function saveCompletion(
  reciteId: string,
  completedVia: 'audio' | 'manual'
): Promise<void> {
  const history = await getCompletionHistory();
  const today = new Date().toISOString().split('T')[0];

  const alreadyDone = history.some(
    (r) => r.reciteId === reciteId && r.date === today
  );
  if (alreadyDone) return;

  const record: CompletionRecord = {
    reciteId,
    date: today,
    completedVia,
    timestamp: Date.now(),
  };

  history.push(record);
  await AsyncStorage.setItem(KEYS.COMPLETIONS, JSON.stringify(history));

  // Dual-write to Firestore if signed in
  const uid = auth.currentUser?.uid;
  if (uid) {
    addCompletion(uid, record).catch(() => {});
  }
}

export async function importCompletions(records: CompletionRecord[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.COMPLETIONS, JSON.stringify(records));
}

export async function getSettings(): Promise<UserSettings> {
  const data = await AsyncStorage.getItem(KEYS.SETTINGS);
  return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));

  // Dual-write to Firestore if signed in
  const uid = auth.currentUser?.uid;
  if (uid) {
    uploadSettings(uid, settings).catch(() => {});
  }
}

export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove([KEYS.COMPLETIONS, KEYS.SETTINGS]);
}
