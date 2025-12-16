
import { useAuth } from '@/utils/auth/useAuth';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useCallback, useMemo } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InteractionManager } from 'react-native';

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
        },
      },
    });
  }
  return queryClientSingleton;
};

export default function RootLayout() {
  const { initiate, isReady } = useAuth();
  const queryClient = useMemo(() => getQueryClient(), []);

  useEffect(() => {
    // Initialize auth immediately
    initiate();
  }, [initiate]);

  const hideSplash = useCallback(() => {
    // Use InteractionManager to defer splash hide until after animations
    InteractionManager.runAfterInteractions(() => {
      SplashScreen.hideAsync();
    });
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
