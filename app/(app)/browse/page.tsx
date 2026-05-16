import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getAllUserTasks } from '@/lib/db/queries';
import { TopBar } from '@/components/top-bar';
import { TasksListClient } from '@/components/tasks-list-client';

export default async function TasksPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const tasks = await getAllUserTasks(session.user.id);

  return (
    <>
      <TopBar />
      <TasksListClient tasks={tasks} />
    </>
  );
}
