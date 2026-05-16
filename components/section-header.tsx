'use client';

import React from 'react';

interface SectionHeaderProps {
  title: string;
  className?: string;
}

function SectionHeader({ title, className = '' }: SectionHeaderProps) {
  return (
    <div
      className={[
        'flex items-center gap-[8px] pt-[24px] pb-[8px] pl-[16px] pr-[16px]',
        className,
      ].join(' ')}
    >
      <h2 className="font-[family-name:var(--font-display)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)] whitespace-nowrap">
        {title}
      </h2>

      {/* Decorative flourish line */}
      <span className="flex items-center gap-[6px] flex-1 min-w-0">
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className="shrink-0"
          aria-hidden="true"
        >
          <path
            d="M6 2C6 2 4 4 4 6C4 8 6 10 6 10M6 2C6 2 8 4 8 6C8 8 6 10 6 10M3 5C5 5 7 5 9 5"
            stroke="var(--hairline)"
            strokeWidth="0.75"
            strokeLinecap="round"
          />
        </svg>
        <span className="flex-1 h-[0.5px] bg-[var(--hairline)]" />
      </span>
    </div>
  );
}

export { SectionHeader };
export type { SectionHeaderProps };
