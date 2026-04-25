'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    grecaptcha?: {
      render: (
        container: HTMLElement,
        parameters: {
          sitekey: string;
          callback: (token: string) => void;
          'expired-callback': () => void;
          'error-callback': () => void;
          theme: 'light' | 'dark';
        }
      ) => number;
      reset: (widgetId?: number) => void;
    };
    __recaptchaScriptPromise?: Promise<void>;
  }
}

interface RecaptchaWidgetProps {
  onTokenChange: (token: string | null) => void;
}

function loadRecaptchaScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  if (window.grecaptcha) {
    return Promise.resolve();
  }

  if (window.__recaptchaScriptPromise) {
    return window.__recaptchaScriptPromise;
  }

  window.__recaptchaScriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load captcha script'));
    document.head.appendChild(script);
  });

  return window.__recaptchaScriptPromise;
}

export function RecaptchaWidget({ onTokenChange }: RecaptchaWidgetProps) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!siteKey) {
      return;
    }

    let isMounted = true;

    const renderCaptcha = async () => {
      try {
        await loadRecaptchaScript();
        if (!isMounted || !containerRef.current || !window.grecaptcha) {
          return;
        }

        widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token: string) => onTokenChange(token),
          'expired-callback': () => onTokenChange(null),
          'error-callback': () => onTokenChange(null),
          theme: 'light'
        });
      } catch {
        setLoadError('Unable to load captcha. Please refresh and try again.');
      }
    };

    renderCaptcha();

    return () => {
      isMounted = false;
      if (window.grecaptcha && widgetIdRef.current !== null) {
        window.grecaptcha.reset(widgetIdRef.current);
      }
    };
  }, [onTokenChange, siteKey]);

  if (!siteKey) {
    return <p className="text-sm text-destructive">Captcha is not configured. Missing NEXT_PUBLIC_RECAPTCHA_SITE_KEY.</p>;
  }

  if (loadError) {
    return <p className="text-sm text-destructive">{loadError}</p>;
  }

  return <div ref={containerRef} className="min-h-[78px]" />;
}
