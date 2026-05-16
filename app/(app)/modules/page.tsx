import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { TopBar } from '@/components/top-bar';
import { ModulesList } from '@/components/modules-list';

export default async function ModulesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  return (
    <>
      <TopBar />
      <main className="flex-1 pb-20">
        <div className="px-4 pt-6 pb-2">
          <h2 className="font-[family-name:var(--font-display)] text-[22px] font-semibold text-[var(--iron-gall)]">
            Modules
          </h2>
          <p className="font-[family-name:var(--font-body)] text-[14px] text-[var(--sepia)] mt-1">
            Seasonal care schedules tailored to your location.
          </p>
        </div>
        <ModulesList />
      </main>
    </>
  );
}
