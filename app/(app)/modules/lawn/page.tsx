import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { TopBar } from '@/components/top-bar';
import { LawnDetail } from '@/components/lawn-detail';
import { getModule } from '@/lib/modules';

export default async function LawnModulePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const lawnModule = getModule('lawn-utah');
  if (!lawnModule) redirect('/modules');

  // Group tasks by their starting month
  const tasksByMonth: Record<number, typeof lawnModule.tasks> = {};
  for (const task of lawnModule.tasks) {
    const month = task.windowStart?.month ?? 1;
    if (!tasksByMonth[month]) tasksByMonth[month] = [];
    tasksByMonth[month].push(task);
  }

  // Serialize for client component
  const serializedTasksByMonth = Object.fromEntries(
    Object.entries(tasksByMonth).map(([month, tasks]) => [
      month,
      tasks.map((t) => ({
        slug: t.slug,
        title: t.title,
        content: t.content,
        windowStart: t.windowStart,
        windowEnd: t.windowEnd,
      })),
    ])
  );

  return (
    <>
      <TopBar />
      <main className="flex-1 pb-20">
        <LawnDetail tasksByMonth={serializedTasksByMonth} />
      </main>
    </>
  );
}
