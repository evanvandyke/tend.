import { db } from '@/lib/db';
import { lunarEvents, users, userTasks, userModules, userModuleCompletions } from './schema';
import { gte, lte, asc, and, eq, or, isNull, ne, desc } from 'drizzle-orm';
import { addDays, differenceInDays, startOfDay, startOfMonth, endOfMonth } from 'date-fns';
import { getModule, isInWindow } from '@/lib/modules';
import { computeGardenTasks } from '@/lib/modules/garden';

// === Types ===

export type FeedItem = {
  id: string;
  type: 'user-task' | 'module-task' | 'garden-task' | 'lunar-event';
  title: string;
  content?: string;
  source?: string;
  moduleTag?: 'lawn' | 'garden' | 'project' | 'task' | 'lunar-event';
  dueAt?: Date;
  isCompleted: boolean;
  // For user tasks:
  taskId?: number;
  kind?: string;
  projectData?: unknown;
  // For module tasks:
  moduleSlug?: string;
  taskSlug?: string;
  // For garden tasks:
  plantName?: string;
  // For lunar:
  eventType?: string;
  lunarName?: string;
};

export type NowFeedResult = {
  thisWeek: FeedItem[];
  comingUp: FeedItem[];
  openProjects: FeedItem[];
};

// === Helpers ===

export async function getUser(userId: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return user ?? null;
}

export async function getEnabledModules(userId: string): Promise<string[]> {
  const rows = await db
    .select({ moduleSlug: userModules.moduleSlug })
    .from(userModules)
    .where(and(eq(userModules.userId, userId), eq(userModules.enabled, true)));
  return rows.map((r) => r.moduleSlug);
}

// === Lunar Events ===

export async function getUpcomingLunarEvents(fromDate: Date, days: number = 7) {
  const toDate = addDays(fromDate, days);

  return db
    .select()
    .from(lunarEvents)
    .where(
      and(
        gte(lunarEvents.eventDate, fromDate),
        lte(lunarEvents.eventDate, toDate)
      )
    )
    .orderBy(asc(lunarEvents.eventDate));
}

// === Now Feed ===

function sortByDueAtNullsLast(a: FeedItem, b: FeedItem): number {
  if (!a.dueAt && !b.dueAt) return 0;
  if (!a.dueAt) return 1;
  if (!b.dueAt) return -1;
  return a.dueAt.getTime() - b.dueAt.getTime();
}

export async function getNowFeed(userId: string): Promise<NowFeedResult> {
  const today = startOfDay(new Date());
  const in7Days = addDays(today, 7);
  const in30Days = addDays(today, 30);

  const thisWeek: FeedItem[] = [];
  const comingUp: FeedItem[] = [];
  const openProjects: FeedItem[] = [];

  // 1. User tasks (active, due within 30 days or no due date, excluding projects)
  const activeUserTasks = await db
    .select()
    .from(userTasks)
    .where(
      and(
        eq(userTasks.userId, userId),
        eq(userTasks.status, 'active'),
        or(
          isNull(userTasks.dueAt),
          lte(userTasks.dueAt, in30Days)
        )
      )
    )
    .orderBy(asc(userTasks.dueAt));

  for (const task of activeUserTasks) {
    // Projects go to their own section
    if (task.kind === 'project') {
      openProjects.push({
        id: `user-task-${task.id}`,
        type: 'user-task',
        title: task.title,
        content: task.content ?? undefined,
        moduleTag: 'project',
        dueAt: task.dueAt ?? undefined,
        isCompleted: false,
        taskId: task.id,
        kind: task.kind,
        projectData: task.projectData,
      });
      continue;
    }

    const item: FeedItem = {
      id: `user-task-${task.id}`,
      type: 'user-task',
      title: task.title,
      content: task.content ?? undefined,
      moduleTag: 'task',
      dueAt: task.dueAt ?? undefined,
      isCompleted: false,
      taskId: task.id,
      kind: task.kind,
    };

    if (!task.dueAt || task.dueAt <= in7Days) {
      thisWeek.push(item);
    } else {
      comingUp.push(item);
    }
  }

  // 2. Module tasks (for each enabled module, check in-window and completions)
  const enabledModuleSlugs = await getEnabledModules(userId);
  const currentYear = today.getFullYear();

  for (const moduleSlug of enabledModuleSlugs) {
    // Garden is handled separately
    if (moduleSlug === 'garden') continue;

    const mod = getModule(moduleSlug);
    if (!mod) continue;

    // Get completions for this module this year
    const completions = await db
      .select({ taskSlug: userModuleCompletions.taskSlug })
      .from(userModuleCompletions)
      .where(
        and(
          eq(userModuleCompletions.userId, userId),
          eq(userModuleCompletions.moduleSlug, moduleSlug),
          eq(userModuleCompletions.year, currentYear)
        )
      );
    const completedSlugs = new Set(completions.map((c) => c.taskSlug));

    for (const task of mod.tasks) {
      if (completedSlugs.has(task.slug)) continue;

      const inWindowNow = isInWindow(today, task);

      // Check if window opens within next 30 days
      let windowOpensInRange = false;
      let windowOpenDate: Date | undefined;

      if (!inWindowNow && task.windowStart) {
        const windowStart = new Date(
          currentYear,
          task.windowStart.month - 1,
          task.windowStart.day
        );
        const daysUntilOpen = differenceInDays(windowStart, today);
        if (daysUntilOpen > 0 && daysUntilOpen <= 30) {
          windowOpensInRange = true;
          windowOpenDate = windowStart;
        }
      }

      if (!inWindowNow && !windowOpensInRange) continue;

      // Determine moduleTag from slug
      const moduleTag: FeedItem['moduleTag'] = moduleSlug.startsWith('lawn') ? 'lawn' : 'task';

      const item: FeedItem = {
        id: `module-${moduleSlug}-${task.slug}`,
        type: 'module-task',
        title: task.title,
        content: task.content,
        source: moduleSlug,
        moduleTag,
        dueAt: windowOpenDate,
        isCompleted: false,
        moduleSlug,
        taskSlug: task.slug,
      };

      if (inWindowNow) {
        thisWeek.push(item);
      } else {
        // Window opens in next 30 days but not yet
        if (windowOpenDate && windowOpenDate <= in7Days) {
          thisWeek.push(item);
        } else {
          comingUp.push(item);
        }
      }
    }
  }

  // 3. Garden tasks
  if (enabledModuleSlugs.includes('garden')) {
    const gardenTasks = await computeGardenTasks(userId, today);

    for (const gt of gardenTasks) {
      const daysUntil = differenceInDays(gt.date, today);

      // For garden tasks whose computed date has passed, don't set dueAt —
      // they're still actionable ("do now"), not overdue. Being in "This Week"
      // already communicates urgency. Only show the date for future tasks.
      const item: FeedItem = {
        id: `garden-${gt.plantSlug}-${gt.taskSlug}`,
        type: 'garden-task',
        title: gt.title,
        content: gt.content,
        source: 'garden',
        moduleTag: 'garden',
        dueAt: daysUntil >= 0 ? gt.date : undefined,
        isCompleted: false,
        plantName: gt.customName ?? gt.plantName,
        moduleSlug: 'garden',
        taskSlug: gt.taskSlug,
      };

      if (daysUntil <= 7) {
        thisWeek.push(item);
      } else {
        comingUp.push(item);
      }
    }
  }

  // 4. Lunar events (next 30 days)
  const lunarRows = await getUpcomingLunarEvents(today, 30);

  for (const event of lunarRows) {
    const daysUntil = differenceInDays(startOfDay(event.eventDate), today);

    const item: FeedItem = {
      id: `lunar-${event.id}`,
      type: 'lunar-event',
      title: event.name,
      content: event.description ?? undefined,
      moduleTag: 'lunar-event',
      dueAt: event.eventDate,
      isCompleted: false,
      eventType: event.eventType,
      lunarName: event.name,
    };

    if (daysUntil <= 7) {
      thisWeek.push(item);
    } else {
      comingUp.push(item);
    }
  }

  // Sort each section
  thisWeek.sort(sortByDueAtNullsLast);
  comingUp.sort(sortByDueAtNullsLast);
  openProjects.sort(sortByDueAtNullsLast);

  return { thisWeek, comingUp, openProjects };
}

// === Completed Today ===

export async function getCompletedToday(userId: string): Promise<FeedItem[]> {
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);
  const items: FeedItem[] = [];

  // 1. User tasks completed today
  const completedUserTasks = await db
    .select()
    .from(userTasks)
    .where(
      and(
        eq(userTasks.userId, userId),
        eq(userTasks.status, 'done'),
        gte(userTasks.completedAt, today),
        lte(userTasks.completedAt, tomorrow)
      )
    )
    .orderBy(asc(userTasks.completedAt));

  for (const task of completedUserTasks) {
    items.push({
      id: `user-task-${task.id}`,
      type: 'user-task',
      title: task.title,
      content: task.content ?? undefined,
      moduleTag: task.kind === 'project' ? 'project' : 'task',
      dueAt: task.dueAt ?? undefined,
      isCompleted: true,
      taskId: task.id,
      kind: task.kind,
    });
  }

  // 2. Module completions from today
  const todayCompletions = await db
    .select()
    .from(userModuleCompletions)
    .where(
      and(
        eq(userModuleCompletions.userId, userId),
        gte(userModuleCompletions.completedAt, today),
        lte(userModuleCompletions.completedAt, tomorrow)
      )
    );

  for (const completion of todayCompletions) {
    const mod = getModule(completion.moduleSlug);
    const task = mod?.tasks.find((t) => t.slug === completion.taskSlug);
    const title = task?.title ?? completion.taskSlug;
    const moduleTag: FeedItem['moduleTag'] = completion.moduleSlug.startsWith('lawn') ? 'lawn' :
      completion.moduleSlug === 'garden' ? 'garden' : 'task';

    items.push({
      id: `module-${completion.moduleSlug}-${completion.taskSlug}`,
      type: 'module-task',
      title,
      source: completion.moduleSlug,
      moduleTag,
      isCompleted: true,
      moduleSlug: completion.moduleSlug,
      taskSlug: completion.taskSlug,
    });
  }

  return items;
}

// === Browse Feed ===

export async function getBrowseFeed(userId: string, year: number, month: number): Promise<FeedItem[]> {
  const monthStart = startOfMonth(new Date(year, month - 1));
  const monthEnd = endOfMonth(new Date(year, month - 1));

  const items: FeedItem[] = [];

  // 1. User tasks with dueAt in the selected month
  const userTasksInMonth = await db
    .select()
    .from(userTasks)
    .where(
      and(
        eq(userTasks.userId, userId),
        eq(userTasks.status, 'active'),
        gte(userTasks.dueAt, monthStart),
        lte(userTasks.dueAt, monthEnd)
      )
    )
    .orderBy(asc(userTasks.dueAt));

  for (const task of userTasksInMonth) {
    items.push({
      id: `user-task-${task.id}`,
      type: 'user-task',
      title: task.title,
      content: task.content ?? undefined,
      moduleTag: task.kind === 'project' ? 'project' : 'task',
      dueAt: task.dueAt ?? undefined,
      isCompleted: false,
      taskId: task.id,
      kind: task.kind,
    });
  }

  // 2. Module tasks whose windows overlap the selected month
  const enabledModuleSlugs = await getEnabledModules(userId);

  for (const moduleSlug of enabledModuleSlugs) {
    if (moduleSlug === 'garden') continue;

    const mod = getModule(moduleSlug);
    if (!mod) continue;

    // Get completions for this module this year
    const completions = await db
      .select({ taskSlug: userModuleCompletions.taskSlug })
      .from(userModuleCompletions)
      .where(
        and(
          eq(userModuleCompletions.userId, userId),
          eq(userModuleCompletions.moduleSlug, moduleSlug),
          eq(userModuleCompletions.year, year)
        )
      );
    const completedSlugs = new Set(completions.map((c) => c.taskSlug));

    for (const task of mod.tasks) {
      if (completedSlugs.has(task.slug)) continue;

      // Check if the task's window overlaps with the selected month
      if (task.windowStart && task.windowEnd) {
        const windowStart = new Date(year, task.windowStart.month - 1, task.windowStart.day);
        const windowEnd = new Date(year, task.windowEnd.month - 1, task.windowEnd.day);

        // Check overlap: window overlaps month if windowStart <= monthEnd AND windowEnd >= monthStart
        const overlaps = windowStart <= monthEnd && windowEnd >= monthStart;
        if (!overlaps) continue;
      }
      // If no window defined, task is always active — include it

      const moduleTag: FeedItem['moduleTag'] = moduleSlug.startsWith('lawn') ? 'lawn' : 'task';

      // Use windowStart as dueAt if available, otherwise first day of month
      let taskDueAt: Date | undefined;
      if (task.windowStart) {
        const ws = new Date(year, task.windowStart.month - 1, task.windowStart.day);
        taskDueAt = ws >= monthStart ? ws : monthStart;
      }

      items.push({
        id: `module-${moduleSlug}-${task.slug}`,
        type: 'module-task',
        title: task.title,
        content: task.content,
        source: moduleSlug,
        moduleTag,
        dueAt: taskDueAt,
        isCompleted: false,
        moduleSlug,
        taskSlug: task.slug,
      });
    }
  }

  // 3. Garden tasks with computed dates in that month
  if (enabledModuleSlugs.includes('garden')) {
    const gardenTasks = await computeGardenTasksForMonth(userId, year, month);

    for (const gt of gardenTasks) {
      items.push({
        id: `garden-${gt.plantSlug}-${gt.taskSlug}`,
        type: 'garden-task',
        title: gt.title,
        content: gt.content,
        source: 'garden',
        moduleTag: 'garden',
        dueAt: gt.date,
        isCompleted: false,
        plantName: gt.customName ?? gt.plantName,
        moduleSlug: 'garden',
        taskSlug: gt.taskSlug,
      });
    }
  }

  // 4. Lunar events in that month
  const lunarRows = await db
    .select()
    .from(lunarEvents)
    .where(
      and(
        gte(lunarEvents.eventDate, monthStart),
        lte(lunarEvents.eventDate, monthEnd)
      )
    )
    .orderBy(asc(lunarEvents.eventDate));

  for (const event of lunarRows) {
    items.push({
      id: `lunar-${event.id}`,
      type: 'lunar-event',
      title: event.name,
      content: event.description ?? undefined,
      moduleTag: 'lunar-event',
      dueAt: event.eventDate,
      isCompleted: false,
      eventType: event.eventType,
      lunarName: event.name,
    });
  }

  // Sort by date
  items.sort(sortByDueAtNullsLast);

  return items;
}

// Garden tasks computed for a specific month (no 14-day window constraint)
async function computeGardenTasksForMonth(
  userId: string,
  year: number,
  month: number
): Promise<Array<{
  plantSlug: string;
  plantName: string;
  customName: string | null;
  taskSlug: string;
  title: string;
  content: string;
  date: Date;
}>> {
  const { gardenPlants, userModuleCompletions: umc } = await import('./schema');
  const { getFrostDates } = await import('@/lib/frost');
  const { getPlantBySlug } = await import('@/lib/modules/garden');

  const monthStart = startOfMonth(new Date(year, month - 1));
  const monthEnd = endOfMonth(new Date(year, month - 1));

  const [user] = await db
    .select({ locationZip: users.locationZip })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user?.locationZip) return [];

  const { lastSpringFrost } = getFrostDates(user.locationZip);

  const plants = await db
    .select()
    .from(gardenPlants)
    .where(and(eq(gardenPlants.userId, userId), eq(gardenPlants.archived, false)));

  if (plants.length === 0) return [];

  const completions = await db
    .select()
    .from(umc)
    .where(
      and(
        eq(umc.userId, userId),
        eq(umc.moduleSlug, 'garden'),
        eq(umc.year, year)
      )
    );
  const completedSet = new Set(completions.map((c) => c.taskSlug));

  const tasks: Array<{
    plantSlug: string;
    plantName: string;
    customName: string | null;
    taskSlug: string;
    title: string;
    content: string;
    date: Date;
  }> = [];

  for (const plant of plants) {
    const definition = getPlantBySlug(plant.plantSlug);
    if (!definition) continue;

    for (const taskTemplate of definition.tasks) {
      const completionKey = `${plant.id}-${taskTemplate.slug}`;
      if (completedSet.has(completionKey)) continue;

      const taskDate = startOfDay(
        addDays(lastSpringFrost, taskTemplate.daysRelativeToFrost)
      );

      // Only include tasks in the target month
      if (taskDate >= monthStart && taskDate <= monthEnd) {
        tasks.push({
          plantSlug: plant.plantSlug,
          plantName: definition.name,
          customName: plant.customName,
          taskSlug: completionKey,
          title: taskTemplate.title,
          content: taskTemplate.content,
          date: taskDate,
        });
      }
    }
  }

  tasks.sort((a, b) => a.date.getTime() - b.date.getTime());
  return tasks;
}

// === All User Tasks (for Tasks page) ===

export type UserTaskItem = {
  id: number;
  kind: string;
  status: string;
  title: string;
  dueAt: string | null;
  completedAt: string | null;
};

export async function getAllUserTasks(userId: string): Promise<UserTaskItem[]> {
  const tasks = await db
    .select({
      id: userTasks.id,
      kind: userTasks.kind,
      status: userTasks.status,
      title: userTasks.title,
      dueAt: userTasks.dueAt,
      completedAt: userTasks.completedAt,
    })
    .from(userTasks)
    .where(
      and(
        eq(userTasks.userId, userId),
        ne(userTasks.status, 'archived')
      )
    )
    .orderBy(desc(userTasks.createdAt));

  return tasks.map((t) => ({
    id: t.id,
    kind: t.kind,
    status: t.status,
    title: t.title,
    dueAt: t.dueAt ? t.dueAt.toISOString() : null,
    completedAt: t.completedAt ? t.completedAt.toISOString() : null,
  }));
}
