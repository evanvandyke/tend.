'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/now';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid email or password');
      setLoading(false);
    } else {
      router.push(callbackUrl);
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
        <div style={{ marginBottom: 24 }}>
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
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      {/* Link to sign-up */}
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 14,
          color: 'var(--text-secondary)',
          textAlign: 'center',
          marginTop: 24,
        }}
      >
        New here?{' '}
        <Link
          href="/sign-up"
          style={{ color: 'var(--forest)', textDecoration: 'underline' }}
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
