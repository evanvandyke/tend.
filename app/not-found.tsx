import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--parchment)] flex flex-col items-center justify-center px-6 text-center">
      {/* Decorative flourish */}
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-6 opacity-30">
        <path d="M28 8c0 10-7.5 17-17 19.5 9.5 2.5 17 9.5 17 19.5 0-10 7.5-17 17-19.5-9.5-2.5-17-9.5-17-19.5z" stroke="var(--text-tertiary)" strokeWidth="1" fill="none"/>
        <path d="M28 16c0 6-4 10.5-10 12.5 6 2 10 6.5 10 12.5 0-6 4-10.5 10-12.5-6-2-10-6.5-10-12.5z" stroke="var(--text-tertiary)" strokeWidth="0.6" fill="none"/>
      </svg>

      <h1 className="font-[family-name:var(--font-display)] text-[32px] font-semibold text-[var(--iron-gall)]">
        Page not found.
      </h1>

      <p className="font-[family-name:var(--font-body)] text-[16px] text-[var(--text-secondary)] mt-3">
        The almanac doesn&apos;t have this page.
      </p>

      <Link
        href="/now"
        className="mt-8 inline-flex items-center justify-center px-6 py-3 rounded-[var(--radius-lg)] bg-[var(--forest)] text-white font-[family-name:var(--font-body)] text-[15px] font-medium transition-colors hover:bg-[var(--forest-dark)]"
      >
        Return home
      </Link>
    </div>
  );
}
