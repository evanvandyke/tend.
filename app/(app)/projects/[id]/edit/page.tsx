import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { userTasks } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { redirect, notFound } from 'next/navigation';
import { EditProjectClient } from './edit-project-client';

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const { id } = await params;
  const taskId = parseInt(id, 10);
  if (isNaN(taskId)) notFound();

  const [project] = await db
    .select()
    .from(userTasks)
    .where(
      and(
        eq(userTasks.id, taskId),
        eq(userTasks.userId, session.user.id),
        eq(userTasks.kind, 'project')
      )
    );

  if (!project) notFound();

  return <EditProjectClient project={project} />;
}
