'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { TaskRow } from '@/components/task-row';

interface Task {
  id: number;
  title: string;
  kind: string;
  status: string;
  dueAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

interface TaskListProps {
  statusFilter?: string;
  kindFilter?: string;
  onTaskPress?: (id: number) => void;
}

function TaskList({ statusFilter, kindFilter, onTaskPress }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (kindFilter) params.set('kind', kindFilter);

      const res = await fetch(`/api/tasks?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch tasks');

      const data = await res.json();
      setTasks(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, kindFilter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleToggle = async (id: string) => {
    const taskId = parseInt(id, 10);
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newStatus = task.status === 'done' ? 'active' : 'done';

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: newStatus, completedAt: newStatus === 'done' ? new Date().toISOString() : null } : t
      )
    );

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update task');
    } catch {
      // Revert on error
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, status: task.status, completedAt: task.completedAt } : t
        )
      );
    }
  };

  const handleDelete = async (id: number) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    // Optimistic removal
    setTasks((prev) => prev.filter((t) => t.id !== id));

    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete task');
    } catch {
      // Revert on error
      setTasks((prev) => [...prev, task].sort((a, b) => {
        if (a.dueAt && b.dueAt) return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
        if (a.dueAt) return -1;
        if (b.dueAt) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }));
    }
  };

  // Expose refresh for parent components
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__tendRefreshTasks = fetchTasks;
    return () => {
      delete (window as unknown as Record<string, unknown>).__tendRefreshTasks;
    };
  }, [fetchTasks]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-[32px]">
        <span className="font-[family-name:var(--font-body)] text-[14px] text-[var(--text-tertiary)]">
          Loading tasks...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-[32px]">
        <span className="font-[family-name:var(--font-body)] text-[14px] text-[var(--bordeaux)]">
          {error}
        </span>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center py-[32px]">
        <span className="font-[family-name:var(--font-body)] text-[14px] text-[var(--text-tertiary)]">
          No tasks yet. Tap + to add one.
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {tasks.map((task) => (
        <div key={task.id} className="relative group">
          <TaskRow
            id={String(task.id)}
            title={task.title}
            dueDate={task.dueAt ?? undefined}
            isCompleted={task.status === 'done'}
            onToggle={handleToggle}
            onPress={() => onTaskPress?.(task.id)}
          />
          {/* Swipe-to-delete hint — in a real implementation this would use touch gestures */}
          <button
            type="button"
            onClick={() => handleDelete(task.id)}
            className="absolute right-[8px] top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity px-[8px] py-[4px] text-[12px] text-[var(--bordeaux)] font-[family-name:var(--font-display)] font-semibold uppercase tracking-[0.1em]"
            aria-label={`Delete "${task.title}"`}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export { TaskList };
export type { TaskListProps, Task };
