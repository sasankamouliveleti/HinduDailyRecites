import { CompletionRecord, UserSettings } from '../types';
import { getCompletionHistory, getSettings, importCompletions, saveSettings } from './storage';
import {
  fetchCompletions,
  uploadCompletions,
  fetchSettings,
  uploadSettings,
  updateLastSync,
} from './cloudStorage';

function mergeCompletions(
  local: CompletionRecord[],
  cloud: CompletionRecord[]
): CompletionRecord[] {
  const map = new Map<string, CompletionRecord>();

  for (const r of cloud) {
    map.set(`${r.reciteId}_${r.date}`, r);
  }
  for (const r of local) {
    // Local overwrites cloud if same key (keeps most recent)
    map.set(`${r.reciteId}_${r.date}`, r);
  }

  return Array.from(map.values()).sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Full sync on sign-in: merge local and cloud data bidirectionally.
 */
export async function syncOnSignIn(uid: string): Promise<void> {
  // Merge completions
  const [localCompletions, cloudCompletions] = await Promise.all([
    getCompletionHistory(),
    fetchCompletions(uid),
  ]);

  const merged = mergeCompletions(localCompletions, cloudCompletions);

  // Write merged set to both local and cloud
  await Promise.all([
    importCompletions(merged),
    uploadCompletions(uid, merged),
  ]);

  // Merge settings: cloud wins if exists, else upload local
  const [localSettings, cloudSettings] = await Promise.all([
    getSettings(),
    fetchSettings(uid),
  ]);

  if (cloudSettings) {
    await saveSettings(cloudSettings);
  } else {
    await uploadSettings(uid, localSettings);
  }

  await updateLastSync(uid);
}

/**
 * Lightweight sync on app open when already signed in.
 * Pulls cloud completions and merges any new ones.
 */
export async function syncOnAppOpen(uid: string): Promise<void> {
  const [localCompletions, cloudCompletions] = await Promise.all([
    getCompletionHistory(),
    fetchCompletions(uid),
  ]);

  const merged = mergeCompletions(localCompletions, cloudCompletions);

  // Only write if there are differences
  if (merged.length !== localCompletions.length) {
    await importCompletions(merged);
  }

  // Upload any local-only completions to cloud
  if (merged.length !== cloudCompletions.length) {
    await uploadCompletions(uid, merged);
  }

  await updateLastSync(uid);
}
