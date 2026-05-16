import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const body = await req.json();
  const { pushNotificationsEnabled } = body;

  if (typeof pushNotificationsEnabled !== 'boolean') {
    return new Response('Invalid body', { status: 400 });
  }

  await db
    .update(users)
    .set({ pushNotificationsEnabled })
    .where(eq(users.id, session.user.id));

  return Response.json({ ok: true });
}
