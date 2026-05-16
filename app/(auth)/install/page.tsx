'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { detectPlatform } from '@/lib/platform';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export default function InstallPage() {
  const router = useRouter();
  const [platform, setPlatform] = useState<ReturnType<typeof detectPlatform> | null>(null);
  const [copied, setCopied] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);
  const [promptReady, setPromptReady] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      router.replace('/now');
      return;
    }

    const detected = detectPlatform(navigator.userAgent, isStandalone);
    setPlatform(detected);

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      setPromptReady(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [router]);

  async function handleInstall() {
    if (deferredPrompt.current) {
      await deferredPrompt.current.prompt();
      const choice = await deferredPrompt.current.userChoice;
      if (choice.outcome === 'accepted') {
        router.push('/now');
      }
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.origin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!platform) return null;

  return (
    <div style={{ width: '100%', maxWidth: 400, padding: '0 24px' }}>
      {/* Wordmark */}
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 28,
            fontWeight: 600,
            color: 'var(--iron-gall)',
            margin: 0,
          }}
        >
          Tend<span style={{ color: 'var(--bordeaux)' }}>.</span>
        </h1>
      </div>

      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontStyle: 'italic',
          fontSize: 16,
          color: 'var(--text-secondary)',
          textAlign: 'center',
          margin: '0 0 32px 0',
        }}
      >
        Install for the best experience.
      </p>

      {/* Android Chrome */}
      {platform.isAndroid && platform.isChrome && (
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleInstall}
            disabled={!promptReady}
            style={{
              width: '100%',
              fontFamily: 'var(--font-display)',
              fontSize: 15,
              fontWeight: 600,
              padding: '10px 18px',
              minHeight: 44,
              background: promptReady ? 'var(--forest)' : 'var(--slate)',
              color: 'var(--vellum)',
              border: 'none',
              borderRadius: 4,
              cursor: promptReady ? 'pointer' : 'not-allowed',
            }}
          >
            {promptReady ? 'Install Tend.' : 'Preparing install...'}
          </button>
        </div>
      )}

      {/* iOS Safari */}
      {platform.isIOS && platform.isSafari && (
        <div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 19,
              fontWeight: 600,
              color: 'var(--iron-gall)',
              margin: '0 0 16px 0',
            }}
          >
            Add to Home Screen
          </h2>
          <ol
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 16,
              color: 'var(--iron-gall)',
              paddingLeft: 20,
              lineHeight: 1.8,
            }}
          >
            <li>
              Tap the <strong>Share</strong> button (square with arrow)
            </li>
            <li>
              Scroll down and tap <strong>Add to Home Screen</strong>
            </li>
            <li>
              Tap <strong>Add</strong>
            </li>
            <li>Open Tend. from your home screen</li>
          </ol>
        </div>
      )}

      {/* iOS non-Safari */}
      {platform.isIOS && !platform.isSafari && (
        <div style={{ textAlign: 'center' }}>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 16,
              color: 'var(--iron-gall)',
              marginBottom: 16,
            }}
          >
            Open this page in <strong>Safari</strong> to install Tend.
          </p>
          <button
            onClick={copyLink}
            style={{
              width: '100%',
              fontFamily: 'var(--font-display)',
              fontSize: 15,
              fontWeight: 600,
              padding: '10px 18px',
              minHeight: 44,
              background: 'var(--forest)',
              color: 'var(--vellum)',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            {copied ? 'Link Copied!' : 'Copy Link'}
          </button>
        </div>
      )}

      {/* Desktop */}
      {!platform.isIOS && !platform.isAndroid && (
        <div style={{ textAlign: 'center' }}>
          {promptReady ? (
            <button
              onClick={handleInstall}
              style={{
                width: '100%',
                fontFamily: 'var(--font-display)',
                fontSize: 15,
                fontWeight: 600,
                padding: '10px 18px',
                minHeight: 44,
                background: 'var(--forest)',
                color: 'var(--vellum)',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              Install Tend.
            </button>
          ) : (
            <>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 16,
                  color: 'var(--iron-gall)',
                  marginBottom: 16,
                }}
              >
                Works great in the browser.
              </p>
              <button
                onClick={() => router.push('/now')}
                style={{
                  width: '100%',
                  fontFamily: 'var(--font-display)',
                  fontSize: 15,
                  fontWeight: 600,
                  padding: '10px 18px',
                  minHeight: 44,
                  background: 'var(--forest)',
                  color: 'var(--vellum)',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                Continue
              </button>
            </>
          )}
        </div>
      )}

      {/* Skip */}
      <p style={{ textAlign: 'center', marginTop: 24 }}>
        <button
          onClick={() => router.push('/now')}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            color: 'var(--text-secondary)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          Skip for now
        </button>
      </p>
    </div>
  );
}
