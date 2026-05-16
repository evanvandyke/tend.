import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { GlobalFAB } from '@/components/global-fab';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/sign-in');
  }

  return (
    <main id="main-content" className="min-h-screen flex flex-col bg-[var(--parchment)]">
      {children}
      <GlobalFAB />
    </main>
  );
}
