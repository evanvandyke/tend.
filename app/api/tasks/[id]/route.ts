import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { userTasks } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  kind: z.enum(['recurring', 'seasonal', 'project', 'quick', 'longcycle']).optional(),
  status: z.enum(['active', 'pending', 'done', 'archived']).optional(),
  content: z.string().nullable().optional(),
  dueAt: z.string().datetime().nullable().optional(),
  cadenceDays: z.number().int().positive().nullable().optional(),
  cadenceYears: z.number().int().positive().nullable().optional(),
  windowStartMonth: z.number().int().min(1).max(12).nullable().optional(),
  windowStartDay: z.number().int().min(1).max(31).nullable().optional(),
  windowEndMonth: z.number().int().min(1).max(12).nullable().optional(),
  windowEndDay: z.number().int().min(1).max(31).nullable().optional(),
  projectData: z.record(z.string(), z.unknown()).nullable().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const taskId = parseInt(id, 10);
  if (isNaN(taskId)) {
    return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
  }

  const [task] = await db
    .select()
    .from(userTasks)
    .where(and(eq(userTasks.id, taskId), eq(userTasks.userId, session.user.id)));

  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  return NextResponse.json(task);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const taskId = parseInt(id, 10);
  if (isNaN(taskId)) {
    return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const parsed = updateTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    // Verify ownership
    const [existing] = await db
      .select()
      .from(userTasks)
      .where(and(eq(userTasks.id, taskId), eq(userTasks.userId, session.user.id)));

    if (!existing) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const updates: Record<string, unknown> = { ...parsed.data, updatedAt: new Date() };

    // Handle dueAt conversion
    if ('dueAt' in updates) {
      updates.dueAt = updates.dueAt ? new Date(updates.dueAt as string) : null;
    }

    // Handle completion
    if (parsed.data.status === 'done') {
      updates.completedAt = new Date();
      updates.lastCompletedAt = new Date();

      // For recurring tasks, create a new instance and compute next due
      if (existing.kind === 'recurring' && existing.cadenceDays) {
        const nextDue = new Date();
        nextDue.setDate(nextDue.getDate() + existing.cadenceDays);

        // Create new active instance for the next recurrence
        await db.insert(userTasks).values({
          userId: session.user.id,
          title: existing.title,
          kind: existing.kind,
          content: existing.content,
          cadenceDays: existing.cadenceDays,
          cadenceYears: existing.cadenceYears,
          windowStartMonth: existing.windowStartMonth,
          windowStartDay: existing.windowStartDay,
          windowEndMonth: existing.windowEndMonth,
          windowEndDay: existing.windowEndDay,
          projectData: existing.projectData,
          nextDueAt: nextDue,
          dueAt: nextDue,
        });
      }
    }

    const [updated] = await db
      .update(userTasks)
      .set(updates)
      .where(and(eq(userTasks.id, taskId), eq(userTasks.userId, session.user.id)))
      .returning();

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const taskId = parseInt(id, 10);
  if (isNaN(taskId)) {
    return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
  }

  const [archived] = await db
    .update(userTasks)
    .set({ status: 'archived', updatedAt: new Date() })
    .where(and(eq(userTasks.id, taskId), eq(userTasks.userId, session.user.id)))
    .returning();

  if (!archived) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
