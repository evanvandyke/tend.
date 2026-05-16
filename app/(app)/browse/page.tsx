import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getBrowseFeed } from '@/lib/db/queries';
import { format } from 'date-fns';
import { TopBar } from '@/components/top-bar';
import { BrowseClient } from '@/components/browse-client';

export default async function BrowsePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const feedItems = await getBrowseFeed(session.user.id, year, month);

  // Transform to client format
  const initialItems = feedItems.map((item) => ({
    id: item.id,
    type: item.type as 'user-task' | 'module-task' | 'garden-task' | 'lunar-event',
    title: item.title,
    dueDate: item.dueAt ? item.dueAt.toISOString() : undefined,
    isCompleted: item.isCompleted,
    moduleSource: item.moduleTag === 'lunar-event' ? undefined : (item.moduleTag as 'lawn' | 'garden' | 'project' | 'task' | undefined),
    eventDate: item.type === 'lunar-event' && item.dueAt ? format(item.dueAt, 'MMM d') : undefined,
  }));

  return (
    <>
      <TopBar />
      <BrowseClient
        initialMonth={month}
        initialYear={year}
        initialItems={initialItems}
      />
    </>
  );
}
