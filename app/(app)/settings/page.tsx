import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/db/queries';
import { SettingsClient } from '@/components/settings-client';

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const user = await getUser(session.user.id);
  if (!user) redirect('/sign-in');

  return (
    <>
      <SettingsClient
        user={{
          id: user.id,
          email: user.email,
          name: user.name,
          locationZip: user.locationZip,
          pushNotificationsEnabled: user.pushNotificationsEnabled ?? true,
        }}
      />
    </>
  );
}
