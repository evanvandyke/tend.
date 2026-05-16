'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SectionHeader } from '@/components/section-header';
import { NowFeedItem, type NowFeedItemData } from '@/components/now-feed-item';
import { ProjectCard } from '@/components/project-card';
import { FAB } from '@/components/fab';
import { BottomNav } from '@/components/bottom-nav';
import { QuickAddSheet } from '@/components/quick-add-sheet';

export interface ProjectData {
  id: string;
  title: string;
  description?: string;
  subtaskCount?: number;
  completedCount?: number;
}

interface NowFeedClientProps {
  thisWeek: NowFeedItemData[];
  comingUp: NowFeedItemData[];
  openProjects: ProjectData[];
}

function NowFeedClient({ thisWeek, comingUp, openProjects }: NowFeedClientProps) {
  const router = useRouter();
  const [quickAddOpen, setQuickAddOpen] = useState(false);

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
      router.refresh();
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  }, [router]);

  return (
    <>
      <main className="pb-40 pt-2">
        {thisWeek.length > 0 && (
          <>
            <SectionHeader title="This Week" />
            {thisWeek.map((item) => (
              <NowFeedItem key={item.id} item={item} onToggle={handleToggle} />
            ))}
          </>
        )}

        {comingUp.length > 0 && (
          <>
            <SectionHeader title="Coming Up" />
            {comingUp.map((item) => (
              <NowFeedItem key={item.id} item={item} onToggle={handleToggle} />
            ))}
          </>
        )}

        {openProjects.length > 0 && (
          <>
            <SectionHeader title="Open Projects" />
            <div className="px-4 flex flex-col gap-3">
              {openProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  title={project.title}
                  description={project.description}
                  subtaskCount={project.subtaskCount}
                  completedCount={project.completedCount}
                  onClick={() => router.push(`/projects/${project.id}`)}
                />
              ))}
            </div>
          </>
        )}

        {thisWeek.length === 0 && comingUp.length === 0 && openProjects.length === 0 && (
          <div className="flex flex-col items-center justify-center pt-24 px-6 text-center">
            {/* Botanical flourish */}
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4 opacity-40">
              <path d="M24 8c0 8-6 14-14 16 8 2 14 8 14 16 0-8 6-14 14-16-8-2-14-8-14-16z" stroke="var(--text-tertiary)" strokeWidth="1" fill="none"/>
              <path d="M24 14c0 5-3.5 9-8 10.5 4.5 1.5 8 5.5 8 10.5 0-5 3.5-9 8-10.5-4.5-1.5-8-5.5-8-10.5z" stroke="var(--text-tertiary)" strokeWidth="0.5" fill="none"/>
            </svg>
            <p className="font-[family-name:var(--font-display)] text-[22px] italic text-[var(--text-secondary)]">
              Nothing on the horizon.
            </p>
            <p className="font-[family-name:var(--font-body)] text-[14px] text-[var(--text-tertiary)] mt-3 leading-relaxed max-w-[260px]">
              Add a task with the + button below, or enable a module to get started.
            </p>
          </div>
        )}
      </main>

      <FAB onClick={() => setQuickAddOpen(true)} />
      <BottomNav />
      <QuickAddSheet
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onAdd={() => router.refresh()}
      />
    </>
  );
}

export { NowFeedClient };
