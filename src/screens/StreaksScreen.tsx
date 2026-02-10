import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../theme';
import { recites } from '../data/recites';
import { StreakCounter } from '../components/StreakCounter';
import { useStreaks } from '../hooks/useStreaks';
import { getLast30DaysCompletions } from '../services/streaks';

function CalendarDay({
  day,
  index,
  isToday,
}: {
  day: { date: string; completed: boolean; label: string };
  index: number;
  isToday: boolean;
}) {
  return (
    <Animated.View
      entering={FadeIn.delay(index * 20).duration(300)}
      style={[
        styles.calendarDay,
        day.completed && styles.calendarDayCompleted,
        isToday && day.completed && styles.calendarDayToday,
      ]}
    >
      <Text
        style={[
          styles.calendarDayText,
          day.completed && styles.calendarDayTextCompleted,
        ]}
      >
        {day.label}
      </Text>
    </Animated.View>
  );
}

export function StreaksScreen() {
  const insets = useSafeAreaInsets();
  const { history, streakData } = useStreaks();

  const last30Days = useMemo(
    () => getLast30DaysCompletions(history),
    [history]
  );

  const todayStr = new Date().toISOString().split('T')[0];

  const calendarDays = useMemo(() => {
    const days: { date: string; completed: boolean; label: string }[] = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        completed: last30Days[dateStr] || false,
        label: date.getDate().toString(),
      });
    }

    return days;
  }, [last30Days]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md }]}
    >
      <Animated.Text entering={FadeIn.duration(400)} style={styles.title}>
        Your Streaks
      </Animated.Text>

      <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.mainStreak}>
        <StreakCounter
          count={streakData.globalStreak}
          label="day streak"
          size="large"
        />
        <Text style={styles.longestStreak}>
          Longest: {streakData.longestGlobalStreak} days
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.section}>
        <Text style={styles.sectionTitle}>Last 30 Days</Text>
        <View style={styles.calendarGrid}>
          {calendarDays.map((day, index) => (
            <CalendarDay
              key={day.date}
              day={day}
              index={index}
              isToday={day.date === todayStr}
            />
          ))}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.section}>
        <Text style={styles.sectionTitle}>Per-Recite Streaks</Text>
        {recites.map((recite, index) => {
          const streak = streakData.perReciteStreaks[recite.id] || 0;
          const longest =
            streakData.longestPerReciteStreaks[recite.id] || 0;
          return (
            <Animated.View
              key={recite.id}
              entering={FadeInUp.delay(400 + index * 60).duration(400)}
              style={styles.reciteStreakRow}
            >
              <Text style={styles.reciteIcon}>{recite.icon}</Text>
              <View style={styles.reciteInfo}>
                <Text style={styles.reciteName}>{recite.title}</Text>
                <Text style={styles.reciteStreakDetail}>
                  Best: {longest} days
                </Text>
              </View>
              <View style={styles.streakBadge}>
                <Text style={styles.streakBadgeText}>
                  🔥 {streak}
                </Text>
              </View>
            </Animated.View>
          );
        })}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(500).duration(500)} style={styles.section}>
        <Text style={styles.sectionTitle}>Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {streakData.totalCompletions}
            </Text>
            <Text style={styles.statLabel}>Total Completions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {streakData.longestGlobalStreak}
            </Text>
            <Text style={styles.statLabel}>Longest Streak</Text>
          </View>
        </View>
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
  mainStreak: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  longestStreak: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
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
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  calendarDay: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarDayCompleted: {
    backgroundColor: colors.completedGreen,
  },
  calendarDayToday: {
    shadowColor: colors.completedGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
  calendarDayText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  calendarDayTextCompleted: {
    color: colors.white,
    fontWeight: fontWeight.bold,
  },
  reciteStreakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  reciteIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  reciteInfo: {
    flex: 1,
  },
  reciteName: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  reciteStreakDetail: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  streakBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  streakBadgeText: {
    color: colors.gold,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  statNumber: {
    color: colors.gold,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
