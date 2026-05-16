'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MonthSelector } from '@/components/month-selector';
import { SectionHeader } from '@/components/section-header';
import { NowFeedItem, type NowFeedItemData } from '@/components/now-feed-item';
import { startOfWeek, format } from 'date-fns';

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface BrowseClientProps {
  initialMonth: number; // 1-12
  initialYear: number;
  initialItems: NowFeedItemData[];
}

type WeekGroup = {
  label: string;
  items: NowFeedItemData[];
};

function groupByWeek(items: NowFeedItemData[]): WeekGroup[] {
  const groups: Map<string, NowFeedItemData[]> = new Map();

  for (const item of items) {
    let weekLabel: string;
    if (item.dueDate) {
      const date = new Date(item.dueDate);
      const weekStart = startOfWeek(date, { weekStartsOn: 1 });
      weekLabel = `Week of ${format(weekStart, 'MMM d')}`;
    } else {
      weekLabel = 'Anytime';
    }

    if (!groups.has(weekLabel)) {
      groups.set(weekLabel, []);
    }
    groups.get(weekLabel)!.push(item);
  }

  return Array.from(groups.entries()).map(([label, items]) => ({ label, items }));
}

function BrowseClient({ initialMonth, initialYear, initialItems }: BrowseClientProps) {
  const router = useRouter();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [year, setYear] = useState(initialYear);
  const [items, setItems] = useState<NowFeedItemData[]>(initialItems);
  const [loading, setLoading] = useState(false);

  const fetchMonth = useCallback(async (m: number, y: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/browse?year=${y}&month=${m}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items);
      }
    } catch (err) {
      console.error('Failed to fetch browse feed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleMonthSelect = useCallback((month: number) => {
    // Handle year wrap
    if (month < selectedMonth && selectedMonth === 12 && month === 1) {
      setYear((y) => y + 1);
      setSelectedMonth(month);
      fetchMonth(month, year + 1);
    } else if (month > selectedMonth && selectedMonth === 1 && month === 12) {
      setYear((y) => y - 1);
      setSelectedMonth(month);
      fetchMonth(month, year - 1);
    } else {
      setSelectedMonth(month);
      fetchMonth(month, year);
    }
  }, [selectedMonth, year, fetchMonth]);

  const handleToggle = useCallback(async (id: string, type: NowFeedItemData['type']) => {
    try {
      if (type === 'user-task') {
        await fetch(`/api/tasks/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completed: true }),
        });
      } else if (type === 'module-task') {
        await fetch('/api/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId: id }),
        });
      }
      // Refresh the current month
      fetchMonth(selectedMonth, year);
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  }, [selectedMonth, year, fetchMonth]);

  const weekGroups = groupByWeek(items);

  return (
    <>
      <div className="sticky top-0 z-10 bg-[var(--parchment)] border-b border-[var(--hairline)]">
        <MonthSelector
          selectedMonth={selectedMonth}
          currentMonth={currentMonth}
          onSelect={handleMonthSelect}
        />
      </div>

      <main className="pb-40 pt-2">
        {loading && (
          <div className="flex items-center justify-center pt-12">
            <span className="font-[family-name:var(--font-body)] text-[14px] text-[var(--text-tertiary)]">
              Loading...
            </span>
          </div>
        )}

        {!loading && weekGroups.length === 0 && (
          <div className="flex flex-col items-center justify-center pt-24 px-6 text-center">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4 opacity-35">
              <path d="M20 6c0 7-5 12-12 14 7 2 12 7 12 14 0-7 5-12 12-14-7-2-12-7-12-14z" stroke="var(--text-tertiary)" strokeWidth="0.8" fill="none"/>
            </svg>
            <p className="font-[family-name:var(--font-display)] text-[22px] italic text-[var(--text-secondary)]">
              A quiet month.
            </p>
            <p className="font-[family-name:var(--font-body)] text-[14px] text-[var(--text-tertiary)] mt-3">
              No tasks scheduled for {MONTH_NAMES[selectedMonth]}.
            </p>
          </div>
        )}

        {!loading && weekGroups.map((group) => (
          <div key={group.label}>
            <SectionHeader title={group.label} />
            {group.items.map((item) => (
              <NowFeedItem key={item.id} item={item} onToggle={handleToggle} />
            ))}
          </div>
        ))}
      </main>

    </>
  );
}

export { BrowseClient };
