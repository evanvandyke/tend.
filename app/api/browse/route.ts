import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getBrowseFeed } from '@/lib/db/queries';
import { format } from 'date-fns';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get('year') ?? String(new Date().getFullYear()), 10);
  const month = parseInt(searchParams.get('month') ?? String(new Date().getMonth() + 1), 10);

  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    return NextResponse.json({ error: 'Invalid year or month' }, { status: 400 });
  }

  const feedItems = await getBrowseFeed(session.user.id, year, month);

  // Transform to client format
  const items = feedItems.map((item) => ({
    id: item.id,
    type: item.type,
    title: item.title,
    dueDate: item.dueAt ? item.dueAt.toISOString() : undefined,
    isCompleted: item.isCompleted,
    moduleSource: item.moduleTag === 'lunar-event' ? undefined : item.moduleTag,
    eventDate: item.type === 'lunar-event' && item.dueAt ? format(item.dueAt, 'MMM d') : undefined,
  }));

  return NextResponse.json({ items });
}
