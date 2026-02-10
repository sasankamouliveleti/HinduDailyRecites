import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  withTiming,
  runOnJS,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { RouteProp, useRoute } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../theme';
import { getReciteById } from '../data/recites';
import { RootStackParamList, TextMode } from '../types';
import { AudioPlayer } from '../components/AudioPlayer';
import { useAudio } from '../hooks/useAudio';
import { useStreaks } from '../hooks/useStreaks';

type DetailRouteProp = RouteProp<RootStackParamList, 'ReciteDetail'>;

const TEXT_MODE_LABELS: Record<TextMode, string> = {
  original: 'Original',
  english: 'English',
  both: 'Both',
};

export function ReciteDetailScreen() {
  const route = useRoute<DetailRouteProp>();
  const recite = getReciteById(route.params.reciteId);
  const { isReciteCompletedToday, markComplete } = useStreaks();
  const [textMode, setTextMode] = useState<TextMode>('both');
  const [showSuccess, setShowSuccess] = useState(false);

  const buttonScale = useSharedValue(1);
  const checkScale = useSharedValue(0);
  const overlayOpacity = useSharedValue(0);

  const dismissSuccess = useCallback(() => {
    setShowSuccess(false);
  }, []);

  const triggerSuccessAnimation = useCallback(() => {
    setShowSuccess(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    checkScale.value = withSpring(1, { damping: 8, stiffness: 120 });
    overlayOpacity.value = withSequence(
      withTiming(1, { duration: 200 }),
      withDelay(1500, withTiming(0, { duration: 300 }))
    );
    // Auto-dismiss after 2 seconds
    setTimeout(dismissSuccess, 2000);
  }, [dismissSuccess]);

  const onAudioComplete = useCallback(() => {
    if (recite && !isReciteCompletedToday(recite.id)) {
      markComplete(recite.id, 'audio');
      triggerSuccessAnimation();
    }
  }, [recite, isReciteCompletedToday, markComplete, triggerSuccessAnimation]);

  const audio = useAudio(onAudioComplete);

  if (!recite) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Recite not found</Text>
      </View>
    );
  }

  const completed = isReciteCompletedToday(recite.id);

  const handleMarkComplete = () => {
    if (!completed) {
      buttonScale.value = withSequence(
        withSpring(0.95, { damping: 15 }),
        withSpring(1, { damping: 10 })
      );
      markComplete(recite.id, 'manual');
      triggerSuccessAnimation();
    }
  };

  const cycleTextMode = () => {
    const modes: TextMode[] = ['original', 'english', 'both'];
    const currentIndex = modes.indexOf(textMode);
    setTextMode(modes[(currentIndex + 1) % modes.length]);
  };

  const buttonAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const checkAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value,
  }));

  const overlayAnimStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.icon}>{recite.icon}</Text>
          <Text style={styles.title}>{recite.title}</Text>
          <Text style={styles.deity}>
            {recite.deity} · {recite.durationMinutes} min
          </Text>
          {completed && (
            <Animated.View entering={FadeIn.duration(300)} style={styles.completedBadge}>
              <Text style={styles.completedBadgeText}>Completed Today ✓</Text>
            </Animated.View>
          )}
        </View>

        <TouchableOpacity style={styles.modeToggle} onPress={cycleTextMode}>
          <Text style={styles.modeToggleText}>
            Showing: {TEXT_MODE_LABELS[textMode]}
          </Text>
        </TouchableOpacity>

        <View style={styles.textContainer}>
          {(textMode === 'original' || textMode === 'both') && (
            <View style={styles.textBlock}>
              {textMode === 'both' && (
                <Text style={styles.textLabel}>Original</Text>
              )}
              <Text style={styles.originalText}>
                {recite.textOriginal}
              </Text>
            </View>
          )}

          {textMode === 'both' && <View style={styles.divider} />}

          {(textMode === 'english' || textMode === 'both') && (
            <View style={styles.textBlock}>
              {textMode === 'both' && (
                <Text style={styles.textLabel}>English Translation</Text>
              )}
              <Text style={styles.englishText}>
                {recite.textEnglish}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <AudioPlayer
          isLoaded={audio.isLoaded}
          isPlaying={audio.isPlaying}
          positionMs={audio.positionMs}
          durationMs={audio.durationMs}
          onPlay={audio.play}
          onPause={audio.pause}
          onSeek={audio.seek}
          hasAudio={recite.audioFile !== null}
        />

        <Animated.View style={buttonAnimStyle}>
          <TouchableOpacity
            style={[
              styles.completeButton,
              completed && styles.completeButtonDone,
            ]}
            onPress={handleMarkComplete}
            disabled={completed}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.completeButtonText,
                completed && styles.completeButtonTextDone,
              ]}
            >
              {completed ? 'Completed ✓' : 'Mark as Complete ✓'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {showSuccess && (
        <Animated.View style={[styles.successOverlay, overlayAnimStyle]} pointerEvents="none">
          <Animated.View style={[styles.successCircle, checkAnimStyle]}>
            <Text style={styles.successCheck}>✓</Text>
          </Animated.View>
          <Animated.Text style={[styles.successText, checkAnimStyle]}>
            Well done!
          </Animated.Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  icon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },
  deity: {
    color: colors.saffron,
    fontSize: fontSize.md,
    marginTop: spacing.xs,
  },
  completedBadge: {
    backgroundColor: colors.completedGreen,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginTop: spacing.sm,
  },
  completedBadgeText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  modeToggle: {
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignSelf: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  modeToggleText: {
    color: colors.gold,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  textContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  textBlock: {
    marginBottom: spacing.md,
  },
  textLabel: {
    color: colors.saffron,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  originalText: {
    color: colors.text,
    fontSize: fontSize.md,
    lineHeight: 28,
  },
  englishText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    lineHeight: 26,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginVertical: spacing.lg,
  },
  bottomBar: {
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  completeButton: {
    backgroundColor: colors.saffron,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  completeButtonDone: {
    backgroundColor: colors.completedGreen,
  },
  completeButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  completeButtonTextDone: {
    color: colors.white,
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.completedGreen,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.completedGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  successCheck: {
    color: colors.white,
    fontSize: 48,
    fontWeight: fontWeight.bold,
  },
  successText: {
    color: colors.gold,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginTop: spacing.lg,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.lg,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
});
