import { useEffect, useCallback } from 'react';
import {
  configureNotifications,
  scheduleDailyReminder,
  cancelDailyReminder,
  requestPermissions,
} from '../services/notifications';
import { UserSettings } from '../types';

export function useNotifications(
  settings: UserSettings,
  globalStreak: number
) {
  useEffect(() => {
    configureNotifications();
  }, []);

  useEffect(() => {
    if (settings.reminderEnabled) {
      scheduleDailyReminder(
        settings.reminderHour,
        settings.reminderMinute,
        globalStreak
      );
    } else {
      cancelDailyReminder();
    }
  }, [
    settings.reminderEnabled,
    settings.reminderHour,
    settings.reminderMinute,
    globalStreak,
  ]);

  const requestNotificationPermissions = useCallback(async () => {
    return await requestPermissions();
  }, []);

  return { requestNotificationPermissions };
}
