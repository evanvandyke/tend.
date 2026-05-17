import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  await db
    .update(users)
    .set({ onboardingComplete: true })
    .where(eq(users.id, session.user.id));

  return Response.json({ ok: true });
}
