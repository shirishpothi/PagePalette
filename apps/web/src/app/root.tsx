import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useAsyncError,
  useLocation,
  useRouteError,
} from 'react-router';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  Component,
} from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import './global.css';

import fetch from '@/__create/fetch';
// @ts-ignore
import { SessionProvider } from '@auth/create/react';
import { useNavigate } from 'react-router';
import { Toaster } from 'sonner';
// @ts-ignore
import { LoadFonts } from 'virtual:load-fonts.jsx';
import { HotReloadIndicator } from '../__create/HotReload';
import type { Route } from './+types/root';
import { useDevServerHeartbeat } from '../__create/useDevServerHeartbeat';

export const links = () => [];

if (globalThis.window && globalThis.window !== undefined) {
  globalThis.window.fetch = fetch;
}

const LoadFontsSSR = import.meta.env.SSR ? LoadFonts : null;
if (import.meta.hot) {
  import.meta.hot.on('update-font-links', (urls: string[]) => {
    for (const link of document.querySelectorAll('link[data-auto-font]')) {
      link.remove();
    }

    for (const url of urls) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      link.dataset.autoFont = 'true';
      document.head.appendChild(link);
    }
  });
}

function SharedErrorBoundary({
  isOpen,
  children,
}: {
  isOpen: boolean;
  children?: ReactNode;
}): React.ReactElement {
  return (
    <div
      className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ease-out ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
    >
      <div className="bg-[#18191B] text-[#F2F2F2] rounded-lg p-4 max-w-md w-full mx-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-[#F2F2F2] rounded-full flex items-center justify-center">
              <span className="text-black text-[1.125rem] leading-none">!</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 flex-1">
            <div className="flex flex-col gap-1">
              <p className="font-light text-[#F2F2F2] text-sm">App Error Detected</p>
              <p className="text-[#959697] text-sm font-light">
                It looks like an error occurred while trying to use your app.
              </p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <SharedErrorBoundary isOpen={true} />;
}

function ProductionErrorBoundary() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const animateTimer = setTimeout(() => setIsOpen(true), 100);
    return () => clearTimeout(animateTimer);
  }, []);

  return <SharedErrorBoundary isOpen={isOpen} />;
}

function DevErrorBoundary({ error: errorArg }: { error?: unknown }) {
  const routeError = useRouteError();
  const asyncError = useAsyncError();
  const error = errorArg ?? asyncError ?? routeError;
  const [isOpen, setIsOpen] = useState(false);
  const [devTools, setDevTools] = useState<typeof import('../__create/devTools') | null>(null);

  useEffect(() => {
    import('../__create/devTools').then(setDevTools);
  }, []);

  useEffect(() => {
    const animateTimer = setTimeout(() => setIsOpen(true), 100);
    return () => clearTimeout(animateTimer);
  }, []);

  const handleFix = useCallback(() => {
    devTools?.postFixMessage(error);
    setIsOpen(false);
  }, [error, devTools]);

  const handleShowLogs = useCallback(() => {
    devTools?.postShowLogsMessage();
  }, [devTools]);

  const handleCopy = useCallback(() => {
    devTools?.copyErrorToClipboard(error);
  }, [error, devTools]);

  function isInIframe() {
    try {
      return window.parent !== window;
    } catch {
      return true;
    }
  }

  return (
    <SharedErrorBoundary isOpen={isOpen}>
      {isInIframe() ? (
        <div className="flex gap-2">
          {!!error && (
            <button
              className="flex flex-row items-center justify-center gap-[4px] outline-none transition-colors rounded-[8px] border-[1px] bg-[#f9f9f9] hover:bg-[#dbdbdb] active:bg-[#c4c4c4] border-[#c4c4c4] text-[#18191B] text-sm px-[8px] py-[4px] cursor-pointer"
              type="button"
              onClick={handleFix}
            >
              Try to fix
            </button>
          )}

          <button
            className="flex flex-row items-center justify-center gap-[4px] outline-none transition-colors rounded-[8px] border-[1px] bg-[#2C2D2F] hover:bg-[#414243] active:bg-[#555658] border-[#414243] text-white text-sm px-[8px] py-[4px]"
            type="button"
            onClick={handleShowLogs}
          >
            Show logs
          </button>
        </div>
      ) : (
        <button
          className="flex flex-row items-center justify-center gap-[4px] outline-none transition-colors rounded-[8px] border-[1px] bg-[#2C2D2F] hover:bg-[#414243] active:bg-[#555658] border-[#414243] text-white text-sm px-[8px] py-[4px] w-fit"
          type="button"
          onClick={handleCopy}
        >
          Copy error
        </button>
      )}
    </SharedErrorBoundary>
  );
}

function InternalErrorBoundary({ error }: { error?: unknown }) {
  if (import.meta.env.DEV) {
    return <DevErrorBoundary error={error} />;
  }
  return <ProductionErrorBoundary />;
}

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

type ErrorBoundaryState = { hasError: boolean; error: unknown | null };

class ErrorBoundaryWrapper extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error(error, info);
  }

  render() {
    if (this.state.hasError) {
      return <InternalErrorBoundary error={this.state.error} />;
    }
    return this.props.children;
  }
}

function LoaderWrapper({ loader }: { loader: () => React.ReactNode }) {
  return <>{loader()}</>;
}

type ClientOnlyProps = {
  loader: () => React.ReactNode;
};

export const ClientOnly: React.FC<ClientOnlyProps> = ({ loader }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <ErrorBoundaryWrapper>
      <LoaderWrapper loader={loader} />
    </ErrorBoundaryWrapper>
  );
};

const useHmrConnection = () => {
  const [isHmrConnected, setIsHmrConnected] = useState(
    typeof import.meta.hot?.data?.connected === 'boolean'
      ? import.meta.hot.data.connected
      : false
  );

  useEffect(() => {
    if (!import.meta.hot) return;

    const onConnect = () => {
      if (import.meta.hot) import.meta.hot.data.connected = true;
      setIsHmrConnected(true);
    };
    const onDisconnect = () => {
      if (import.meta.hot) import.meta.hot.data.connected = false;
      setIsHmrConnected(false);
    };

    import.meta.hot.on('vite:ws:connect', onConnect);
    import.meta.hot.on('vite:ws:disconnect', onDisconnect);

    return () => {
      import.meta.hot?.off?.('vite:ws:connect', onConnect);
      import.meta.hot?.off?.('vite:ws:disconnect', onDisconnect);
    };
  }, []);

  return isHmrConnected;
};

const useHandshakeParent = () => {
  const isHmrConnected = useHmrConnection();
  useEffect(() => {
    const healthyResponse = {
      type: 'sandbox:web:healthcheck:response',
      isHmrConnected,
    };
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'sandbox:web:healthcheck') {
        window.parent.postMessage(healthyResponse, '*');
      }
    };
    window.addEventListener('message', handleMessage);
    window.parent.postMessage(healthyResponse, '*');
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [isHmrConnected]);
};

function useDevTools() {
  useEffect(() => {
    if (!import.meta.env.DEV) return;

    let cleanup: (() => void) | undefined;

    import('../__create/devTools').then((module) => {
      cleanup = module.install();
    });

    return () => {
      cleanup?.();
    };
  }, []);
}

export function Layout({ children }: { children: ReactNode }) {
  useHandshakeParent();
  useDevTools();
  useDevServerHeartbeat();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location?.pathname;
  const siteName = 'PagePalette';
  const siteTitle = 'PagePalette | Customizable Student Notebook';
  const siteDescription =
    'PagePalette is a customizable, modular notebook for students with changeable covers, PagePals, and eco-friendly organization.';
  const siteImage = '/marketing-image.png';
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'sandbox:navigation') {
        navigate(event.data.pathname);
      }
    };
    window.addEventListener('message', handleMessage);
    window.parent.postMessage({ type: 'sandbox:web:ready' }, '*');
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [navigate]);

  useEffect(() => {
    if (pathname) {
      window.parent.postMessage(
        {
          type: 'sandbox:web:navigation',
          pathname,
        },
        '*'
      );
    }
  }, [pathname]);
  const isDev = import.meta.env.DEV;
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={siteDescription} />
        <meta name="theme-color" content="#2d3f44" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={siteName} />
        <meta property="og:title" content={siteTitle} />
        <meta property="og:description" content={siteDescription} />
        <meta property="og:image" content={siteImage} />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content={siteTitle} />
        <meta property="twitter:description" content={siteDescription} />
        <meta property="twitter:image" content={siteImage} />
        <title>{siteTitle}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://kit.fontawesome.com" />
        <link rel="dns-prefetch" href="https://challenges.cloudflare.com" />
        <link rel="preload" as="image" href="/marketing-image.png" fetchPriority="high" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Clash+Display:wght@600;700&family=Manrope:wght@400;500;600;700&display=swap"
          media="print"
          // @ts-expect-error - onLoad handler for non-blocking font load
          onLoad="this.media='all'"
        />
        <noscript>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Clash+Display:wght@600;700&family=Manrope:wght@400;500;600;700&display=swap"
          />
        </noscript>
        <Meta />
        <Links />
        {isDev ? (
          <script type="module" src="/src/__create/dev-error-overlay.js"></script>
        ) : null}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        {LoadFontsSSR ? <LoadFontsSSR /> : null}
      </head>
      <body>
        {isDev ? (
          <ClientOnly loader={() => children} />
        ) : (
          children
        )}
        <HotReloadIndicator />
        <Toaster position="bottom-right" />
        <SpeedInsights debug={isDev} />
        <Analytics debug={isDev} />
        <ScrollRestoration />
        <Scripts />
        <script src="https://kit.fontawesome.com/2c15cc0cc7.js" crossOrigin="anonymous" defer />
      </body>
    </html>
  );
}

export default function App() {
  const authEnabled = import.meta.env.NEXT_PUBLIC_AUTH_ENABLED === 'true';
  return authEnabled ? (
    <SessionProvider>
      <Outlet />
    </SessionProvider>
  ) : (
    <Outlet />
  );
}
