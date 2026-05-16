import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { users, pushSubscriptions, userTasks, lunarEvents } from '@/lib/db/schema';
import { eq, and, lte, gte, asc } from 'drizzle-orm';
import { startOfDay, addDays, differenceInDays, getISOWeek } from 'date-fns';
import { checkFrostWarning } from '@/lib/notifications/frost';
import { hasBeenNotified, logNotification } from '@/lib/notifications/dedup';
import { sendPushNotification } from '@/lib/notifications/push';

export async function GET(req: NextRequest) {
  // Verify cron secret
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const today = startOfDay(new Date());
  const todayStr = today.toISOString().split('T')[0];
  const weekNumber = getISOWeek(today);
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

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

    // Helper to send to all user subs
    async function sendToUser(payload: { title: string; body: string; url?: string }, topic: string) {
      for (const sub of subs) {
        try {
          await sendPushNotification(
            { endpoint: sub.endpoint, keys: sub.keys as { p256dh: string; auth: string } },
            payload
          );
        } catch (err) {
          // Subscription may be expired — log but continue
          console.error(`Push failed for sub ${sub.id}:`, err);
        }
      }
      await logNotification(user.id, 'push', topic);
      summary.push(`Sent "${payload.title}" to ${user.email} (topic: ${topic})`);
    }

    // 1. Frost check
    if (user.locationZip) {
      try {
        const frost = await checkFrostWarning(user.locationZip);
        if (frost.shouldWarn && frost.date) {
          const topic = `frost-${frost.date}`;
          if (!(await hasBeenNotified(user.id, topic))) {
            await sendToUser(
              {
                title: '🥶 Frost Warning',
                body: `Low of ${frost.low}°F expected on ${frost.date}. Cover tender plants!`,
                url: '/',
              },
              topic
            );
          }
        }
      } catch (err) {
        console.error(`Frost check failed for ${user.email}:`, err);
      }
    }

    // 2. Lunar events today
    const todayEnd = addDays(today, 1);
    const lunarToday = await db
      .select()
      .from(lunarEvents)
      .where(and(gte(lunarEvents.eventDate, today), lte(lunarEvents.eventDate, todayEnd)))
      .orderBy(asc(lunarEvents.eventDate));

    for (const event of lunarToday) {
      const topic = `lunar-${todayStr}-${event.eventType}`;
      if (!(await hasBeenNotified(user.id, topic))) {
        await sendToUser(
          {
            title: `🌙 ${event.name}`,
            body: event.description || `Today: ${event.name}`,
            url: '/',
          },
          topic
        );
      }
    }

    // 3. Stale tasks — module tasks in-window for 7+ days without completion
    const staleTopic = `stale-tasks-${today.getFullYear()}-w${weekNumber}`;
    if (!(await hasBeenNotified(user.id, staleTopic))) {
      const sevenDaysAgo = addDays(today, -7);
      const staleTasks = await db
        .select()
        .from(userTasks)
        .where(
          and(
            eq(userTasks.userId, user.id),
            eq(userTasks.status, 'active'),
            lte(userTasks.createdAt, sevenDaysAgo)
          )
        );

      // Filter to tasks that are in their window and have no recent completion
      const overdueTasks = staleTasks.filter((t) => {
        if (t.lastCompletedAt && differenceInDays(today, t.lastCompletedAt) < 7) return false;
        // Check if task is in its window
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

      if (overdueTasks.length > 0) {
        await sendToUser(
          {
            title: '📋 Tasks Need Attention',
            body: `${overdueTasks.length} task${overdueTasks.length > 1 ? 's' : ''} waiting for you this week.`,
            url: '/',
          },
          staleTopic
        );
      }
    }

    // 4. Project nudges — active projects with no update in 30+ days
    const activeProjects = await db
      .select()
      .from(userTasks)
      .where(
        and(
          eq(userTasks.userId, user.id),
          eq(userTasks.status, 'active'),
          eq(userTasks.kind, 'project')
        )
      );

    for (const project of activeProjects) {
      const lastUpdate = project.updatedAt ?? project.createdAt;
      const daysSinceUpdate = differenceInDays(today, lastUpdate);

      if (daysSinceUpdate >= 30) {
        const topic = `project-nudge-${project.id}-${currentMonth}`;
        if (!(await hasBeenNotified(user.id, topic))) {
          await sendToUser(
            {
              title: '🌱 Project Check-in',
              body: `"${project.title}" hasn't been updated in ${daysSinceUpdate} days. Still growing?`,
              url: '/',
            },
            topic
          );
        }
      }
    }
  }

  return Response.json({
    ok: true,
    sent: summary.length,
    details: summary,
  });
}
