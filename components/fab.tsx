'use client';

import React from 'react';
import { Plus } from 'lucide-react';

interface FABProps {
  onClick?: () => void;
  className?: string;
}

function FAB({ onClick, className = '' }: FABProps) {
  return (
    <button
      onClick={onClick}
      aria-label="Add task"
      className={[
        'fixed bottom-[88px] right-[20px] z-50 fab-position',
        'w-[56px] h-[56px] rounded-full',
        'bg-[var(--forest)] text-[var(--vellum)]',
        'flex items-center justify-center',
        'shadow-[0_4px_14px_rgba(45,82,53,0.32)]',
        'hover:shadow-[0_6px_18px_rgba(45,82,53,0.40)]',
        'active:scale-[0.94] active:shadow-[0_2px_8px_rgba(45,82,53,0.32)]',
        'transition-[transform,box-shadow] duration-[150ms] ease-out motion-reduce:transition-none motion-reduce:active:scale-100',
        'cursor-pointer',
        className,
      ].join(' ')}
    >
      <Plus size={24} strokeWidth={2} />
    </button>
  );
}

export { FAB };
export type { FABProps };
