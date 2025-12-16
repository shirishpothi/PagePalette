import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export const authKey = `${process.env.EXPO_PUBLIC_PROJECT_GROUP_ID}-jwt`;

// Cache auth to avoid repeated SecureStore reads
let authCache = null;
let authCacheInitialized = false;

// Pre-fetch auth on module load for faster initial render
const prefetchAuth = () => {
  if (authCacheInitialized) return Promise.resolve(authCache);
  
  return SecureStore.getItemAsync(authKey)
    .then((auth) => {
      authCache = auth ? JSON.parse(auth) : null;
      authCacheInitialized = true;
      return authCache;
    })
    .catch(() => {
      authCacheInitialized = true;
      return null;
    });
};

// Start prefetching immediately
prefetchAuth();

/**
 * This store manages the authentication state of the application.
 */
export const useAuthStore = create((set) => ({
  isReady: false,
  auth: null,
  setAuth: (auth) => {
    // Update cache immediately
    authCache = auth;
    
    // Persist to SecureStore asynchronously (don't block UI)
    if (auth) {
      SecureStore.setItemAsync(authKey, JSON.stringify(auth)).catch(() => {});
    } else {
      SecureStore.deleteItemAsync(authKey).catch(() => {});
    }
    set({ auth });
  },
  // Optimized initiate using prefetched cache
  initFromCache: () => {
    if (authCacheInitialized) {
      return { auth: authCache, isReady: true };
    }
    return null;
  },
}));

// Export prefetch for manual use if needed
export const prefetchAuthData = prefetchAuth;

/**
 * This store manages the state of the authentication modal.
 */
export const useAuthModal = create((set) => ({
  isOpen: false,
  mode: 'signup',
  open: (options) => set({ isOpen: true, mode: options?.mode || 'signup' }),
  close: () => set({ isOpen: false }),
}));