'use client';

import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  className?: string;
  collapsible?: boolean;
  isCollapsed?: boolean;
  itemCount?: number;
  onToggle?: () => void;
}

function SectionHeader({
  title,
  className = '',
  collapsible = false,
  isCollapsed = false,
  itemCount,
  onToggle,
}: SectionHeaderProps) {
  const headerContent = (
    <div
      className={[
        'flex items-center gap-[8px] pt-[24px] pb-[8px] pl-[16px] pr-[16px]',
        collapsible ? 'cursor-pointer select-none' : '',
        className,
      ].join(' ')}
      onClick={collapsible ? onToggle : undefined}
      role={collapsible ? 'button' : undefined}
      aria-expanded={collapsible ? !isCollapsed : undefined}
      tabIndex={collapsible ? 0 : undefined}
      onKeyDown={
        collapsible
          ? (e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onToggle?.();
              }
            }
          : undefined
      }
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

      {/* Item count (shown when collapsed) */}
      {collapsible && isCollapsed && itemCount !== undefined && (
        <span className="font-[family-name:var(--font-display)] text-[11px] font-semibold text-[#9C8E70] whitespace-nowrap">
          {itemCount}
        </span>
      )}

      {/* Chevron indicator */}
      {collapsible && (
        <span
          className="shrink-0 section-header-chevron"
          style={{
            transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
            transition: 'transform 250ms ease-out',
          }}
          aria-hidden="true"
        >
          <ChevronDown size={14} strokeWidth={1.5} color="#9C8E70" />
        </span>
      )}
    </div>
  );

  return headerContent;
}

export { SectionHeader };
export type { SectionHeaderProps };
