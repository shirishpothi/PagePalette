import { useState, useCallback, useRef } from 'react';

const TURNSTILE_SITE_KEY = '0x4AAAAAACN49-iUb83zDBAn';

export function useTurnstile() {
  const [token, setToken] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState(null);
  const widgetIdRef = useRef(null);
  const containerRef = useRef(null);

  const loadTurnstileScript = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (window.turnstile) {
        resolve();
        return;
      }

      const existingScript = document.querySelector('script[src*="turnstile"]');
      if (existingScript) {
        existingScript.addEventListener('load', resolve);
        existingScript.addEventListener('error', reject);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }, []);

  const verify = useCallback(async () => {
    if (token) {
      return token;
    }

    setIsVerifying(true);
    setError(null);

    try {
      await loadTurnstileScript();

      return new Promise((resolve, reject) => {
        if (!containerRef.current) {
          containerRef.current = document.createElement('div');
          containerRef.current.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9999;';
          document.body.appendChild(containerRef.current);
        }

        const timeout = setTimeout(() => {
          setError('Verification timed out. Please try again.');
          setIsVerifying(false);
          reject(new Error('Turnstile timeout'));
        }, 30000);

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (newToken) => {
            clearTimeout(timeout);
            setToken(newToken);
            setIsVerifying(false);
            if (containerRef.current) {
              containerRef.current.remove();
              containerRef.current = null;
            }
            resolve(newToken);
          },
          'error-callback': () => {
            clearTimeout(timeout);
            setError('Verification failed. Please try again.');
            setIsVerifying(false);
            reject(new Error('Turnstile error'));
          },
          'expired-callback': () => {
            setToken(null);
          },
          theme: 'dark',
          size: 'normal',
        });
      });
    } catch (err) {
      setError('Failed to load verification. Please try again.');
      setIsVerifying(false);
      throw err;
    }
  }, [token, loadTurnstileScript]);

  const reset = useCallback(() => {
    setToken(null);
    setError(null);
    if (widgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.reset(widgetIdRef.current);
      } catch (e) {
        // Widget may not exist
      }
    }
  }, []);

  return {
    token,
    isVerifying,
    error,
    verify,
    reset,
  };
}
