'use client';

import React, { useState, useRef, useEffect } from 'react';
import { TextInput } from '@/components/ui/text-input';
import { Button } from '@/components/ui/button';
import type { ModuleType } from '@/components/module-tag';

interface QuickAddSheetProps {
  open: boolean;
  onClose: () => void;
  onAdd?: (task: { title: string; dueDate?: string; module?: ModuleType }) => void;
}

const moduleOptions: { value: ModuleType; label: string }[] = [
  { value: 'task', label: 'Task' },
  { value: 'lawn', label: 'Lawn' },
  { value: 'garden', label: 'Garden' },
  { value: 'project', label: 'Project' },
];

function QuickAddSheet({ open, onClose, onAdd }: QuickAddSheetProps) {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [module, setModule] = useState<ModuleType>('task');
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setTitle('');
      setDueDate('');
      setModule('task');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    setValidationError(null);

    // Map module option to task kind
    const kindMap: Record<ModuleType, string> = {
      task: 'quick',
      lawn: 'recurring',
      garden: 'seasonal',
      project: 'project',
    };

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          kind: kindMap[module] || 'quick',
          dueAt: dueDate ? new Date(dueDate).toISOString() : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setValidationError(data.error || 'Failed to create task');
        setSubmitting(false);
        return;
      }

      // Notify parent and refresh task list
      onAdd?.({
        title: title.trim(),
        dueDate: dueDate || undefined,
        module,
      });

      // Trigger task list refresh if available
      const refreshFn = (window as unknown as Record<string, unknown>).__tendRefreshTasks;
      if (typeof refreshFn === 'function') {
        (refreshFn as () => void)();
      }

      onClose();
    } catch {
      setValidationError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[var(--iron-gall)]/30 motion-reduce:opacity-100"
        onClick={onClose}
        style={{
          animation: 'fadeIn 200ms ease-out',
        }}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className={[
          'relative w-full bg-[var(--vellum)]',
          'rounded-t-[var(--radius-xl)] shadow-[var(--shadow-4)]',
          'p-[24px] pb-[calc(24px+env(safe-area-inset-bottom))]',
          'motion-reduce:transform-none',
        ].join(' ')}
        style={{
          animation: 'slideUp 400ms ease-out',
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Quick add task"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-[16px]">
          <TextInput
            ref={inputRef}
            label="Task"
            placeholder="What needs doing?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <TextInput
            label="Due date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <div className="flex flex-col gap-[var(--space-xs)]">
            <span className="font-[family-name:var(--font-display)] text-[14px] font-semibold text-[var(--iron-gall)]">
              Kind
            </span>
            <div className="flex gap-[8px] flex-wrap">
              {moduleOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setModule(opt.value)}
                  className={[
                    'px-[12px] py-[8px] rounded-[var(--radius-sm)] min-h-[44px]',
                    'font-[family-name:var(--font-display)] text-[13px] font-semibold uppercase tracking-[0.1em]',
                    'border transition-all duration-[150ms] ease-out cursor-pointer',
                    module === opt.value
                      ? 'bg-[var(--forest)] text-[var(--vellum)] border-[var(--forest)]'
                      : 'bg-transparent text-[var(--text-secondary)] border-[var(--hairline)] hover:border-[var(--engraved)]',
                  ].join(' ')}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {validationError && (
            <p className="font-[family-name:var(--font-body)] text-[13px] text-[var(--bordeaux)]">
              {validationError}
            </p>
          )}

          <Button type="submit" variant="primary" disabled={!title.trim() || submitting}>
            {submitting ? 'Adding...' : 'Add'}
          </Button>
        </form>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes fadeIn {
            from { opacity: 1; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { transform: translateY(0); }
            to { transform: translateY(0); }
          }
        }
      `}</style>
    </div>
  );
}

export { QuickAddSheet };
export type { QuickAddSheetProps };
