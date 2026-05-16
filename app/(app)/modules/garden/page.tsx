import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { TopBar } from '@/components/top-bar';
import { GardenDetail } from '@/components/garden-detail';
import { PLANT_CATALOG, computePlantNextActions } from '@/lib/modules/garden';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getFrostDates } from '@/lib/frost';

export default async function GardenModulePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  // Fetch user's frost info
  const [user] = await db
    .select({ locationZip: users.locationZip })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const zip = user?.locationZip ?? '84003';
  const { lastSpringFrost } = getFrostDates(zip);

  // Compute next actions for all plants
  const plantActions = await computePlantNextActions(session.user.id, new Date());

  // Serialize dates for client
  const serializedPlantActions = plantActions.map((p) => ({
    ...p,
    nextTask: p.nextTask
      ? { ...p.nextTask, date: p.nextTask.date.toISOString() }
      : null,
    allTasks: p.allTasks.map((t) => ({ ...t, date: t.date.toISOString() })),
  }));

  // Serialize plant catalog for the client
  const catalog = PLANT_CATALOG.map((p) => ({
    slug: p.slug,
    name: p.name,
    category: p.category,
    daysToHarvest: p.daysToHarvest,
    spacing: p.spacing,
    waterFrequencyDays: p.waterFrequencyDays,
    startIndoorsWeeksBeforeFrost: p.startIndoorsWeeksBeforeFrost,
  }));

  const frostInfo = {
    lastFrostDate: lastSpringFrost.toISOString(),
    zip,
  };

  return (
    <>
      <TopBar />
      <main className="flex-1 pb-20">
        <GardenDetail
          catalog={catalog}
          plantActions={serializedPlantActions}
          frostInfo={frostInfo}
        />
      </main>
    </>
  );
}
