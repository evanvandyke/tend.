'use client';

import React from 'react';

type ModuleType = 'lawn' | 'garden' | 'project' | 'task';

interface ModuleTagProps {
  module: ModuleType;
  label?: string;
  className?: string;
}

const dotColors: Record<ModuleType, string | null> = {
  lawn: 'bg-[var(--forest)]',
  garden: 'bg-[var(--mustard)]',
  project: 'bg-[var(--bordeaux)]',
  task: null,
};

const defaultLabels: Record<ModuleType, string> = {
  lawn: 'Lawn',
  garden: 'Garden',
  project: 'Projects',
  task: 'Tasks',
};

function ModuleTag({ module, label, className = '' }: ModuleTagProps) {
  const dotClass = dotColors[module];
  const displayLabel = label || defaultLabels[module];

  return (
    <span
      aria-label={`Source: ${displayLabel}`}
      className={[
        'inline-flex items-center gap-[6px]',
        'font-[family-name:var(--font-display)] text-[10px] font-semibold uppercase tracking-[0.18em]',
        'text-[var(--text-secondary)]',
        className,
      ].join(' ')}
    >
      {dotClass && (
        <span className={`w-[6px] h-[6px] rounded-full ${dotClass}`} aria-hidden="true" />
      )}
      {displayLabel}
    </span>
  );
}

export { ModuleTag };
export type { ModuleTagProps, ModuleType };
