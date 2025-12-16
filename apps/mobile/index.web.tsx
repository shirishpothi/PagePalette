import '@expo/metro-runtime';
import { toPng } from 'html-to-image';
import { serializeError } from 'serialize-error';
import React, { useEffect, useState, Suspense, lazy, startTransition } from 'react';
import './__create/consoleToParent';
import { renderRootComponent } from 'expo-router/build/renderRootComponent';

import { LoadSkiaWeb } from '@shopify/react-native-skia/lib/module/web';
import './__create/reset.css';

// Lazy load the main app to allow faster initial render
const CreateApp = lazy(() => import('./App'));

// Preload fonts early using link preload for faster FCP
if (typeof document !== 'undefined') {
  const fontPreload = document.createElement('link');
  fontPreload.rel = 'preload';
  fontPreload.as = 'style';
  fontPreload.href = 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap';
  document.head.appendChild(fontPreload);
}
// Cache for inlined fonts to avoid re-fetching
let fontsCached = false;

async function inlineGoogleFonts(): Promise<void> {
  // Skip if already processed
  if (fontsCached) return;
  fontsCached = true;

  // Find all <link> elements that load Google Fonts CSS
  const links = Array.from(document.querySelectorAll<HTMLLinkElement>(
    'link[rel="stylesheet"][href*="fonts.googleapis.com"]'
  ));

  // Process fonts concurrently for faster loading
  await Promise.all(links.map(async (link) => {
    try {
      const href = link.href;
      const res = await fetch(href, { 
        cache: 'force-cache',
        priority: 'low' as RequestPriority 
      });
      let cssText = await res.text();

      // Ensure font URLs are absolute
      cssText = cssText.replace(/url\(([^)]+)\)/g, (match, url) => {
        const clean = url.replace(/["']/g, "");
        if (clean.startsWith("http")) {
          return `url(${clean})`;
        }
        return `url(${new URL(clean, href).toString()})`;
      });

      // Inject <style> with the CSS
      const style = document.createElement("style");
      style.textContent = cssText;
      document.head.appendChild(style);
    } catch (err) {
      // Silent fail - fonts will still work via link tag
    }
  }));

  // Wait for all fonts to actually load
  if ("fonts" in document) {
    await document.fonts.ready;
  }
}


const waitForScreenshotReady = async () => {
  const images = Array.from(document.images);

  await Promise.all([
    inlineGoogleFonts(),
    ...images.map(
      (img) =>
        new Promise((resolve) => {
          img.crossOrigin = "anonymous";
          if (img.complete) {
            resolve(true);
            return;
          }
          img.onload = () => resolve(true);
          img.onerror = () => resolve(true);
        })
    )
  ]);

  // small buffer to ensure rendering is stable
  await new Promise((resolve) => setTimeout(resolve, 250));
};

export const useHandleScreenshotRequest = () => {
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data.type === "sandbox:web:screenshot:request") {
        try {
          await waitForScreenshotReady();

          const width = window.innerWidth;
          const height = window.innerHeight;
          const app = document.querySelector<HTMLElement>('#root')
          if (!app) {
            throw new Error("Could not find app element");
          }

          // html-to-image already handles CORS, fonts, and CSS inlining
          const dataUrl = await toPng(app, {
            cacheBust: true,
            skipFonts: false,
            width,
            height,
            style: {
              // force snapshot sizing
              width: `${width}px`,
              height: `${height}px`,
              margin: "0",
            },
          });

          window.parent.postMessage(
            { type: "sandbox:web:screenshot:response", dataUrl },
            "*"
          );
        } catch (error) {
          window.parent.postMessage(
            {
              type: "sandbox:web:screenshot:error",
              error: error instanceof Error ? error.message : String(error),
            },
            "*"
          );
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);
};
// Minimal loading indicator that shows immediately
const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: '100vh',
    backgroundColor: '#fff'
  }}>
    <div style={{ 
      width: 40, 
      height: 40, 
      border: '3px solid #f3f3f3',
      borderTop: '3px solid #3498db',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
  </div>
);

const CreateAppWithFonts = () => {
  const [skiaReady, setSkiaReady] = useState(false);
  
  useEffect(() => {
    // Load Skia in background without blocking render
    LoadSkiaWeb().then(() => {
      startTransition(() => {
        setSkiaReady(true);
      });
    });
  }, []);
  
  useHandleScreenshotRequest();
  
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CreateApp />
    </Suspense>
  );
};

// Render immediately without waiting for Skia
renderRootComponent(CreateAppWithFonts);
