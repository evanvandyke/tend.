'use client';

import Link from 'next/link';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[var(--parchment)] flex flex-col items-center justify-center px-6 text-center">
      {/* Decorative flourish */}
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-6 opacity-30">
        <path d="M24 8c0 8-6 14-14 16 8 2 14 8 14 16 0-8 6-14 14-16-8-2-14-8-14-16z" stroke="var(--text-tertiary)" strokeWidth="1" fill="none"/>
      </svg>

      <h1 className="font-[family-name:var(--font-display)] text-[32px] font-semibold text-[var(--iron-gall)]">
        Something went wrong.
      </h1>

      <p className="font-[family-name:var(--font-body)] text-[16px] text-[var(--text-secondary)] mt-3">
        We hit an unexpected problem.
      </p>

      <div className="flex flex-col items-center gap-3 mt-8">
        <button
          onClick={reset}
          className="inline-flex items-center justify-center px-6 py-3 rounded-[var(--radius-lg)] bg-[var(--forest)] text-white font-[family-name:var(--font-body)] text-[15px] font-medium transition-colors hover:bg-[var(--forest-dark)] cursor-pointer"
        >
          Try again
        </button>

        <Link
          href="/now"
          className="font-[family-name:var(--font-body)] text-[14px] text-[var(--text-secondary)] underline underline-offset-2 hover:text-[var(--iron-gall)]"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
