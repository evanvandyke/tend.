import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { users, pushSubscriptions, userTasks, userModules, lunarEvents } from '@/lib/db/schema';
import { eq, and, gte, lte, asc } from 'drizzle-orm';
import { startOfDay, addDays, getISOWeek } from 'date-fns';
import { hasBeenNotified, logNotification } from '@/lib/notifications/dedup';
import { sendPushNotification } from '@/lib/notifications/push';
import { getModule } from '@/lib/modules';
import { isInWindow } from '@/lib/modules/utils';

export async function GET(req: NextRequest) {
  // Verify cron secret
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const today = startOfDay(new Date());
  const year = today.getFullYear();
  const weekNumber = getISOWeek(today);
  const summary: string[] = [];

  // Get all users
  const allUsers = await db.select().from(users);

  for (const user of allUsers) {
    if (!user.pushNotificationsEnabled) continue;

    // Get user's push subscriptions
    const subs = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, user.id));

    if (subs.length === 0) continue;

    // Dedup: one briefing per week
    const topic = `weekend-briefing-${year}-w${weekNumber}`;
    if (await hasBeenNotified(user.id, topic)) continue;

    // --- Gather active tasks in their current window ---
    const allTasks = await db
      .select()
      .from(userTasks)
      .where(
        and(
          eq(userTasks.userId, user.id),
          eq(userTasks.status, 'active')
        )
      );

    const inWindowTasks = allTasks.filter((t) => {
      if (t.windowStartMonth && t.windowEndMonth) {
        const month = today.getMonth() + 1;
        const day = today.getDate();
        const afterStart =
          month > t.windowStartMonth ||
          (month === t.windowStartMonth && day >= (t.windowStartDay ?? 1));
        const beforeEnd =
          month < t.windowEndMonth ||
          (month === t.windowEndMonth && day <= (t.windowEndDay ?? 31));
        return afterStart && beforeEnd;
      }
      return true; // No window means always active
    });

    // --- Gather module tasks in-window ---
    const enabledModules = await db
      .select()
      .from(userModules)
      .where(
        and(
          eq(userModules.userId, user.id),
          eq(userModules.enabled, true)
        )
      );

    const moduleTaskNames: string[] = [];
    for (const um of enabledModules) {
      const mod = getModule(um.moduleSlug);
      if (!mod) continue;
      for (const task of mod.tasks) {
        if (isInWindow(today, task)) {
          moduleTaskNames.push(task.title);
        }
      }
    }

    // Combine task names
    const taskNames = [
      ...inWindowTasks.map((t) => t.title),
      ...moduleTaskNames,
    ];

    // --- Count active projects ---
    const activeProjects = allTasks.filter((t) => t.kind === 'project');

    // --- Weather forecast for tomorrow (Saturday) ---
    let weatherSnippet = '';
    if (user.locationZip && process.env.OPENWEATHERMAP_API_KEY) {
      try {
        const url = `https://api.openweathermap.org/data/2.5/forecast?zip=${user.locationZip},US&units=imperial&appid=${process.env.OPENWEATHERMAP_API_KEY}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          // Group by date, pick tomorrow (Saturday)
          const entriesByDate: Record<string, Array<{ main: { temp_max: number }; weather: Array<{ main: string }> }>> = {};
          for (const entry of data.list ?? []) {
            const dateStr = (entry.dt_txt as string).split(' ')[0];
            if (!entriesByDate[dateStr]) entriesByDate[dateStr] = [];
            entriesByDate[dateStr].push(entry);
          }
          const dates = Object.keys(entriesByDate).sort();
          const tomorrowStr = dates[1]; // Tomorrow = Saturday
          if (tomorrowStr && entriesByDate[tomorrowStr]) {
            const entries = entriesByDate[tomorrowStr];
            const high = Math.round(
              Math.max(...entries.map((e) => e.main.temp_max))
            );
            const conditionCounts: Record<string, number> = {};
            for (const entry of entries) {
              const cond = entry.weather?.[0]?.main ?? 'Clear';
              conditionCounts[cond] = (conditionCounts[cond] ?? 0) + 1;
            }
            const dominant = Object.entries(conditionCounts).sort((a, b) => b[1] - a[1])[0][0];
            const conditionLower = dominant.toLowerCase();
            weatherSnippet = `Saturday: ${high}°F, ${conditionLower}.`;
          }
        }
      } catch {
        // Weather fetch failed — skip it
      }
    }

    // --- Lunar events in next 7 days ---
    let lunarSnippet = '';
    const weekFromNow = addDays(today, 7);
    const upcomingLunar = await db
      .select()
      .from(lunarEvents)
      .where(and(gte(lunarEvents.eventDate, today), lte(lunarEvents.eventDate, weekFromNow)))
      .orderBy(asc(lunarEvents.eventDate));

    if (upcomingLunar.length > 0) {
      const event = upcomingLunar[0];
      const eventDate = new Date(event.eventDate);
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dateLabel = `${monthNames[eventDate.getMonth()]} ${eventDate.getDate()}`;
      lunarSnippet = `🌙 ${event.name} on ${dateLabel}.`;
    }

    // --- Compose notification ---
    let body: string;

    if (taskNames.length === 0 && activeProjects.length === 0) {
      body = 'Nothing on the list this weekend — enjoy the yard! 🌱';
    } else {
      const parts: string[] = [];

      if (taskNames.length > 0) {
        const displayNames = taskNames.slice(0, 3);
        const taskList = displayNames.join(', ');
        const suffix = taskNames.length > 3 ? ` (+${taskNames.length - 3} more)` : '';
        parts.push(`You’ve got ${taskNames.length} task${taskNames.length > 1 ? 's' : ''} this week: ${taskList}${suffix}.`);
      } else if (activeProjects.length > 0) {
        parts.push(`${activeProjects.length} active project${activeProjects.length > 1 ? 's' : ''} to check on.`);
      }

      if (weatherSnippet) parts.push(weatherSnippet);
      if (lunarSnippet) parts.push(lunarSnippet);

      body = parts.join(' ');
    }

    const payload = {
      title: '🌿 Your Weekend Tend List',
      body,
      url: '/',
    };

    // Send to all subscriptions
    for (const sub of subs) {
      try {
        await sendPushNotification(
          { endpoint: sub.endpoint, keys: sub.keys as { p256dh: string; auth: string } },
          payload
        );
      } catch (err) {
        console.error(`Push failed for sub ${sub.id}:`, err);
      }
    }

    await logNotification(user.id, 'push', topic);
    summary.push(`Sent "${payload.title}" to ${user.email} (topic: ${topic})`);
  }

  return Response.json({
    ok: true,
    sent: summary.length,
    details: summary,
  });
}
