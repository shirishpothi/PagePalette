
import { useAuth } from '@/utils/auth/useAuth';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useCallback, useMemo, useRef } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InteractionManager, Platform } from 'react-native';

// Only prevent auto-hide on native platforms (blocks first paint on web)
if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync();
}

// Create QueryClient outside component to avoid recreation on re-renders
let queryClientSingleton = null;
const getQueryClient = () => {
  if (!queryClientSingleton) {
    queryClientSingleton = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 5,
          gcTime: 1000 * 60 * 30,
          retry: 1,
          refetchOnWindowFocus: false,
          refetchOnMount: false,
          refetchOnReconnect: false,
          networkMode: 'offlineFirst',
        },
        mutations: {
          retry: 0,
        },
      },
    });
  }
  return queryClientSingleton;
};

// Minimum time to show splash on native (prevents flash)
const MIN_SPLASH_TIME = Platform.OS === 'web' ? 0 : 300;

export default function RootLayout() {
  const { initiate, isReady } = useAuth();
  const queryClient = useMemo(() => getQueryClient(), []);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    initiate();
  }, [initiate]);

  const hideSplash = useCallback(() => {
    if (Platform.OS === 'web') {
      SplashScreen.hideAsync();
      return;
    }
    
    const elapsed = Date.now() - startTimeRef.current;
    const remaining = Math.max(0, MIN_SPLASH_TIME - elapsed);
    
    const doHide = () => {
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
