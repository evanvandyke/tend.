'use client';

import React from 'react';
import { ProjectForm } from '@/components/project-form';

interface ProjectFormSheetProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ProjectFormSheet({ open, onClose, onSuccess }: ProjectFormSheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[var(--iron-gall)]/30"
        onClick={onClose}
        style={{ animation: 'fadeIn 200ms ease-out' }}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className={[
          'relative w-full max-h-[85vh] overflow-y-auto bg-[var(--vellum)]',
          'rounded-t-[var(--radius-xl)] shadow-[var(--shadow-4)]',
          'p-6 pb-[calc(24px+env(safe-area-inset-bottom))]',
        ].join(' ')}
        style={{ animation: 'slideUp 400ms ease-out' }}
        role="dialog"
        aria-modal="true"
        aria-label="Create project"
      >
        <h2 className="font-[family-name:var(--font-display)] text-[22px] font-semibold text-[var(--iron-gall)] mb-5">
          New Project
        </h2>
        <ProjectForm onSuccess={onSuccess} onCancel={onClose} />
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
      `}</style>
    </div>
  );
}
