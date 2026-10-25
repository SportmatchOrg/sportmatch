'use client';

import { TriangleAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { LoadingScreen } from '@/components/loading-screen';
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard';
import { EmptyState } from '@/components/ui/empty-state';
import { useCurrentUser } from '@/hooks/use-current-user';
import { HOME_HREF } from '@/lib/nav-items';
import { dismissOnboarding } from '@/lib/onboarding';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading, error } = useCurrentUser();
  const onboarded = Boolean(user?.onboardedAt);

  useEffect(() => {
    if (onboarded) router.replace(HOME_HREF);
  }, [onboarded, router]);

  function finish() {
    dismissOnboarding();
    router.replace(HOME_HREF);
  }

  if (error) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-8">
        <EmptyState icon={TriangleAlert} title="No pudimos cargar tu perfil" text={error} />
      </main>
    );
  }

  if (loading || !user || onboarded) {
    return <LoadingScreen />;
  }

  return <OnboardingWizard userId={user.id} onFinish={finish} />;
}
