import { db } from '@/lib/db';
import { notificationLog } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';

export async function hasBeenNotified(userId: string, topic: string): Promise<boolean> {
  const rows = await db
    .select({ id: notificationLog.id })
    .from(notificationLog)
    .where(and(eq(notificationLog.userId, userId), eq(notificationLog.topic, topic)))
    .limit(1);

  return rows.length > 0;
}

export async function logNotification(userId: string, channel: string, topic: string): Promise<void> {
  await db.insert(notificationLog).values({
    userId,
    channel,
    topic,
  });
}
