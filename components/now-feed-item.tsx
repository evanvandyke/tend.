'use client';

import React from 'react';
import { Moon } from 'lucide-react';
import { TaskRow } from '@/components/task-row';
import { ModuleTag } from '@/components/module-tag';

export type NowFeedItemType =
  | 'user-task'
  | 'module-task'
  | 'garden-task'
  | 'lunar-event';

export interface NowFeedItemData {
  id: string;
  type: NowFeedItemType;
  title: string;
  dueDate?: string;
  isCompleted?: boolean;
  moduleSource?: 'lawn' | 'garden' | 'project' | 'task';
  eventDate?: string;
}

interface NowFeedItemProps {
  item: NowFeedItemData;
  onToggle: (id: string, type: NowFeedItemType) => void;
}

function NowFeedItem({ item, onToggle }: NowFeedItemProps) {
  if (item.type === 'lunar-event') {
    return (
      <div className="flex items-center min-h-[60px] px-[16px] relative">
        <div className="w-[24px] h-[24px] flex items-center justify-center">
          <Moon size={18} strokeWidth={1.5} className="text-[var(--mustard)]" />
        </div>
        <div className="flex-1 flex flex-col gap-[2px] ml-[12px]">
          <span className="font-[family-name:var(--font-body)] text-[16px] text-[var(--iron-gall)]">
            {item.title}
          </span>
          <div className="flex items-center gap-[8px]">
            {item.eventDate && (
              <span className="font-[family-name:var(--font-body)] text-[13px] text-[var(--text-secondary)]">
                {item.eventDate}
              </span>
            )}
            <ModuleTag module="garden" label="Lunar Event" className="text-[var(--mustard)]" />
          </div>
        </div>
        <div className="absolute bottom-0 right-0 left-[48px] h-[0.5px] bg-[var(--hairline)]" />
      </div>
    );
  }

  // For user-task, module-task, garden-task — render TaskRow
  const moduleSource = item.type === 'garden-task' ? 'garden' as const : item.moduleSource;

  return (
    <TaskRow
      id={item.id}
      title={item.title}
      dueDate={item.dueDate}
      moduleSource={moduleSource}
      isCompleted={item.isCompleted ?? false}
      onToggle={() => onToggle(item.id, item.type)}
    />
  );
}

export { NowFeedItem };
