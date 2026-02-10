import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../theme';
import { UserSettings, TextMode, RootStackParamList } from '../types';
import { getSettings, saveSettings, clearAllData } from '../services/storage';
import { useStreaks } from '../hooks/useStreaks';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../hooks/useAuth';

const TEXT_MODE_OPTIONS: { mode: TextMode; label: string }[] = [
  { mode: 'original', label: 'Original' },
  { mode: 'english', label: 'English' },
  { mode: 'both', label: 'Both' },
];

function AnimatedModeButton({
  label,
  isActive,
  onPress,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
}) {
  const progress = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isActive ? 1 : 0, { duration: 200 });
  }, [isActive]);

  const btnStyle = useAnimatedStyle(() => ({
    backgroundColor:
      progress.value > 0.5 ? colors.saffron : colors.surface,
  }));

  const txtStyle = useAnimatedStyle(() => ({
    color: progress.value > 0.5 ? colors.white : colors.textSecondary,
    fontWeight: progress.value > 0.5 ? ('600' as any) : ('400' as any),
  }));

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Animated.View style={[styles.modeButton, btnStyle]}>
        <Animated.Text style={[styles.modeButtonText, txtStyle]}>
          {label}
        </Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

export function SettingsScreen() {
  const [settings, setSettings] = useState<UserSettings>({
    reminderEnabled: true,
    reminderHour: 7,
    reminderMinute: 0,
    defaultTextMode: 'both',
  });

  const insets = useSafeAreaInsets();
  const { streakData, refresh } = useStreaks();
  const { user, isAuthenticated, signOut } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  useNotifications(settings, streakData.globalStreak);

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  const updateSetting = async (update: Partial<UserSettings>) => {
    const newSettings = { ...settings, ...update };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const handleClearData = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      'Reset All Data',
      'This will clear all your streaks, completion history, and settings. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            await refresh();
            const defaultSettings: UserSettings = {
              reminderEnabled: true,
              reminderHour: 7,
              reminderMinute: 0,
              defaultTextMode: 'both',
            };
            setSettings(defaultSettings);
            Alert.alert('Done', 'All data has been reset.');
          },
        },
      ]
    );
  };

  const cycleReminderTime = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const hours = [5, 6, 7, 8, 9, 17, 18, 19, 20, 21];
    const currentIndex = hours.indexOf(settings.reminderHour);
    const nextIndex = (currentIndex + 1) % hours.length;
    updateSetting({ reminderHour: hours[nextIndex], reminderMinute: 0 });
  };

  const formatTime = (hour: number, minute: number): string => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md }]}
    >
      <Animated.Text entering={FadeIn.duration(400)} style={styles.title}>
        Settings
      </Animated.Text>

      <Animated.View entering={FadeInDown.delay(50).duration(400)} style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        {isAuthenticated ? (
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>{user?.displayName || 'User'}</Text>
              <Text style={styles.settingDescription}>{user?.email}</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                signOut();
              }}
              style={styles.signOutButton}
            >
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.signInCard}
            onPress={() => navigation.navigate('Auth')}
          >
            <Text style={styles.settingLabel}>Sign in to sync your data</Text>
            <Text style={styles.settingDescription}>
              Keep your streaks and history across devices
            </Text>
          </TouchableOpacity>
        )}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Daily Reminder</Text>
            <Text style={styles.settingDescription}>
              Get notified if you haven't recited today
            </Text>
          </View>
          <Switch
            value={settings.reminderEnabled}
            onValueChange={(val) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              updateSetting({ reminderEnabled: val });
            }}
            trackColor={{ false: colors.surface, true: colors.saffron }}
            thumbColor={colors.white}
          />
        </View>

        {settings.reminderEnabled && (
          <Animated.View entering={FadeInDown.duration(300)}>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={cycleReminderTime}
            >
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Reminder Time</Text>
                <Text style={styles.settingDescription}>
                  Tap to change
                </Text>
              </View>
              <Text style={styles.settingValue}>
                {formatTime(settings.reminderHour, settings.reminderMinute)}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.section}>
        <Text style={styles.sectionTitle}>Display</Text>

        <View style={styles.displayRow}>
          <Text style={styles.settingLabel}>Default Text Mode</Text>
          <View style={styles.modeToggleRow}>
            {TEXT_MODE_OPTIONS.map(({ mode, label }) => (
              <AnimatedModeButton
                key={mode}
                label={label}
                isActive={settings.defaultTextMode === mode}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  updateSetting({ defaultTextMode: mode });
                }}
              />
            ))}
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>

        <TouchableOpacity
          style={styles.dangerRow}
          onPress={handleClearData}
        >
          <Text style={styles.dangerText}>Reset All Data</Text>
          <Text style={styles.dangerDescription}>
            Clear streaks, history, and settings
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View entering={FadeIn.delay(400).duration(400)} style={styles.footer}>
        <Text style={styles.footerText}>Hindu Daily Recite v1.0.0</Text>
        <Text style={styles.footerSubtext}>
          Made with devotion 🙏
        </Text>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    color: colors.saffron,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.md,
  },
  settingRow: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingLabel: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  settingDescription: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  settingValue: {
    color: colors.gold,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  displayRow: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  modeToggleRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  modeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  modeButtonText: {
    fontSize: fontSize.sm,
  },
  signInCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.saffron,
  },
  signOutButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  signOutText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  dangerRow: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.error,
  },
  dangerText: {
    color: colors.error,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  dangerDescription: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  footerSubtext: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
});
