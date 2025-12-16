
import { useAuth } from '@/utils/auth/useAuth';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useCallback, useMemo, useRef, startTransition } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InteractionManager, Platform } from 'react-native';

// Prevent splash screen from auto-hiding until we're ready
SplashScreen.preventAutoHideAsync();

// Create QueryClient outside component to avoid recreation on re-renders
// Using useMemo pattern for SSR-safe singleton
let queryClientSingleton = null;
const getQueryClient = () => {
  if (!queryClientSingleton) {
    queryClientSingleton = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 5, // 5 minutes
          gcTime: 1000 * 60 * 30, // 30 minutes (renamed from cacheTime in v5)
          retry: 1,
          refetchOnWindowFocus: false,
          // Optimize for faster initial load
          refetchOnMount: false,
          refetchOnReconnect: false,
          // Network-only mode to speed up initial render
          networkMode: 'offlineFirst',
        },
        mutations: {
          // Don't retry mutations by default
          retry: 0,
        },
      },
    });
  }
  return queryClientSingleton;
};

// Minimum time to show splash (prevents flash)
const MIN_SPLASH_TIME = Platform.OS === 'web' ? 0 : 300;

export default function RootLayout() {
  const { initiate, isReady } = useAuth();
  const queryClient = useMemo(() => getQueryClient(), []);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    // Initialize auth immediately using startTransition for better responsiveness
    startTransition(() => {
      initiate();
    });
  }, [initiate]);

  const hideSplash = useCallback(() => {
    // Ensure minimum splash time to prevent jarring flash
    const elapsed = Date.now() - startTimeRef.current;
    const remaining = Math.max(0, MIN_SPLASH_TIME - elapsed);
    
    const doHide = () => {
      // Use InteractionManager to defer splash hide until after animations
      InteractionManager.runAfterInteractions(() => {
        SplashScreen.hideAsync();
      });
    };
    
    if (remaining > 0) {
      setTimeout(doHide, remaining);
    } else {
      doHide();
    }
  }, []);

  useEffect(() => {
    if (isReady) {
      hideSplash();
    }
  }, [isReady, hideSplash]);

  if (!isReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }} initialRouteName="index">
          <Stack.Screen name="index" />
        </Stack>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
