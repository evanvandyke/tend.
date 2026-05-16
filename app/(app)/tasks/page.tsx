import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getAllUserTasks, getEnabledModules, getRoutineTasks } from '@/lib/db/queries';
import { getModule } from '@/lib/modules/index';
import { TasksListClient } from '@/components/tasks-list-client';
import type { ModuleSourceOption } from '@/components/tasks-list-client';

export default async function TasksPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const [tasks, routineTasks, enabledModules] = await Promise.all([
    getAllUserTasks(session.user.id),
    getRoutineTasks(session.user.id),
    getEnabledModules(session.user.id),
  ]);

  // Build module source options from enabled modules.
  // The routine tasks use a simplified 'source' field (e.g. 'lawn' not 'lawn-utah'),
  // so we derive the filter slug the same way getRoutineTasks does.
  const moduleSources: ModuleSourceOption[] = enabledModules.map((moduleSlug) => {
    const mod = getModule(moduleSlug);
    const label = mod?.name ?? moduleSlug.charAt(0).toUpperCase() + moduleSlug.slice(1);
    // Match the source key used in RoutineTaskItem
    const filterSlug = moduleSlug.startsWith('lawn') ? 'lawn' : moduleSlug;
    return { slug: filterSlug, label };
  });

  return (
    <TasksListClient tasks={tasks} routineTasks={routineTasks} moduleSources={moduleSources} />
  );
}
