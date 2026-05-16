import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { userTasks } from '@/lib/db/schema';
import { eq, and, asc, desc, sql } from 'drizzle-orm';

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  kind: z.enum(['recurring', 'seasonal', 'project', 'quick', 'longcycle']),
  content: z.string().optional(),
  dueAt: z.string().datetime().optional(),
  cadenceDays: z.number().int().positive().optional(),
  cadenceYears: z.number().int().positive().optional(),
  windowStartMonth: z.number().int().min(1).max(12).optional(),
  windowStartDay: z.number().int().min(1).max(31).optional(),
  windowEndMonth: z.number().int().min(1).max(12).optional(),
  windowEndDay: z.number().int().min(1).max(31).optional(),
  projectData: z.record(z.string(), z.unknown()).optional(),
});

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const status = searchParams.get('status');
  const kind = searchParams.get('kind');

  const conditions = [eq(userTasks.userId, session.user.id)];

  if (status) {
    const statusEnum = status as 'active' | 'pending' | 'done' | 'archived';
    conditions.push(eq(userTasks.status, statusEnum));
  }

  if (kind) {
    const kindEnum = kind as 'recurring' | 'seasonal' | 'project' | 'quick' | 'longcycle';
    conditions.push(eq(userTasks.kind, kindEnum));
  }

  const tasks = await db
    .select()
    .from(userTasks)
    .where(and(...conditions))
    .orderBy(
      asc(sql`CASE WHEN ${userTasks.dueAt} IS NULL THEN 1 ELSE 0 END`),
      asc(userTasks.dueAt),
      desc(userTasks.createdAt)
    );

  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { title, kind, content, dueAt, cadenceDays, cadenceYears, windowStartMonth, windowStartDay, windowEndMonth, windowEndDay, projectData } = parsed.data;

    // Compute nextDueAt for recurring tasks
    let nextDueAt: Date | undefined;
    if (kind === 'recurring' && cadenceDays) {
      nextDueAt = new Date();
      nextDueAt.setDate(nextDueAt.getDate() + cadenceDays);
    }

    const [task] = await db
      .insert(userTasks)
      .values({
        userId: session.user.id,
        title,
        kind,
        content: content ?? null,
        dueAt: dueAt ? new Date(dueAt) : null,
        cadenceDays: cadenceDays ?? null,
        cadenceYears: cadenceYears ?? null,
        windowStartMonth: windowStartMonth ?? null,
        windowStartDay: windowStartDay ?? null,
        windowEndMonth: windowEndMonth ?? null,
        windowEndDay: windowEndDay ?? null,
        projectData: projectData ?? null,
        nextDueAt: nextDueAt ?? null,
      })
      .returning();

    return NextResponse.json(task, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
