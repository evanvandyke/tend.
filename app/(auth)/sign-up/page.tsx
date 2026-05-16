'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignUpPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        setLoading(false);
        return;
      }

      // Auto sign-in after successful registration
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Account created but sign-in failed. Please sign in manually.');
        setLoading(false);
      } else {
        router.push('/install');
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

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

      {/* Subtitle */}
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
        An almanac for the home.
      </p>

      <form onSubmit={handleSubmit}>
        {/* Name */}
        <div style={{ marginBottom: 16 }}>
          <label
            htmlFor="name"
            style={{
              display: 'block',
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--iron-gall)',
              marginBottom: 6,
            }}
          >
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{
              width: '100%',
              fontFamily: 'var(--font-body)',
              fontSize: 16,
              padding: '10px 12px',
              minHeight: 44,
              background: 'var(--vellum)',
              border: '1px solid var(--hairline)',
              borderRadius: 4,
              color: 'var(--iron-gall)',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Email */}
        <div style={{ marginBottom: 16 }}>
          <label
            htmlFor="email"
            style={{
              display: 'block',
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--iron-gall)',
              marginBottom: 6,
            }}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              fontFamily: 'var(--font-body)',
              fontSize: 16,
              padding: '10px 12px',
              minHeight: 44,
              background: 'var(--vellum)',
              border: '1px solid var(--hairline)',
              borderRadius: 4,
              color: 'var(--iron-gall)',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: 16 }}>
          <label
            htmlFor="password"
            style={{
              display: 'block',
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--iron-gall)',
              marginBottom: 6,
            }}
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            style={{
              width: '100%',
              fontFamily: 'var(--font-body)',
              fontSize: 16,
              padding: '10px 12px',
              minHeight: 44,
              background: 'var(--vellum)',
              border: '1px solid var(--hairline)',
              borderRadius: 4,
              color: 'var(--iron-gall)',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Confirm Password */}
        <div style={{ marginBottom: 24 }}>
          <label
            htmlFor="confirmPassword"
            style={{
              display: 'block',
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--iron-gall)',
              marginBottom: 6,
            }}
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            style={{
              width: '100%',
              fontFamily: 'var(--font-body)',
              fontSize: 16,
              padding: '10px 12px',
              minHeight: 44,
              background: 'var(--vellum)',
              border: '1px solid var(--hairline)',
              borderRadius: 4,
              color: 'var(--iron-gall)',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Error */}
        {error && (
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              color: 'var(--bordeaux)',
              margin: '0 0 16px 0',
              textAlign: 'center',
            }}
          >
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            fontFamily: 'var(--font-display)',
            fontSize: 15,
            fontWeight: 600,
            padding: '10px 18px',
            minHeight: 44,
            background: loading ? 'var(--slate)' : 'var(--forest)',
            color: 'var(--vellum)',
            border: 'none',
            borderRadius: 4,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      {/* Link to sign-in */}
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 14,
          color: 'var(--text-secondary)',
          textAlign: 'center',
          marginTop: 24,
        }}
      >
        Already have an account?{' '}
        <Link
          href="/sign-in"
          style={{ color: 'var(--forest)', textDecoration: 'underline' }}
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
