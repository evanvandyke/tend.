import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { userTasks } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

const toggleMaterialSchema = z.object({
  index: z.number().int().min(0),
  acquired: z.boolean(),
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
    const parsed = toggleMaterialSchema.safeParse(body);
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
    const materials = (projectData.materials as { name: string; quantity?: string; acquired?: boolean }[]) ?? [];

    if (parsed.data.index >= materials.length) {
      return NextResponse.json({ error: 'Material index out of range' }, { status: 400 });
    }

    materials[parsed.data.index] = { ...materials[parsed.data.index], acquired: parsed.data.acquired };
    const updatedData = { ...projectData, materials };

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
