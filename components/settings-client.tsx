'use client';

import React, { useState, useTransition } from 'react';
import { SectionHeader } from '@/components/section-header';
import { usePushSubscription } from '@/lib/hooks/use-push-subscription';

interface SettingsUser {
  id: string;
  email: string;
  name: string | null;
  locationZip: string | null;
  pushNotificationsEnabled: boolean;
}

interface SettingsClientProps {
  user: SettingsUser;
  enabledModules: string[];
}

const ALL_MODULES = [
  { slug: 'lawn-utah', label: 'Lawn (Utah)' },
  { slug: 'garden', label: 'Garden' },
];

export function SettingsClient({ user, enabledModules }: SettingsClientProps) {
  const { isSupported, isSubscribed, permission, subscribe } = usePushSubscription();
  const [pushEnabled, setPushEnabled] = useState(user.pushNotificationsEnabled);
  const [isPending, startTransition] = useTransition();
  const [subscribing, setSubscribing] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data.error || 'Failed to change password');
      } else {
        setPasswordSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setPasswordError('Network error. Please try again.');
    } finally {
      setChangingPassword(false);
    }
  }

  async function handlePushToggle(enabled: boolean) {
    setPushEnabled(enabled);
    startTransition(async () => {
      await fetch('/api/settings/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pushNotificationsEnabled: enabled }),
      });
    });
  }

  async function handleSubscribe() {
    setSubscribing(true);
    await subscribe();
    setSubscribing(false);
  }

  async function handleSignOut() {
    window.location.href = '/api/auth/signout';
  }

  return (
    <main className="flex-1 overflow-y-auto pb-[100px] px-4">
      {/* Notifications Section */}
      <SectionHeader title="Notifications" />

      <div className="space-y-3 mt-2">
        {/* Push toggle */}
        <div className="flex items-center justify-between py-3 px-4 bg-white/60 rounded-lg border border-[var(--hairline)]">
          <div>
            <p className="font-[family-name:var(--font-body)] text-[15px] text-[var(--iron-gall)]">
              Push Notifications
            </p>
            <p className="font-[family-name:var(--font-body)] text-[12px] text-[var(--sepia)] mt-0.5">
              Frost warnings, lunar events, task reminders
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              role="switch"
              aria-checked={pushEnabled}
              className="sr-only peer"
              checked={pushEnabled}
              onChange={(e) => handlePushToggle(e.target.checked)}
              disabled={isPending}
            />
            <div className="w-[44px] h-[24px] bg-[var(--hairline)] peer-checked:bg-[var(--bordeaux)] rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-[20px] after:w-[20px] after:transition-transform peer-checked:after:translate-x-[22px]" />
          </label>
        </div>

        {/* Subscription status */}
        {isSupported && !isSubscribed && (
          <div className="py-3 px-4 bg-white/60 rounded-lg border border-[var(--hairline)]">
            <p className="font-[family-name:var(--font-body)] text-[13px] text-[var(--sepia)] mb-2">
              {permission === 'denied'
                ? 'Push notifications are blocked. Please enable them in your browser settings.'
                : 'Enable push notifications on this device to receive alerts.'}
            </p>
            {permission !== 'denied' && (
              <button
                onClick={handleSubscribe}
                disabled={subscribing}
                className="font-[family-name:var(--font-display)] text-[13px] font-semibold uppercase tracking-[0.1em] text-white bg-[var(--bordeaux)] px-4 py-2 rounded-md disabled:opacity-50 transition-opacity"
              >
                {subscribing ? 'Subscribing...' : 'Enable Push Notifications'}
              </button>
            )}
          </div>
        )}

        {isSupported && isSubscribed && (
          <div className="py-3 px-4 bg-white/60 rounded-lg border border-[var(--hairline)]">
            <p className="font-[family-name:var(--font-body)] text-[13px] text-[var(--sage)]">
              ✓ Push notifications active on this device
            </p>
          </div>
        )}

        {!isSupported && (
          <div className="py-3 px-4 bg-white/60 rounded-lg border border-[var(--hairline)]">
            <p className="font-[family-name:var(--font-body)] text-[13px] text-[var(--sepia)]">
              Push notifications are not supported on this browser.
            </p>
          </div>
        )}
      </div>

      {/* Modules Section */}
      <SectionHeader title="Modules" />

      <div className="space-y-2 mt-2">
        {ALL_MODULES.map((mod) => (
          <div
            key={mod.slug}
            className="flex items-center justify-between py-3 px-4 bg-white/60 rounded-lg border border-[var(--hairline)]"
          >
            <p className="font-[family-name:var(--font-body)] text-[15px] text-[var(--iron-gall)]">
              {mod.label}
            </p>
            <span
              className={`font-[family-name:var(--font-body)] text-[12px] px-2 py-0.5 rounded-full ${
                enabledModules.includes(mod.slug)
                  ? 'bg-[var(--sage)]/20 text-[var(--sage)]'
                  : 'bg-[var(--hairline)] text-[var(--sepia)]'
              }`}
            >
              {enabledModules.includes(mod.slug) ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        ))}
        <p className="font-[family-name:var(--font-body)] text-[12px] text-[var(--sepia)] px-4 pt-1">
          Manage modules from the{' '}
          <a href="/modules" className="underline text-[var(--bordeaux)]">
            Modules
          </a>{' '}
          page.
        </p>
      </div>

      {/* Account Section */}
      <SectionHeader title="Account" />

      <div className="space-y-3 mt-2">
        <div className="py-3 px-4 bg-white/60 rounded-lg border border-[var(--hairline)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-[family-name:var(--font-body)] text-[13px] text-[var(--sepia)]">
              Email
            </span>
            <span className="font-[family-name:var(--font-body)] text-[14px] text-[var(--iron-gall)]">
              {user.email}
            </span>
          </div>
          {user.name && (
            <div className="flex items-center justify-between">
              <span className="font-[family-name:var(--font-body)] text-[13px] text-[var(--sepia)]">
                Name
              </span>
              <span className="font-[family-name:var(--font-body)] text-[14px] text-[var(--iron-gall)]">
                {user.name}
              </span>
            </div>
          )}
          {user.locationZip && (
            <div className="flex items-center justify-between">
              <span className="font-[family-name:var(--font-body)] text-[13px] text-[var(--sepia)]">
                Location
              </span>
              <span className="font-[family-name:var(--font-body)] text-[14px] text-[var(--iron-gall)]">
                {user.locationZip}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={handleSignOut}
          className="w-full font-[family-name:var(--font-display)] text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--bordeaux)] bg-white/60 border border-[var(--bordeaux)]/30 px-4 py-3 rounded-lg transition-colors hover:bg-[var(--bordeaux)]/5"
        >
          Sign Out
        </button>
      </div>

      {/* Change Password Section */}
      <SectionHeader title="Change Password" />

      <form onSubmit={handleChangePassword} className="space-y-3 mt-2">
        <div className="py-3 px-4 bg-white/60 rounded-lg border border-[var(--hairline)] space-y-3">
          <div>
            <label className="font-[family-name:var(--font-body)] text-[13px] text-[var(--sepia)] block mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-[var(--hairline)] bg-white font-[family-name:var(--font-body)] text-[14px] text-[var(--iron-gall)] focus:outline-none focus:border-[var(--forest)]"
              required
            />
          </div>
          <div>
            <label className="font-[family-name:var(--font-body)] text-[13px] text-[var(--sepia)] block mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-[var(--hairline)] bg-white font-[family-name:var(--font-body)] text-[14px] text-[var(--iron-gall)] focus:outline-none focus:border-[var(--forest)]"
              required
              minLength={8}
            />
          </div>
          <div>
            <label className="font-[family-name:var(--font-body)] text-[13px] text-[var(--sepia)] block mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-[var(--hairline)] bg-white font-[family-name:var(--font-body)] text-[14px] text-[var(--iron-gall)] focus:outline-none focus:border-[var(--forest)]"
              required
              minLength={8}
            />
          </div>

          {passwordError && (
            <p className="font-[family-name:var(--font-body)] text-[13px] text-[var(--bordeaux)]">
              {passwordError}
            </p>
          )}
          {passwordSuccess && (
            <p className="font-[family-name:var(--font-body)] text-[13px] text-[var(--sage)]">
              Password changed successfully.
            </p>
          )}

          <button
            type="submit"
            disabled={changingPassword}
            className="w-full font-[family-name:var(--font-display)] text-[13px] font-semibold uppercase tracking-[0.1em] text-white bg-[var(--forest)] px-4 py-2.5 rounded-md disabled:opacity-50 transition-opacity"
          >
            {changingPassword ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </form>
    </main>
  );
}
