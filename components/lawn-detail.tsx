'use client';

import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { SectionHeader } from '@/components/section-header';
import { Checkbox } from '@/components/ui/checkbox';

interface LawnTask {
  slug: string;
  title: string;
  content: string;
  windowStart?: { month: number; day: number };
  windowEnd?: { month: number; day: number };
}

interface LawnDetailProps {
  tasksByMonth: Record<string, LawnTask[]>;
}

interface Completion {
  id: number;
  taskSlug: string;
  year: number;
}

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatWindow(task: LawnTask): string {
  if (!task.windowStart || !task.windowEnd) return '';
  const startMonth = MONTH_NAMES[task.windowStart.month];
  const endMonth = MONTH_NAMES[task.windowEnd.month];
  if (task.windowStart.month === task.windowEnd.month) {
    return `${startMonth} ${task.windowStart.day}–${task.windowEnd.day}`;
  }
  return `${startMonth} ${task.windowStart.day} – ${endMonth} ${task.windowEnd.day}`;
}

function LawnDetail({ tasksByMonth }: LawnDetailProps) {
  const currentMonth = new Date().getMonth() + 1;
  const [activeMonth, setActiveMonth] = useState(currentMonth);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [loadingCompletions, setLoadingCompletions] = useState(true);

  const year = new Date().getFullYear();

  // All months that have tasks
  const months = Object.keys(tasksByMonth)
    .map(Number)
    .sort((a, b) => a - b);

  useEffect(() => {
    fetch(`/api/completions?moduleSlug=lawn-utah&year=${year}`)
      .then((r) => r.json())
      .then((data) => {
        setCompletions(data);
        setLoadingCompletions(false);
      })
      .catch(() => setLoadingCompletions(false));
  }, [year]);

  const completedSlugs = new Set(completions.map((c) => c.taskSlug));

  async function toggleCompletion(taskSlug: string) {
    const existing = completions.find((c) => c.taskSlug === taskSlug);
    if (existing) {
      // Remove completion
      await fetch(`/api/completions?id=${existing.id}`, { method: 'DELETE' });
      setCompletions((prev) => prev.filter((c) => c.id !== existing.id));
    } else {
      // Add completion
      const res = await fetch('/api/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleSlug: 'lawn-utah', taskSlug, year }),
      });
      const data = await res.json();
      setCompletions((prev) => [...prev, data]);
    }
  }

  function navigateMonth(direction: -1 | 1) {
    const currentIndex = months.indexOf(activeMonth);
    const nextIndex = currentIndex + direction;
    if (nextIndex >= 0 && nextIndex < months.length) {
      setActiveMonth(months[nextIndex]);
    }
  }

  const tasksForMonth = tasksByMonth[String(activeMonth)] || [];
  const currentMonthIndex = months.indexOf(activeMonth);

  return (
    <div>
      {/* Header with back arrow */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-3">
        <Link
          href="/modules"
          className="flex items-center justify-center w-[44px] h-[44px] -ml-2"
          aria-label="Back to modules"
        >
          <ArrowLeft size={20} strokeWidth={1.5} className="text-[var(--iron-gall)]" />
        </Link>
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-[22px] font-semibold text-[var(--iron-gall)]">
            Lawn Care
          </h2>
          <p className="font-[family-name:var(--font-body)] text-[13px] text-[var(--sepia)]">
            Northern Utah &middot; Cool-Season Schedule
          </p>
        </div>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--hairline)]">
        <button
          onClick={() => navigateMonth(-1)}
          disabled={currentMonthIndex <= 0}
          className="flex items-center justify-center w-[44px] h-[44px] disabled:opacity-30 cursor-pointer disabled:cursor-default"
          aria-label="Previous month"
        >
          <ChevronLeft size={20} strokeWidth={1.5} className="text-[var(--iron-gall)]" />
        </button>

        <span
          className={[
            'font-[family-name:var(--font-display)] text-[16px] font-semibold',
            activeMonth === currentMonth ? 'text-[var(--forest)]' : 'text-[var(--iron-gall)]',
          ].join(' ')}
        >
          {MONTH_NAMES[activeMonth]}
          {activeMonth === currentMonth && (
            <span className="ml-2 text-[11px] uppercase tracking-[0.12em] text-[var(--forest)] font-medium">
              Now
            </span>
          )}
        </span>

        <button
          onClick={() => navigateMonth(1)}
          disabled={currentMonthIndex >= months.length - 1}
          className="flex items-center justify-center w-[44px] h-[44px] disabled:opacity-30 cursor-pointer disabled:cursor-default"
          aria-label="Next month"
        >
          <ChevronRight size={20} strokeWidth={1.5} className="text-[var(--iron-gall)]" />
        </button>
      </div>

      {/* Tasks for active month */}
      <div className="px-0">
        <SectionHeader title={`${MONTH_NAMES[activeMonth]} Tasks`} />

        {tasksForMonth.length === 0 ? (
          <div className="px-4 py-10 text-center flex flex-col items-center">
            <p className="font-[family-name:var(--font-display)] text-[18px] italic text-[var(--text-secondary)]">
              A quiet month for the lawn.
            </p>
            <p className="font-[family-name:var(--font-body)] text-[13px] text-[var(--text-tertiary)] mt-2">
              No tasks scheduled for {MONTH_NAMES[activeMonth]}. Enable the Lawn module in Settings to see your seasonal schedule.
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {tasksForMonth.map((task) => {
              const isCompleted = completedSlugs.has(task.slug);
              const isExpanded = expandedTask === task.slug;

              return (
                <div key={task.slug} className="relative">
                  <div
                    className={[
                      'flex items-start min-h-[60px] px-4 py-3',
                      'transition-colors duration-[80ms] ease-out',
                      isExpanded ? 'bg-[var(--aged-paper)]' : 'hover:bg-[var(--aged-paper)]',
                    ].join(' ')}
                  >
                    {/* Checkbox */}
                    <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isCompleted}
                        onChange={() => toggleCompletion(task.slug)}
                        disabled={loadingCompletions}
                        aria-label={`Mark "${task.title}" as ${isCompleted ? 'incomplete' : 'complete'}`}
                      />
                    </div>

                    {/* Task content */}
                    <button
                      onClick={() => setExpandedTask(isExpanded ? null : task.slug)}
                      className="flex-1 text-left ml-1 cursor-pointer py-1"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={[
                            'font-[family-name:var(--font-body)] text-[16px]',
                            isCompleted
                              ? 'line-through text-[var(--text-tertiary)] opacity-60'
                              : 'text-[var(--iron-gall)]',
                          ].join(' ')}
                        >
                          {task.title}
                        </span>
                        {isCompleted && (
                          <span className="text-[var(--forest)] text-[12px]">✓</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-[family-name:var(--font-body)] text-[12px] text-[var(--text-tertiary)]">
                          {formatWindow(task)}
                        </span>
                        {isExpanded ? (
                          <ChevronUp size={14} className="text-[var(--text-tertiary)]" />
                        ) : (
                          <ChevronDown size={14} className="text-[var(--text-tertiary)]" />
                        )}
                      </div>
                    </button>
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-0 pl-[72px] bg-[var(--aged-paper)]">
                      <p className="font-[family-name:var(--font-body)] text-[14px] text-[var(--iron-gall)] leading-relaxed">
                        {task.content}
                      </p>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="absolute bottom-0 right-0 left-[64px] h-[0.5px] bg-[var(--hairline)]" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* All months quick nav */}
      <div className="px-4 pt-6 pb-4">
        <p className="font-[family-name:var(--font-display)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)] mb-3">
          Jump to month
        </p>
        <div className="flex flex-wrap gap-2">
          {months.map((month) => {
            const monthTasks = tasksByMonth[String(month)] || [];
            const allDone = monthTasks.every((t) => completedSlugs.has(t.slug));
            const isActive = month === activeMonth;

            return (
              <button
                key={month}
                onClick={() => setActiveMonth(month)}
                className={[
                  'px-3 py-1.5 rounded-full text-[12px] font-[family-name:var(--font-display)] font-medium transition-colors cursor-pointer',
                  isActive
                    ? 'bg-[var(--forest)] text-white'
                    : allDone && !loadingCompletions
                      ? 'bg-[var(--aged-paper)] text-[var(--text-tertiary)] line-through'
                      : 'bg-[var(--vellum)] text-[var(--iron-gall)] border border-[var(--hairline)]',
                ].join(' ')}
              >
                {MONTH_NAMES[month].slice(0, 3)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export { LawnDetail };
