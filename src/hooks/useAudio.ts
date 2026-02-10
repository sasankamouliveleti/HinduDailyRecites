import { useState, useEffect, useCallback, useRef } from 'react';
import { Audio } from 'expo-av';

interface AudioState {
  isLoaded: boolean;
  isPlaying: boolean;
  positionMs: number;
  durationMs: number;
}

interface UseAudioReturn extends AudioState {
  play: () => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  seek: (positionMs: number) => Promise<void>;
  loadAudio: (uri: string) => Promise<void>;
}

export function useAudio(onComplete?: () => void): UseAudioReturn {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [state, setState] = useState<AudioState>({
    isLoaded: false,
    isPlaying: false,
    positionMs: 0,
    durationMs: 0,
  });

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
    });

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const onPlaybackStatusUpdate = useCallback(
    (status: any) => {
      if (!status.isLoaded) {
        setState((prev) => ({ ...prev, isLoaded: false }));
        return;
      }

      setState({
        isLoaded: true,
        isPlaying: status.isPlaying,
        positionMs: status.positionMillis || 0,
        durationMs: status.durationMillis || 0,
      });

      if (status.didJustFinish) {
        onComplete?.();
      }
    },
    [onComplete]
  );

  const loadAudio = useCallback(
    async (uri: string) => {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );
      soundRef.current = sound;
    },
    [onPlaybackStatusUpdate]
  );

  const play = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.playAsync();
    }
  }, []);

  const pause = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.pauseAsync();
    }
  }, []);

  const stop = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.setPositionAsync(0);
    }
  }, []);

  const seek = useCallback(async (positionMs: number) => {
    if (soundRef.current) {
      await soundRef.current.setPositionAsync(positionMs);
    }
  }, []);

  return {
    ...state,
    play,
    pause,
    stop,
    seek,
    loadAudio,
  };
}
