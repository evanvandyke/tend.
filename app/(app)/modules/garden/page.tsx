import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { TopBar } from '@/components/top-bar';
import { BottomNav } from '@/components/bottom-nav';
import { GardenDetail } from '@/components/garden-detail';
import { PLANT_CATALOG } from '@/lib/modules/garden';

export default async function GardenModulePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

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

  return (
    <>
      <TopBar />
      <main className="flex-1 pb-20">
        <GardenDetail catalog={catalog} />
      </main>
      <BottomNav />
    </>
  );
}
