'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SectionHeader } from '@/components/section-header';
import { NowFeedItem, type NowFeedItemData } from '@/components/now-feed-item';
import { ProjectCard } from '@/components/project-card';
import { TaskEditSheet } from '@/components/task-edit-sheet';
import { ModuleTaskActionSheet } from '@/components/module-task-action-sheet';
import type { CompletionAnimState } from '@/components/task-row';

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
  doneToday?: NowFeedItemData[];
}

interface CollapsedState {
  thisWeek: boolean;
  comingUp: boolean;
  openProjects: boolean;
  doneToday: boolean;
}

interface PendingCompletion {
  id: string;
  type: NowFeedItemData['type'];
  title: string;
  timeoutId: ReturnType<typeof setTimeout>;
}

function NowFeedClient({ thisWeek, comingUp, openProjects, doneToday = [] }: NowFeedClientProps) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState<CollapsedState>({
    thisWeek: false,
    comingUp: true,
    openProjects: false,
    doneToday: true,
  });
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [moduleActionItem, setModuleActionItem] = useState<NowFeedItemData | null>(null);

  // Track animation states per task
  const [animStates, setAnimStates] = useState<Record<string, CompletionAnimState>>({});
  // Track pending completions for undo
  const [pendingCompletions, setPendingCompletions] = useState<PendingCompletion[]>([]);
  // Track tasks that have been optimistically removed from the feed
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  // Ref to access latest pending completions in callbacks
  const pendingRef = useRef<PendingCompletion[]>([]);
  pendingRef.current = pendingCompletions;

  const toggleSection = useCallback((section: keyof CollapsedState) => {
    setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }));
  }, []);

  const handleTaskPress = useCallback((id: string, type: NowFeedItemData['type']) => {
    if (type === 'user-task') {
      setEditingTaskId(id);
    } else if (type === 'module-task' || type === 'garden-task') {
      const allItems = [...thisWeek, ...comingUp];
      const item = allItems.find(i => i.id === id);
      if (item) setModuleActionItem(item);
    }
  }, [thisWeek, comingUp]);

  const executeCompletion = useCallback(async (id: string, type: NowFeedItemData['type']) => {
    try {
      if (type === 'user-task') {
        await fetch(`/api/tasks/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'done' }),
        });
      } else if (type === 'module-task' || type === 'garden-task') {
        // Look up moduleSlug and taskSlug from the feed item data
        const allItems = [...thisWeek, ...comingUp];
        const item = allItems.find(i => i.id === id);

        if (item?.moduleSlug && item?.taskSlug) {
          const year = new Date().getFullYear();
          await fetch('/api/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              moduleSlug: item.moduleSlug,
              taskSlug: item.taskSlug,
              year,
            }),
          });
        }
      }
      router.refresh();
    } catch (err) {
      console.error('Failed to complete task:', err);
    }
  }, [router, thisWeek, comingUp]);

  const handleToggle = useCallback((id: string, type: NowFeedItemData['type']) => {
    // Don't allow completing lunar events or already-pending items
    if (type === 'lunar-event') return;
    if (pendingRef.current.some(p => p.id === id)) return;

    // Find task title for toast
    const allItems = [...thisWeek, ...comingUp];
    const item = allItems.find(i => i.id === id);
    const title = item?.title ?? 'Task';

    // Start animation sequence
    setAnimStates(prev => ({ ...prev, [id]: 'completing' }));

    // After 80ms hold + 250ms animation, mark as completed
    setTimeout(() => {
      setAnimStates(prev => ({ ...prev, [id]: 'completed' }));
    }, 330);

    // Set up the delayed API call (3.5s undo window)
    const timeoutId = setTimeout(() => {
      // Start collapse animation
      setAnimStates(prev => ({ ...prev, [id]: 'collapsing' }));

      // After collapse finishes, hide the row and execute API call
      setTimeout(() => {
        setHiddenIds(prev => new Set([...prev, id]));
        setAnimStates(prev => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        setPendingCompletions(prev => prev.filter(p => p.id !== id));
        executeCompletion(id, type);
      }, 250);
    }, 3500);

    setPendingCompletions(prev => [...prev, { id, type, title, timeoutId }]);
  }, [thisWeek, comingUp, executeCompletion]);

  const handleUndo = useCallback((id: string) => {
    const pending = pendingRef.current.find(p => p.id === id);
    if (!pending) return;

    // Cancel the delayed API call
    clearTimeout(pending.timeoutId);

    // Revert animation state
    setAnimStates(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

    // Remove from pending
    setPendingCompletions(prev => prev.filter(p => p.id !== id));
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      pendingRef.current.forEach(p => clearTimeout(p.timeoutId));
    };
  }, []);

  // Filter hidden items from display
  const visibleThisWeek = thisWeek.filter(item => !hiddenIds.has(item.id));
  const visibleComingUp = comingUp.filter(item => !hiddenIds.has(item.id));

  return (
    <>
      <main className="relative pb-40 pt-2">
        {visibleThisWeek.length > 0 && (
          <>
            <SectionHeader
              title="This Week"
              collapsible
              isCollapsed={collapsed.thisWeek}
              itemCount={visibleThisWeek.length}
              onToggle={() => toggleSection('thisWeek')}
            />
            {!collapsed.thisWeek && (
              <div className="section-content">
                {visibleThisWeek.map((item) => (
                  <NowFeedItem
                    key={item.id}
                    item={item}
                    animState={animStates[item.id]}
                    onToggle={handleToggle}
                    onPress={handleTaskPress}
                    onUndo={handleUndo}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {visibleComingUp.length > 0 && (
          <>
            <SectionHeader
              title="Coming Up"
              collapsible
              isCollapsed={collapsed.comingUp}
              itemCount={visibleComingUp.length}
              onToggle={() => toggleSection('comingUp')}
            />
            {!collapsed.comingUp && (
              <div className="section-content">
                {visibleComingUp.map((item) => (
                  <NowFeedItem
                    key={item.id}
                    item={item}
                    animState={animStates[item.id]}
                    onToggle={handleToggle}
                    onPress={handleTaskPress}
                    onUndo={handleUndo}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {openProjects.length > 0 && (
          <>
            <SectionHeader
              title="Open Projects"
              collapsible
              isCollapsed={collapsed.openProjects}
              itemCount={openProjects.length}
              onToggle={() => toggleSection('openProjects')}
            />
            {!collapsed.openProjects && (
              <div className="px-4 flex flex-col gap-3 section-content">
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
            )}
          </>
        )}

        {doneToday.length > 0 && (
          <>
            <SectionHeader
              title="Done Today"
              collapsible
              isCollapsed={collapsed.doneToday}
              itemCount={doneToday.length}
              onToggle={() => toggleSection('doneToday')}
            />
            {!collapsed.doneToday && (
              <div className="section-content">
                {doneToday.map((item) => (
                  <NowFeedItem
                    key={item.id}
                    item={{ ...item, isCompleted: true }}
                    onToggle={() => {}}
                    onPress={handleTaskPress}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {visibleThisWeek.length === 0 && visibleComingUp.length === 0 && openProjects.length === 0 && (
          <div className="flex flex-col items-center justify-center pt-24 px-6 text-center">
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

      <TaskEditSheet
        open={editingTaskId !== null}
        taskId={editingTaskId}
        onClose={() => setEditingTaskId(null)}
        onSaved={() => router.refresh()}
        onDeleted={() => router.refresh()}
      />

      <ModuleTaskActionSheet
        open={moduleActionItem !== null}
        item={moduleActionItem}
        onClose={() => setModuleActionItem(null)}
        onCompleted={() => router.refresh()}
      />
    </>
  );
}

export { NowFeedClient };
