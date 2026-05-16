'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { TaskRow, type CompletionAnimState } from '@/components/task-row';
import { TaskEditSheet } from '@/components/task-edit-sheet';
import { SectionHeader } from '@/components/section-header';
import type { UserTaskItem } from '@/lib/db/queries';

type FilterType = 'all' | 'active' | 'completed';

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

const KIND_LABELS: Record<string, string> = {
  quick: 'Quick Tasks',
  recurring: 'Recurring',
  seasonal: 'Seasonal',
  project: 'Projects',
  longcycle: 'Long Cycle',
};

// Order for section display
const KIND_ORDER = ['quick', 'recurring', 'seasonal', 'project', 'longcycle'];

interface TasksListClientProps {
  tasks: UserTaskItem[];
}

function TasksListClient({ tasks: initialTasks }: TasksListClientProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterType>('all');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [animStates, setAnimStates] = useState<Record<number, CompletionAnimState>>({});

  const filteredTasks = initialTasks.filter((task) => {
    if (filter === 'all') return true;
    if (filter === 'active') return task.status === 'active' || task.status === 'pending';
    if (filter === 'completed') return task.status === 'done';
    return true;
  });

  // Group by kind
  const grouped = KIND_ORDER.reduce<Record<string, UserTaskItem[]>>((acc, kind) => {
    const tasksForKind = filteredTasks.filter((t) => t.kind === kind);
    if (tasksForKind.length > 0) {
      acc[kind] = tasksForKind;
    }
    return acc;
  }, {});

  // Handle any kinds not in KIND_ORDER
  const ungrouped = filteredTasks.filter((t) => !KIND_ORDER.includes(t.kind));
  if (ungrouped.length > 0) {
    grouped['other'] = ungrouped;
  }

  const handleToggle = useCallback(async (id: string) => {
    const numericId = parseInt(id.replace('user-task-', ''), 10);
    const task = initialTasks.find((t) => t.id === numericId);
    if (!task) return;

    const newStatus = task.status === 'done' ? 'active' : 'done';

    // Animate
    setAnimStates((prev) => ({ ...prev, [numericId]: 'completing' }));
    setTimeout(() => {
      setAnimStates((prev) => ({ ...prev, [numericId]: 'completed' }));
    }, 300);

    try {
      await fetch(`/api/tasks/${numericId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      setTimeout(() => {
        setAnimStates((prev) => ({ ...prev, [numericId]: 'collapsing' }));
        setTimeout(() => {
          setAnimStates((prev) => {
            const next = { ...prev };
            delete next[numericId];
            return next;
          });
          router.refresh();
        }, 250);
      }, 1500);
    } catch {
      setAnimStates((prev) => {
        const next = { ...prev };
        delete next[numericId];
        return next;
      });
    }
  }, [initialTasks, router]);

  const handleUndo = useCallback(async (id: string) => {
    const numericId = parseInt(id.replace('user-task-', ''), 10);
    setAnimStates((prev) => {
      const next = { ...prev };
      delete next[numericId];
      return next;
    });

    await fetch(`/api/tasks/${numericId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'active' }),
    });
    router.refresh();
  }, [router]);

  const handlePress = useCallback((id: string) => {
    const numericId = id.replace('user-task-', '');
    setEditingTaskId(numericId);
    setEditSheetOpen(true);
  }, []);

  const handleEditClose = useCallback(() => {
    setEditSheetOpen(false);
    setEditingTaskId(null);
  }, []);

  const handleSaved = useCallback(() => {
    setEditSheetOpen(false);
    setEditingTaskId(null);
    router.refresh();
  }, [router]);

  const handleDeleted = useCallback(() => {
    setEditSheetOpen(false);
    setEditingTaskId(null);
    router.refresh();
  }, [router]);

  const hasResults = filteredTasks.length > 0;

  return (
    <div className="pb-24">
      {/* Page title */}
      <div className="px-4 pt-4 pb-2">
        <h1 className="font-[family-name:var(--font-display)] text-[28px] font-semibold text-[var(--iron-gall)]">
          Tasks
        </h1>
      </div>

      {/* Filter pills */}
      <div className="px-4 py-3 flex gap-2 overflow-x-auto">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={[
              'font-[family-name:var(--font-display)] text-[12px] font-semibold uppercase tracking-[0.05em]',
              'min-h-[32px] px-[14px] py-[6px] rounded-[var(--radius-sm)]',
              'transition-colors duration-150 whitespace-nowrap',
              filter === opt.value
                ? 'bg-[var(--forest)] text-[var(--vellum)]'
                : 'bg-transparent text-[var(--text-secondary)] border border-[var(--hairline)]',
            ].join(' ')}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Task list */}
      {hasResults ? (
        Object.entries(grouped).map(([kind, tasks]) => (
          <div key={kind}>
            <SectionHeader title={KIND_LABELS[kind] || kind} />
            {tasks.map((task) => (
              <TaskRow
                key={task.id}
                id={`user-task-${task.id}`}
                title={task.title}
                dueDate={task.dueAt ?? undefined}
                isCompleted={task.status === 'done'}
                animState={animStates[task.id] ?? 'idle'}
                moduleSource={task.kind === 'project' ? 'project' : 'task'}
                onToggle={handleToggle}
                onPress={handlePress}
                onUndo={handleUndo}
              />
            ))}
          </div>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <p className="font-[family-name:var(--font-body)] text-[16px] text-[var(--text-secondary)] text-center">
            {filter === 'all'
              ? 'No tasks yet. Add one from the Now page!'
              : filter === 'active'
                ? 'No active tasks.'
                : 'No completed tasks.'}
          </p>
        </div>
      )}

      {/* Edit sheet */}
      <TaskEditSheet
        open={editSheetOpen}
        taskId={editingTaskId}
        onClose={handleEditClose}
        onSaved={handleSaved}
        onDeleted={handleDeleted}
      />
    </div>
  );
}

export { TasksListClient };
