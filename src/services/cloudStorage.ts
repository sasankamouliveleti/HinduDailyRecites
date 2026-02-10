import {
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { CompletionRecord, UserSettings } from '../types';

// --- Profile ---

export async function createUserProfile(
  uid: string,
  email: string,
  displayName: string
): Promise<void> {
  await setDoc(
    doc(db, 'users', uid, 'profile', 'info'),
    { email, displayName, createdAt: serverTimestamp(), lastSyncAt: serverTimestamp() },
    { merge: true }
  );
}

export async function updateLastSync(uid: string): Promise<void> {
  await setDoc(
    doc(db, 'users', uid, 'profile', 'info'),
    { lastSyncAt: serverTimestamp() },
    { merge: true }
  );
}

// --- Completions ---

export async function fetchCompletions(uid: string): Promise<CompletionRecord[]> {
  const snapshot = await getDocs(collection(db, 'users', uid, 'completions'));
  return snapshot.docs.map((d) => d.data() as CompletionRecord);
}

export async function addCompletion(
  uid: string,
  record: CompletionRecord
): Promise<void> {
  await addDoc(collection(db, 'users', uid, 'completions'), record);
}

export async function uploadCompletions(
  uid: string,
  records: CompletionRecord[]
): Promise<void> {
  const existing = await fetchCompletions(uid);
  const existingKeys = new Set(existing.map((r) => `${r.reciteId}_${r.date}`));

  const newRecords = records.filter(
    (r) => !existingKeys.has(`${r.reciteId}_${r.date}`)
  );

  const promises = newRecords.map((r) =>
    addDoc(collection(db, 'users', uid, 'completions'), r)
  );
  await Promise.all(promises);
}

// --- Settings ---

export async function fetchSettings(uid: string): Promise<UserSettings | null> {
  const snapshot = await getDocs(collection(db, 'users', uid, 'settings'));
  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as UserSettings;
}

export async function uploadSettings(
  uid: string,
  settings: UserSettings
): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'settings', 'prefs'), settings);
}
