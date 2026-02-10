import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../theme';

interface StreakCounterProps {
  count: number;
  label?: string;
  size?: 'small' | 'large';
}

const MILESTONE_STREAKS = [7, 30, 100];

export function StreakCounter({
  count,
  label = 'day streak',
  size = 'small',
}: StreakCounterProps) {
  const isLarge = size === 'large';
  const isMilestone = MILESTONE_STREAKS.includes(count);

  const fireScale = useSharedValue(1);
  const containerGlow = useSharedValue(0);

  useEffect(() => {
    if (count > 0) {
      // Pulse the fire emoji
      fireScale.value = withSequence(
        withSpring(1.3, { damping: 4, stiffness: 200 }),
        withSpring(1, { damping: 8, stiffness: 150 })
      );
    }
    if (isMilestone) {
      containerGlow.value = withSequence(
        withTiming(1, { duration: 400 }),
        withTiming(0.3, { duration: 600 })
      );
    }
  }, [count]);

  const fireStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fireScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: containerGlow.value * 0.8,
    shadowRadius: containerGlow.value * 12,
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        isLarge && styles.containerLarge,
        isMilestone && styles.milestoneContainer,
        glowStyle,
      ]}
    >
      <Animated.Text
        style={[styles.fireIcon, isLarge && styles.fireIconLarge, fireStyle]}
      >
        🔥
      </Animated.Text>
      <Text style={[styles.count, isLarge && styles.countLarge]}>
        {count}
      </Text>
      <Text style={[styles.label, isLarge && styles.labelLarge]}>
        {label}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  containerLarge: {
    flexDirection: 'column',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
    gap: spacing.xs,
  },
  milestoneContainer: {
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fireIcon: {
    fontSize: 18,
  },
  fireIconLarge: {
    fontSize: 48,
  },
  count: {
    color: colors.gold,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  countLarge: {
    fontSize: fontSize.xxxl,
  },
  label: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
  },
  labelLarge: {
    fontSize: fontSize.md,
  },
});
