'use client';

import React from 'react';

interface ProjectCardProps {
  title: string;
  description?: string;
  subtaskCount?: number;
  completedCount?: number;
  onClick?: () => void;
  className?: string;
}

function ProjectCard({
  title,
  description,
  subtaskCount,
  completedCount,
  onClick,
  className = '',
}: ProjectCardProps) {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
      className={[
        'bg-[var(--aged-paper)] border border-[var(--hairline)] rounded-[var(--radius-md)]',
        'p-[16px] shadow-[var(--shadow-1)]',
        'transition-all duration-[250ms] ease-out',
        onClick
          ? 'cursor-pointer hover:border-[var(--engraved)] hover:shadow-[var(--shadow-2)] hover:-translate-y-[1px]'
          : '',
        className,
      ].join(' ')}
    >
      <h3 className="font-[family-name:var(--font-display)] text-[19px] font-semibold text-[var(--iron-gall)]">
        {title}
      </h3>

      {description && (
        <p className="mt-[8px] font-[family-name:var(--font-body)] text-[14px] text-[var(--text-secondary)]">
          {description}
        </p>
      )}

      {subtaskCount !== undefined && (
        <div className="mt-[12px] font-[family-name:var(--font-display)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
          {completedCount ?? 0}/{subtaskCount} tasks
        </div>
      )}
    </div>
  );
}

export { ProjectCard };
export type { ProjectCardProps };
