import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { userTasks } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { ProjectsPageClient } from './projects-client';

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const projects = await db
    .select()
    .from(userTasks)
    .where(
      and(
        eq(userTasks.userId, session.user.id),
        eq(userTasks.kind, 'project'),
        inArray(userTasks.status, ['active', 'pending', 'done'])
      )
    );

  const active = projects.filter((p) => p.status === 'active' || p.status === 'pending');
  const completed = projects.filter((p) => p.status === 'done');

  return <ProjectsPageClient active={active} completed={completed} />;
}
