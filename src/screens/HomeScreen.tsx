import React, { useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../theme';
import { recites } from '../data/recites';
import { RootStackParamList } from '../types';
import { ProgressRing } from '../components/ProgressRing';
import { StreakCounter } from '../components/StreakCounter';
import { useStreaks } from '../hooks/useStreaks';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function SkeletonBlock({ width, height }: { width: number | string; height: number }) {
  const shimmer = useSharedValue(0.3);

  useEffect(() => {
    shimmer.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: shimmer.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          backgroundColor: colors.surface,
          borderRadius: borderRadius.md,
        },
        animStyle,
      ]}
    />
  );
}

function LoadingSkeleton() {
  return (
    <View style={styles.content}>
      <SkeletonBlock width="70%" height={32} />
      <View style={{ height: spacing.xs }} />
      <SkeletonBlock width="55%" height={20} />
      <View style={[styles.statsRow, { marginTop: spacing.xl }]}>
        <SkeletonBlock width={120} height={120} />
        <SkeletonBlock width={100} height={120} />
      </View>
      <View style={{ height: spacing.lg }} />
      <SkeletonBlock width="40%" height={22} />
      <View style={{ height: spacing.md }} />
      <SkeletonBlock width="100%" height={64} />
      <View style={{ height: spacing.sm }} />
      <SkeletonBlock width="100%" height={64} />
    </View>
  );
}

export function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { streakData, todayCompletions, isReciteCompletedToday, loading } = useStreaks();

  const uncompletedRecites = useMemo(
    () => recites.filter((r) => !todayCompletions.includes(r.id)),
    [todayCompletions]
  );

  if (loading) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={{ paddingTop: insets.top + spacing.md }}>
        <LoadingSkeleton />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md }]}
    >
      <Animated.Text entering={FadeIn.duration(400)} style={styles.greeting}>
        {getGreeting()} 🙏
      </Animated.Text>
      <Animated.Text entering={FadeIn.delay(100).duration(400)} style={styles.subtitle}>
        Time for your daily recitation
      </Animated.Text>

      <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.statsRow}>
        <ProgressRing
          completed={todayCompletions.length}
          total={recites.length}
        />
        <StreakCounter
          count={streakData.globalStreak}
          size="large"
        />
      </Animated.View>

      {uncompletedRecites.length > 0 && (
        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>Continue Today</Text>
          {uncompletedRecites.slice(0, 3).map((recite, index) => (
            <Animated.View key={recite.id} entering={FadeInDown.delay(400 + index * 80).duration(400)}>
              <TouchableOpacity
                style={styles.quickCard}
                onPress={() =>
                  navigation.navigate('ReciteDetail', { reciteId: recite.id })
                }
              >
                <Text style={styles.quickIcon}>{recite.icon}</Text>
                <View style={styles.quickContent}>
                  <Text style={styles.quickTitle}>{recite.title}</Text>
                  <Text style={styles.quickDeity}>
                    {recite.deity} · {recite.durationMinutes} min
                  </Text>
                </View>
                <Text style={styles.arrow}>→</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </Animated.View>
      )}

      {todayCompletions.length > 0 && (
        <Animated.View entering={FadeInDown.delay(500).duration(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>Completed Today</Text>
          {recites
            .filter((r) => todayCompletions.includes(r.id))
            .map((recite) => (
              <TouchableOpacity
                key={recite.id}
                style={[styles.quickCard, styles.completedCard]}
                onPress={() =>
                  navigation.navigate('ReciteDetail', { reciteId: recite.id })
                }
              >
                <Text style={styles.quickIcon}>{recite.icon}</Text>
                <View style={styles.quickContent}>
                  <Text style={styles.quickTitle}>{recite.title}</Text>
                  <Text style={styles.completedText}>Completed ✓</Text>
                </View>
              </TouchableOpacity>
            ))}
        </Animated.View>
      )}
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
  greeting: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    marginTop: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    color: colors.saffron,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.md,
  },
  quickCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  completedCard: {
    borderColor: colors.completedGreen,
    opacity: 0.8,
  },
  quickIcon: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  quickContent: {
    flex: 1,
  },
  quickTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  quickDeity: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  completedText: {
    color: colors.completedGreen,
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  arrow: {
    color: colors.gold,
    fontSize: fontSize.xl,
  },
});
