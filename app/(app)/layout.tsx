import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { format } from 'date-fns';
import { GlobalFAB } from '@/components/global-fab';
import { BottomNav } from '@/components/bottom-nav';
import { TopBar, type LunarEventInfo } from '@/components/top-bar';
import { getNextLunarEvent, getUser } from '@/lib/db/queries';
import { getCurrentWeather } from '@/lib/weather';
import { startOfDay } from 'date-fns';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/sign-in');
  }

  // Fetch lunar event, user (for zip), then weather
  const [nextEvent, user] = await Promise.all([
    getNextLunarEvent(startOfDay(new Date())),
    getUser(session.user.id!),
  ]);

  const lunarEvent: LunarEventInfo | null = nextEvent
    ? { name: nextEvent.name, date: format(nextEvent.eventDate, 'MMM d') }
    : null;

  const zip = user?.locationZip ?? '84003';
  const weather = await getCurrentWeather(zip);

  return (
    <main id="main-content" className="min-h-screen flex flex-col bg-[var(--parchment)]">
      <div className="w-full max-w-[720px] mx-auto flex-1 flex flex-col">
        <TopBar lunarEvent={lunarEvent} weather={weather} />
        {children}
      </div>
      <GlobalFAB />
      <BottomNav />
    </main>
  );
}
