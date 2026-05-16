import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { format } from 'date-fns';
import { TopBar } from '@/components/top-bar';
import { NowFeedClient, type ProjectData } from '@/components/now-feed-client';
import type { NowFeedItemData } from '@/components/now-feed-item';
import { getNowFeed, getCompletedToday, type FeedItem } from '@/lib/db/queries';

function toISODateString(date?: Date | string): string | undefined {
  if (!date) return undefined;
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

function feedItemToClientData(item: FeedItem): NowFeedItemData {
  const dueAt = item.dueAt ? (typeof item.dueAt === 'string' ? new Date(item.dueAt as string) : item.dueAt) : undefined;

  return {
    id: item.type === 'user-task' ? String(item.taskId) : item.id,
    type: item.type,
    title: item.title,
    content: item.content,
    dueDate: toISODateString(item.dueAt),
    isCompleted: item.isCompleted,
    moduleSource: item.moduleTag === 'lunar-event' ? undefined : item.moduleTag,
    eventDate: item.type === 'lunar-event' && dueAt ? format(dueAt, 'MMM d') : undefined,
    moduleSlug: item.moduleSlug,
    taskSlug: item.taskSlug,
  };
}

export default async function NowPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const [feed, completedToday] = await Promise.all([
    getNowFeed(session.user.id),
    getCompletedToday(session.user.id),
  ]);

  const thisWeek: NowFeedItemData[] = feed.thisWeek.map(feedItemToClientData);
  const comingUp: NowFeedItemData[] = feed.comingUp.map(feedItemToClientData);
  const openProjects: ProjectData[] = feed.openProjects.map((p) => ({
    id: String(p.taskId),
    title: p.title,
    description: p.content,
  }));
  const doneToday: NowFeedItemData[] = completedToday.map(feedItemToClientData);

  return (
    <>
      <TopBar />
      <NowFeedClient
        thisWeek={thisWeek}
        comingUp={comingUp}
        openProjects={openProjects}
        doneToday={doneToday}
      />
    </>
  );
}
