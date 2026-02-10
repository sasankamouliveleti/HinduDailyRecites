import { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import Animated, { FadeIn } from 'react-native-reanimated';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { StreaksProvider } from './src/contexts/StreaksContext';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Simulate brief loading (data hydration, etc.)
    const timer = setTimeout(() => setAppReady(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appReady) {
      await SplashScreen.hideAsync();
    }
  }, [appReady]);

  if (!appReady) return null;

  return (
    <Animated.View style={{ flex: 1 }} entering={FadeIn.duration(400)} onLayout={onLayoutRootView}>
      <StatusBar style="light" />
      <AuthProvider>
        <StreaksProvider>
          <AppNavigator />
        </StreaksProvider>
      </AuthProvider>
    </Animated.View>
  );
}
