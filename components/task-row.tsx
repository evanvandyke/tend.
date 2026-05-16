'use client';

import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { ModuleTag, type ModuleType } from '@/components/module-tag';

export type CompletionAnimState = 'idle' | 'completing' | 'completed' | 'collapsing';

interface TaskRowProps {
  id: string;
  title: string;
  dueDate?: string;
  moduleSource?: ModuleType;
  isCompleted: boolean;
  animState?: CompletionAnimState;
  onToggle: (id: string) => void;
  onPress?: (id: string) => void;
}

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getDueDateDisplay(dueDate: string): { text: string; className: string } {
  const dueDateOnly = dueDate.slice(0, 10);

  const now = new Date();
  const todayStr = toDateString(now);
  const tomorrowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const tomorrowStr = toDateString(tomorrowDate);

  if (dueDateOnly === todayStr) {
    return { text: 'Today', className: 'text-[var(--forest)]' };
  }
  if (dueDateOnly === tomorrowStr) {
    return { text: 'Tomorrow', className: 'text-[var(--text-secondary)]' };
  }
  if (dueDateOnly < todayStr) {
    return { text: 'Overdue', className: 'text-[var(--bordeaux)] font-medium' };
  }
  const [year, month, day] = dueDateOnly.split('-').map(Number);
  const displayDate = new Date(year, month - 1, day);
  return {
    text: displayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    className: 'text-[var(--text-secondary)]',
  };
}

function TaskRow({ id, title, dueDate, moduleSource, isCompleted, animState = 'idle', onToggle, onPress }: TaskRowProps) {
  const hasMetadata = dueDate || moduleSource;
  const dueDateInfo = dueDate ? getDueDateDisplay(dueDate) : null;

  const isAnimatingComplete = animState === 'completing' || animState === 'completed';
  const isCollapsing = animState === 'collapsing';

  return (
    <div
      className={[
        'relative flex items-center min-h-[60px] px-[16px] overflow-hidden',
        'transition-colors duration-[80ms] ease-out',
        'hover:bg-[var(--aged-paper)] active:bg-[var(--aged-paper)]',
        'cursor-pointer',
        isCollapsing ? 'task-row-collapsing' : '',
      ].join(' ')}
      style={isCollapsing ? { animationDuration: '250ms', animationFillMode: 'forwards' } : undefined}
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
          checked={isCompleted || isAnimatingComplete}
          onChange={() => onToggle(id)}
          aria-label={`Mark "${title}" as ${isCompleted ? 'incomplete' : 'complete'}`}
        />
      </div>

      <div className="flex-1 flex flex-col gap-[2px] ml-[12px]">
        <span
          className={[
            'font-[family-name:var(--font-body)] text-[16px]',
            'transition-all duration-[250ms] ease-out',
            (isCompleted || isAnimatingComplete)
              ? 'line-through text-[var(--text-tertiary)] opacity-60'
              : 'text-[var(--iron-gall)]',
          ].join(' ')}
          style={isAnimatingComplete ? { transitionDelay: '80ms' } : undefined}
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
