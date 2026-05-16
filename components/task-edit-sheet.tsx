'use client';

import React, { useState, useRef, useEffect } from 'react';
import { TextInput } from '@/components/ui/text-input';
import { Button } from '@/components/ui/button';

type TaskKind = 'quick' | 'recurring' | 'seasonal' | 'project';

interface TaskEditSheetProps {
  open: boolean;
  taskId: string | null;
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
}

const kindOptions: { value: TaskKind; label: string }[] = [
  { value: 'quick', label: 'Single' },
  { value: 'recurring', label: 'Recurring' },
  { value: 'project', label: 'Project' },
];

function TaskEditSheet({ open, taskId, onClose, onSaved, onDeleted }: TaskEditSheetProps) {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [kind, setKind] = useState<TaskKind>('quick');
  const [cadenceDays, setCadenceDays] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch task data when sheet opens
  useEffect(() => {
    if (open && taskId) {
      setLoading(true);
      setError(null);
      fetch(`/api/tasks/${taskId}`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to load task');
          return res.json();
        })
        .then((data) => {
          const task = data.task || data;
          setTitle(task.title || '');
          setKind(task.kind || 'quick');
          setCadenceDays(task.cadenceDays ? String(task.cadenceDays) : '');
          // Extract date portion from ISO string for date input
          if (task.dueAt) {
            const dateStr = task.dueAt.slice(0, 10);
            setDueDate(dateStr);
          } else {
            setDueDate('');
          }
          setLoading(false);
          setTimeout(() => inputRef.current?.focus(), 100);
        })
        .catch((err) => {
          setError(err.message || 'Failed to load task');
          setLoading(false);
        });
    } else if (!open) {
      // Reset state when closing
      setTitle('');
      setDueDate('');
      setKind('quick');
      setCadenceDays('');
      setError(null);
    }
  }, [open, taskId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !taskId) return;
    setSaving(true);
    setError(null);

    try {
      const body: Record<string, unknown> = {
        title: title.trim(),
        kind,
        dueAt: dueDate ? new Date(dueDate + 'T00:00:00').toISOString() : null,
      };
      if (kind === 'recurring' && cadenceDays) {
        body.cadenceDays = parseInt(cadenceDays, 10);
      }

      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to save task');
        setSaving(false);
        return;
      }

      onSaved();
      onClose();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!taskId) return;
    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to delete task');
        setDeleting(false);
        return;
      }

      onDeleted();
      onClose();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setDeleting(false);
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
          animation: 'taskEditFadeIn 200ms ease-out',
        }}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className={[
          'relative w-full max-w-[480px] mx-auto bg-[var(--vellum)]',
          'rounded-t-[var(--radius-xl)] shadow-[var(--shadow-4)]',
          'p-[24px] pb-[calc(24px+env(safe-area-inset-bottom))]',
          'motion-reduce:transform-none',
        ].join(' ')}
        style={{
          animation: 'taskEditSlideUp 400ms ease-out',
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Edit task"
      >
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <span className="font-[family-name:var(--font-body)] text-[15px] text-[var(--text-secondary)]">
              Loading...
            </span>
          </div>
        ) : (
          <form onSubmit={handleSave} className="flex flex-col gap-[16px]">
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
              <div className="flex gap-[6px]">
                {kindOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setKind(opt.value)}
                    className={[
                      'px-[12px] py-[6px] rounded-[var(--radius-sm)] min-h-[36px]',
                      'font-[family-name:var(--font-display)] text-[12px] font-semibold uppercase tracking-[0.05em]',
                      'border transition-all duration-[150ms] ease-out cursor-pointer',
                      kind === opt.value
                        ? 'bg-[var(--forest)] text-[var(--vellum)] border-[var(--forest)]'
                        : 'bg-transparent text-[var(--text-secondary)] border-[var(--hairline)] hover:border-[var(--engraved)]',
                    ].join(' ')}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {kind === 'recurring' && (
              <TextInput
                label="Repeat every (days)"
                type="number"
                placeholder="e.g. 7"
                value={cadenceDays}
                onChange={(e) => setCadenceDays(e.target.value)}
              />
            )}

            {error && (
              <p className="font-[family-name:var(--font-body)] text-[13px] text-[var(--bordeaux)]">
                {error}
              </p>
            )}

            <Button type="submit" variant="primary" disabled={!title.trim() || saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>

            {/* Divider */}
            <div className="h-[0.5px] bg-[var(--hairline)] my-[4px]" />

            <Button
              type="button"
              variant="destructive"
              disabled={deleting}
              onClick={handleDelete}
            >
              {deleting ? 'Deleting...' : 'Delete Task'}
            </Button>
          </form>
        )}
      </div>

      <style jsx>{`
        @keyframes taskEditFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes taskEditSlideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes taskEditFadeIn {
            from { opacity: 1; }
            to { opacity: 1; }
          }
          @keyframes taskEditSlideUp {
            from { transform: translateY(0); }
            to { transform: translateY(0); }
          }
        }
      `}</style>
    </div>
  );
}

export { TaskEditSheet };
export type { TaskEditSheetProps };
