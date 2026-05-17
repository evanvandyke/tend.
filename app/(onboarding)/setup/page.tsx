'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Module {
  slug: string;
  name: string;
  description: string;
  region?: string;
  taskCount: number;
  enabled: boolean;
}

const MODULE_COLORS: Record<string, string> = {
  'lawn-utah': 'var(--forest)',
  garden: 'var(--mustard)',
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  // Step 1: Location
  const [zip, setZip] = useState('');
  const [savingZip, setSavingZip] = useState(false);

  // Step 2: Modules
  const [modules, setModules] = useState<Module[]>([]);
  const [loadingModules, setLoadingModules] = useState(true);

  // Step 3: Notifications
  const [notifState, setNotifState] = useState<'idle' | 'loading' | 'granted' | 'denied'>('idle');
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);
  }, []);

  const goTo = useCallback((nextStep: number, dir: 'forward' | 'back') => {
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setStep(nextStep);
      setAnimating(false);
    }, 200);
  }, []);

  // Fetch modules on mount
  useEffect(() => {
    fetch('/api/modules')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setModules(data);
        setLoadingModules(false);
      })
      .catch(() => setLoadingModules(false));
  }, []);

  async function handleSaveZip() {
    if (zip.length !== 5) return;
    setSavingZip(true);
    try {
      await fetch('/api/settings/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationZip: zip }),
      });
    } catch {
      // Non-blocking — settings can be updated later
    }
    setSavingZip(false);
    goTo(2, 'forward');
  }

  async function handleToggleModule(slug: string, enabled: boolean) {
    setModules((prev) => prev.map((m) => (m.slug === slug ? { ...m, enabled } : m)));
    await fetch('/api/modules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moduleSlug: slug, enabled }),
    });
  }

  async function handleEnableNotifications() {
    setNotifState('loading');
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setNotifState('denied');
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        setNotifState('denied');
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      const json = subscription.toJSON();
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: { p256dh: json.keys?.p256dh, auth: json.keys?.auth },
        }),
      });

      await fetch('/api/settings/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pushNotificationsEnabled: true }),
      });

      setNotifState('granted');
    } catch {
      setNotifState('denied');
    }
  }

  const containerStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: 400,
    padding: '0 24px',
    opacity: animating ? 0 : 1,
    transform: animating
      ? direction === 'forward'
        ? 'translateX(20px)'
        : 'translateX(-20px)'
      : 'translateX(0)',
    transition: 'opacity 0.2s ease, transform 0.2s ease',
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontSize: 24,
    fontWeight: 600,
    color: 'var(--iron-gall)',
    margin: '0 0 8px 0',
    textAlign: 'center',
  };

  const subtitleStyle: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: 15,
    color: 'var(--text-secondary)',
    textAlign: 'center',
    margin: '0 0 32px 0',
    lineHeight: 1.5,
  };

  const buttonStyle: React.CSSProperties = {
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
  };

  const backStyle: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: 14,
    color: 'var(--text-secondary)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'underline',
  };

  return (
    <div style={containerStyle}>
      {/* Step indicator */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 8,
          marginBottom: 32,
        }}
      >
        {(isStandalone ? [1, 2, 3, 4] : [1, 2, 4]).map((s) => (
          <div
            key={s}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: s === step ? 'var(--forest)' : 'var(--hairline)',
              transition: 'background 0.2s ease',
            }}
          />
        ))}
      </div>

      {/* Step 1: Location */}
      {step === 1 && (
        <div>
          <h1 style={titleStyle}>Where are you?</h1>
          <p style={subtitleStyle}>
            Your ZIP code helps us show local weather and calculate frost dates for your garden.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <input
              type="text"
              inputMode="numeric"
              maxLength={5}
              value={zip}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 5);
                setZip(val);
              }}
              placeholder="ZIP code"
              style={{
                width: 160,
                fontFamily: 'var(--font-body)',
                fontSize: 18,
                padding: '10px 12px',
                minHeight: 44,
                background: 'var(--vellum)',
                border: '1px solid var(--hairline)',
                borderRadius: 4,
                color: 'var(--iron-gall)',
                textAlign: 'center',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            onClick={handleSaveZip}
            disabled={zip.length !== 5 || savingZip}
            style={{
              ...buttonStyle,
              background: zip.length === 5 ? 'var(--forest)' : 'var(--slate)',
              cursor: zip.length === 5 ? 'pointer' : 'not-allowed',
            }}
          >
            {savingZip ? 'Saving...' : 'Next'}
          </button>
        </div>
      )}

      {/* Step 2: Modules */}
      {step === 2 && (
        <div>
          <h1 style={titleStyle}>What do you tend?</h1>
          <p style={subtitleStyle}>
            Turn on the routines you&rsquo;d like to follow. You can change these anytime.
          </p>

          {loadingModules ? (
            <p style={{ textAlign: 'center', fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}>
              Loading...
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              {modules.map((mod) => (
                <div
                  key={mod.slug}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '14px 16px',
                    background: 'var(--vellum)',
                    border: '1px solid var(--hairline)',
                    borderRadius: 4,
                  }}
                >
                  {/* Color dot */}
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: MODULE_COLORS[mod.slug] || 'var(--forest)',
                      flexShrink: 0,
                    }}
                  />

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 15,
                        fontWeight: 600,
                        color: 'var(--iron-gall)',
                      }}
                    >
                      {mod.name}
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 13,
                        color: 'var(--text-secondary)',
                        marginTop: 2,
                      }}
                    >
                      {mod.description}
                    </div>
                  </div>

                  {/* Toggle */}
                  <button
                    onClick={() => handleToggleModule(mod.slug, !mod.enabled)}
                    style={{
                      width: 44,
                      height: 26,
                      borderRadius: 13,
                      border: 'none',
                      background: mod.enabled ? 'var(--forest)' : 'var(--hairline)',
                      position: 'relative',
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'background 0.2s ease',
                    }}
                  >
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: 'white',
                        position: 'absolute',
                        top: 3,
                        left: mod.enabled ? 21 : 3,
                        transition: 'left 0.2s ease',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      }}
                    />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button onClick={() => goTo(isStandalone ? 3 : 4, 'forward')} style={buttonStyle}>
            Next
          </button>

          <p style={{ textAlign: 'center', marginTop: 16 }}>
            <button onClick={() => goTo(1, 'back')} style={backStyle}>
              Back
            </button>
          </p>
        </div>
      )}

      {/* Step 3: Notifications */}
      {step === 3 && (
        <div>
          <h1 style={titleStyle}>Stay in the loop</h1>
          <p style={subtitleStyle}>
            Get a weekend summary of what needs attention in your yard, every Friday at 5 PM.
          </p>

          {notifState === 'granted' ? (
            <>
              <div
                style={{
                  textAlign: 'center',
                  fontFamily: 'var(--font-body)',
                  fontSize: 16,
                  color: 'var(--forest)',
                  marginBottom: 24,
                  padding: '16px',
                }}
              >
                You&rsquo;re all set! 🔔
              </div>
              <button onClick={() => goTo(4, 'forward')} style={buttonStyle}>
                Next
              </button>
            </>
          ) : (
            <div>
              <button
                onClick={handleEnableNotifications}
                disabled={notifState === 'loading'}
                style={{
                  ...buttonStyle,
                  background: notifState === 'loading' ? 'var(--slate)' : 'var(--forest)',
                  cursor: notifState === 'loading' ? 'not-allowed' : 'pointer',
                }}
              >
                {notifState === 'loading' ? 'Enabling...' : 'Enable notifications'}
              </button>

              {notifState === 'denied' && (
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 13,
                    color: 'var(--text-secondary)',
                    textAlign: 'center',
                    marginTop: 8,
                  }}
                >
                  Notifications were blocked. You can enable them later in Settings.
                </p>
              )}

              <p style={{ textAlign: 'center', marginTop: 16 }}>
                <button
                  onClick={() => goTo(4, 'forward')}
                  style={backStyle}
                >
                  Skip
                </button>
              </p>
            </div>
          )}

          <p style={{ textAlign: 'center', marginTop: 16 }}>
            <button onClick={() => goTo(2, 'back')} style={backStyle}>
              Back
            </button>
          </p>
        </div>
      )}

      {/* Step 4: Ready */}
      {step === 4 && (
        <div>
          <h1 style={titleStyle}>You&rsquo;re all set</h1>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 15,
                  fontWeight: 600,
                  color: 'var(--iron-gall)',
                  marginBottom: 4,
                }}
              >
                Now
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 14,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.4,
                }}
              >
                Your daily view. Tasks that need attention this week show up here automatically.
              </div>
            </div>

            <div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 15,
                  fontWeight: 600,
                  color: 'var(--iron-gall)',
                  marginBottom: 4,
                }}
              >
                Tasks
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 14,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.4,
                }}
              >
                One-off and recurring to-dos that aren&rsquo;t part of a bigger project.
              </div>
            </div>

            <div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 15,
                  fontWeight: 600,
                  color: 'var(--iron-gall)',
                  marginBottom: 4,
                }}
              >
                Projects
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 14,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.4,
                }}
              >
                Multi-step efforts like building a raised bed or installing irrigation.
              </div>
            </div>

            <div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 15,
                  fontWeight: 600,
                  color: 'var(--iron-gall)',
                  marginBottom: 4,
                }}
              >
                Routines
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 14,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.4,
                }}
              >
                Seasonal care schedules — like lawn care and garden tasks — tailored to your location.
              </div>
            </div>
          </div>

          <button
            onClick={async () => {
              await fetch('/api/settings/onboarding', { method: 'POST' });
              router.push('/now');
            }}
            style={buttonStyle}
          >
            Let&rsquo;s go
          </button>

          <p style={{ textAlign: 'center', marginTop: 16 }}>
            <button onClick={() => goTo(isStandalone ? 3 : 2, 'back')} style={backStyle}>
              Back
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
