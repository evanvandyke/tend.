import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { userTasks } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

const toggleSubtaskSchema = z.object({
  index: z.number().int().min(0),
  done: z.boolean(),
});

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
    const parsed = toggleSubtaskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const [task] = await db
      .select()
      .from(userTasks)
      .where(and(eq(userTasks.id, taskId), eq(userTasks.userId, session.user.id)));

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const projectData = (task.projectData as Record<string, unknown>) ?? {};
    const subtasks = (projectData.subtasks as { title: string; done: boolean }[]) ?? [];

    if (parsed.data.index >= subtasks.length) {
      return NextResponse.json({ error: 'Subtask index out of range' }, { status: 400 });
    }

    subtasks[parsed.data.index] = { ...subtasks[parsed.data.index], done: parsed.data.done };
    const updatedData = { ...projectData, subtasks };

    const [updated] = await db
      .update(userTasks)
      .set({ projectData: updatedData, updatedAt: new Date() })
      .where(and(eq(userTasks.id, taskId), eq(userTasks.userId, session.user.id)))
      .returning();

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
