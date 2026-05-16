'use client';

import React from 'react';
import { format } from 'date-fns';

function TopBar() {
  const now = new Date();
  const dayOfWeek = format(now, 'EEEE');
  const dayMonth = format(now, 'd MMMM');

  return (
    <header
      className={[
        'h-[56px] bg-[var(--parchment)] flex items-center justify-between px-4',
        'border-b border-[var(--hairline)]',
      ].join(' ')}
      style={{ borderBottomWidth: '0.5px' }}
    >
      {/* Wordmark */}
      <h1 className="font-[family-name:var(--font-display)] text-[28px] font-semibold text-[var(--iron-gall)] leading-none">
        Tend<span className="text-[var(--bordeaux)]">.</span>
      </h1>

      {/* Date */}
      <div className="text-right font-[family-name:var(--font-body)] text-[13px] text-[var(--sepia)] leading-tight">
        <div>{dayOfWeek}</div>
        <div>{dayMonth}</div>
      </div>
    </header>
  );
}

export { TopBar };
