import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getAllUserTasks, getEnabledModules, getRoutineTasks } from '@/lib/db/queries';
import { TopBar } from '@/components/top-bar';
import { TasksListClient } from '@/components/tasks-list-client';

export default async function TasksPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const [tasks, routineTasks] = await Promise.all([
    getAllUserTasks(session.user.id),
    getRoutineTasks(session.user.id),
  ]);

  return (
    <>
      <TopBar />
      <TasksListClient tasks={tasks} routineTasks={routineTasks} />
    </>
  );
}
