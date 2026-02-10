import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, fontSize, borderRadius } from '../theme';

interface AudioPlayerProps {
  isLoaded: boolean;
  isPlaying: boolean;
  positionMs: number;
  durationMs: number;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (positionMs: number) => void;
  hasAudio: boolean;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function BufferingIndicator() {
  const pulse = useSharedValue(0.5);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 600 }),
        withTiming(0.5, { duration: 600 })
      ),
      -1
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
  }));

  return (
    <Animated.View style={[styles.bufferingContainer, animStyle]}>
      <ActivityIndicator size="small" color={colors.gold} />
      <Text style={styles.bufferingText}>Loading audio...</Text>
    </Animated.View>
  );
}

export function AudioPlayer({
  isLoaded,
  isPlaying,
  positionMs,
  durationMs,
  onPlay,
  onPause,
  hasAudio,
}: AudioPlayerProps) {
  const progress = durationMs > 0 ? positionMs / durationMs : 0;

  if (!hasAudio) {
    return (
      <View style={styles.container}>
        <View style={styles.noAudioContainer}>
          <Text style={styles.noAudioIcon}>🎵</Text>
          <Text style={styles.noAudioText}>
            Audio will be available soon
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!isLoaded ? (
        <BufferingIndicator />
      ) : (
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              (isPlaying ? onPause : onPlay)();
            }}
          >
            <Text style={styles.playIcon}>
              {isPlaying ? '⏸' : '▶️'}
            </Text>
          </TouchableOpacity>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${progress * 100}%` }]}
              />
            </View>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{formatTime(positionMs)}</Text>
              <Text style={styles.timeText}>{formatTime(durationMs)}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.saffron,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 20,
  },
  progressContainer: {
    flex: 1,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.cardBorder,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.gold,
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  timeText: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
  },
  bufferingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  bufferingText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  noAudioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  noAudioIcon: {
    fontSize: 20,
  },
  noAudioText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
});
