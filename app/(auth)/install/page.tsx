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

  const stepStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  };

  const stepIconStyle: React.CSSProperties = {
    flexShrink: 0,
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: 'var(--forest)',
    color: 'var(--vellum)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 600,
    fontFamily: 'var(--font-display)',
  };

  const stepTextStyle: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: 15,
    color: 'var(--iron-gall)',
    lineHeight: 1.5,
    paddingTop: 5,
  };

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
          fontSize: 16,
          color: 'var(--text-secondary)',
          textAlign: 'center',
          margin: '0 0 32px 0',
          lineHeight: 1.5,
        }}
      >
        Add Tend to your home screen for the full experience&mdash;it opens like a real app, no app store needed.
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
            {promptReady ? 'Add to Home Screen' : 'One moment...'}
          </button>
        </div>
      )}

      {/* iOS Safari */}
      {platform.isIOS && platform.isSafari && (
        <div>
          <div style={stepStyle}>
            <div style={stepIconStyle}>1</div>
            <p style={stepTextStyle}>
              Tap the <strong>Share</strong> button at the bottom of your screen
              <span style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                (the square with an arrow pointing up)
              </span>
            </p>
          </div>

          <div style={stepStyle}>
            <div style={stepIconStyle}>2</div>
            <p style={stepTextStyle}>
              Scroll down and tap <strong>Add to Home Screen</strong>
            </p>
          </div>

          <div style={stepStyle}>
            <div style={stepIconStyle}>3</div>
            <p style={stepTextStyle}>
              Tap <strong>Add</strong> in the top corner
            </p>
          </div>

          <div style={stepStyle}>
            <div style={stepIconStyle}>4</div>
            <p style={stepTextStyle}>
              Open Tend from your home screen&mdash;that&rsquo;s it!
            </p>
          </div>
        </div>
      )}

      {/* iOS non-Safari */}
      {platform.isIOS && !platform.isSafari && (
        <div style={{ textAlign: 'center' }}>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 15,
              color: 'var(--iron-gall)',
              marginBottom: 16,
              lineHeight: 1.5,
            }}
          >
            To add Tend to your home screen, you&rsquo;ll need to open this link in <strong>Safari</strong>.
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
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              color: 'var(--text-secondary)',
              marginTop: 10,
            }}
          >
            Paste it into Safari&rsquo;s address bar
          </p>
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
              Add to Home Screen
            </button>
          ) : (
            <>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 15,
                  color: 'var(--iron-gall)',
                  marginBottom: 16,
                  lineHeight: 1.5,
                }}
              >
                Tend works great in the browser too.
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

      {/* Continue in browser */}
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
          I&rsquo;ll do this later
        </button>
      </p>
    </div>
  );
}
