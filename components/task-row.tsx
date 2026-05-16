'use client';

import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { ModuleTag, type ModuleType } from '@/components/module-tag';

interface TaskRowProps {
  id: string;
  title: string;
  dueDate?: string;
  moduleSource?: ModuleType;
  isCompleted: boolean;
  onToggle: (id: string) => void;
  onPress?: (id: string) => void;
}

function getDueDateDisplay(dueDate: string): { text: string; className: string } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  if (due.getTime() === today.getTime()) {
    return { text: 'Today', className: 'text-[var(--forest)]' };
  }
  if (due.getTime() === tomorrow.getTime()) {
    return { text: 'Tomorrow', className: 'text-[var(--text-secondary)]' };
  }
  if (due < today) {
    return { text: 'Overdue', className: 'text-[var(--bordeaux)] font-medium' };
  }
  return {
    text: due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    className: 'text-[var(--text-secondary)]',
  };
}

function TaskRow({ id, title, dueDate, moduleSource, isCompleted, onToggle, onPress }: TaskRowProps) {
  const hasMetadata = dueDate || moduleSource;
  const dueDateInfo = dueDate ? getDueDateDisplay(dueDate) : null;

  return (
    <div
      className={[
        'relative flex items-center min-h-[60px] px-[16px]',
        'transition-colors duration-[80ms] ease-out',
        'hover:bg-[var(--aged-paper)] active:bg-[var(--aged-paper)]',
        'cursor-pointer',
      ].join(' ')}
      onClick={() => onPress?.(id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onPress?.(id);
        }
      }}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={isCompleted}
          onChange={() => onToggle(id)}
          aria-label={`Mark "${title}" as ${isCompleted ? 'incomplete' : 'complete'}`}
        />
      </div>

      <div className="flex-1 flex flex-col gap-[2px] ml-[12px]">
        <span
          className={[
            'font-[family-name:var(--font-body)] text-[16px]',
            isCompleted
              ? 'line-through text-[var(--text-tertiary)] opacity-60'
              : 'text-[var(--iron-gall)]',
          ].join(' ')}
        >
          {title}
        </span>

        {hasMetadata && (
          <div className="flex items-center gap-[8px]">
            {dueDateInfo && (
              <span
                className={[
                  'font-[family-name:var(--font-body)] text-[13px]',
                  dueDateInfo.className,
                ].join(' ')}
              >
                {dueDateInfo.text}
              </span>
            )}
            {moduleSource && (
              <ModuleTag module={moduleSource} />
            )}
          </div>
        )}
      </div>

      {/* Bottom divider */}
      <div className="absolute bottom-0 right-0 left-[48px] h-[0.5px] bg-[var(--hairline)]" />
    </div>
  );
}

export { TaskRow };
export type { TaskRowProps };
