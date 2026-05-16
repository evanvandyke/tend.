import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { userModuleCompletions } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

const createCompletionSchema = z.object({
  moduleSlug: z.string().min(1, 'Module slug is required'),
  taskSlug: z.string().min(1, 'Task slug is required'),
  year: z.number().int().min(2000).max(2100),
  status: z.enum(['completed', 'skipped']).optional().default('completed'),
});

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const moduleSlug = searchParams.get('moduleSlug');
  const yearParam = searchParams.get('year');

  const conditions = [eq(userModuleCompletions.userId, session.user.id)];

  if (moduleSlug) {
    conditions.push(eq(userModuleCompletions.moduleSlug, moduleSlug));
  }

  if (yearParam) {
    const year = parseInt(yearParam, 10);
    if (!isNaN(year)) {
      conditions.push(eq(userModuleCompletions.year, year));
    }
  }

  const completions = await db
    .select()
    .from(userModuleCompletions)
    .where(and(...conditions));

  return NextResponse.json(completions);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createCompletionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { moduleSlug, taskSlug, year, status } = parsed.data;

    const [completion] = await db
      .insert(userModuleCompletions)
      .values({
        userId: session.user.id,
        moduleSlug,
        taskSlug,
        year,
        status,
      })
      .returning();

    return NextResponse.json(completion, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Completion ID is required' }, { status: 400 });
  }

  const completionId = parseInt(id, 10);
  if (isNaN(completionId)) {
    return NextResponse.json({ error: 'Invalid completion ID' }, { status: 400 });
  }

  const [deleted] = await db
    .delete(userModuleCompletions)
    .where(
      and(
        eq(userModuleCompletions.id, completionId),
        eq(userModuleCompletions.userId, session.user.id)
      )
    )
    .returning();

  if (!deleted) {
    return NextResponse.json({ error: 'Completion not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
