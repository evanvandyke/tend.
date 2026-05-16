import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { userModules } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getAllModules } from '@/lib/modules';

const toggleSchema = z.object({
  moduleSlug: z.string().min(1),
  enabled: z.boolean(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const allModules = getAllModules();

  // Get user's module settings
  const userSettings = await db
    .select()
    .from(userModules)
    .where(eq(userModules.userId, session.user.id));

  const settingsMap = new Map(
    userSettings.map((s) => [s.moduleSlug, s])
  );

  const result = allModules.map((mod) => {
    const setting = settingsMap.get(mod.slug);
    return {
      slug: mod.slug,
      name: mod.name,
      description: mod.description,
      region: mod.region,
      taskCount: mod.tasks.length,
      enabled: setting?.enabled ?? false,
      enabledAt: setting?.enabledAt ?? null,
    };
  });

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = toggleSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { moduleSlug, enabled } = parsed.data;

  // Verify module exists
  const { getModule } = await import('@/lib/modules');
  if (!getModule(moduleSlug)) {
    return NextResponse.json({ error: 'Module not found' }, { status: 404 });
  }

  // Upsert user module setting
  await db
    .insert(userModules)
    .values({
      userId: session.user.id,
      moduleSlug,
      enabled,
      enabledAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [userModules.userId, userModules.moduleSlug],
      set: { enabled, enabledAt: new Date() },
    });

  return NextResponse.json({ moduleSlug, enabled });
}
