'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import type { NowFeedItemData } from '@/components/now-feed-item';

interface ModuleTaskActionSheetProps {
  open: boolean;
  item: NowFeedItemData | null;
  onClose: () => void;
  onCompleted: () => void;
}

function ModuleTaskActionSheet({ open, item, onClose, onCompleted }: ModuleTaskActionSheetProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState<'completed' | 'skipped' | null>(null);

  if (!open || !item) return null;

  const moduleHref = item.moduleSource === 'garden' || item.type === 'garden-task'
    ? '/modules/garden'
    : `/modules/${item.moduleSlug ?? 'lawn'}`;

  const handleAction = async (status: 'completed' | 'skipped') => {
    if (!item.moduleSlug || !item.taskSlug) return;
    setSubmitting(status);

    try {
      const res = await fetch('/api/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleSlug: item.moduleSlug,
          taskSlug: item.taskSlug,
          year: new Date().getFullYear(),
          status,
        }),
      });

      if (res.ok) {
        onCompleted();
        onClose();
      }
    } catch (err) {
      console.error('Failed to update task:', err);
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[var(--iron-gall)]/30 motion-reduce:opacity-100"
        onClick={onClose}
        style={{ animation: 'mtasFadeIn 200ms ease-out' }}
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
        style={{ animation: 'mtasSlideUp 400ms ease-out' }}
        role="dialog"
        aria-modal="true"
        aria-label="Task actions"
      >
        {/* Task title */}
        <h3 className="font-[family-name:var(--font-display)] text-[19px] font-semibold text-[var(--iron-gall)] mb-1">
          {item.title}
        </h3>

        {/* Task description */}
        {item.content && (
          <p className="font-[family-name:var(--font-body)] text-[14px] text-[var(--sepia)] leading-relaxed mb-5">
            {item.content}
          </p>
        )}

        {!item.content && <div className="mb-4" />}

        {/* Action buttons */}
        <div className="flex flex-col gap-[10px]">
          <Button
            variant="primary"
            onClick={() => handleAction('completed')}
            disabled={submitting !== null}
          >
            {submitting === 'completed' ? 'Marking...' : 'Mark Done'}
          </Button>

          <Button
            variant="secondary"
            onClick={() => handleAction('skipped')}
            disabled={submitting !== null}
          >
            {submitting === 'skipped' ? 'Skipping...' : 'Skip This Year'}
          </Button>

          <button
            type="button"
            onClick={() => {
              onClose();
              router.push(moduleHref);
            }}
            className="font-[family-name:var(--font-body)] text-[14px] font-medium text-[var(--forest)] underline decoration-[var(--hairline)] hover:decoration-[var(--engraved)] py-2 text-center transition-all duration-[150ms] cursor-pointer"
          >
            View Routine →
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes mtasFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes mtasSlideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes mtasFadeIn {
            from { opacity: 1; }
            to { opacity: 1; }
          }
          @keyframes mtasSlideUp {
            from { transform: translateY(0); }
            to { transform: translateY(0); }
          }
        }
      `}</style>
    </div>
  );
}

export { ModuleTaskActionSheet };
