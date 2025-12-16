import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMemo } from 'react';

// Create QueryClient singleton for SSR-safe usage
let queryClientSingleton = null;
const getQueryClient = () => {
  // For SSR, always create a new QueryClient
  if (typeof window === 'undefined') {
    return new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 5, // 5 minutes
          gcTime: 1000 * 60 * 30, // 30 minutes
          retry: 1,
          refetchOnWindowFocus: false,
          refetchOnMount: false,
        },
      },
    });
  }
  // For CSR, use singleton pattern
  if (!queryClientSingleton) {
    queryClientSingleton = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 5, // 5 minutes
          gcTime: 1000 * 60 * 30, // 30 minutes
          retry: 1,
          refetchOnWindowFocus: false,
          refetchOnMount: false,
        },
      },
    });
  }
  return queryClientSingleton;
};

export default function RootLayout({children}) {
  const queryClient = useMemo(() => getQueryClient(), []);
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}