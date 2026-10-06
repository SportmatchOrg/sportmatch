'use client';

import { signOut } from 'firebase/auth';
import { Camera, LogOut, Pencil, Share2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { AVATAR_RING } from '@/components/profile/profile-avatar';
import { SettingsRowButton, SettingsRowLink } from '@/components/settings/settings-row';
import { ConfirmAction } from '@/components/ui/confirm-action';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Skeleton } from '@/components/ui/skeleton';
import { TOAST_DURATION, Toast, type ToastTone } from '@/components/ui/toast';
import { UserAvatar } from '@/components/user-avatar';
import { useCurrentUser } from '@/hooks/use-current-user';
import { auth } from '@/lib/firebase';
import { EDIT_PROFILE_HREF } from '@/lib/nav-items';
import { shareLink } from '@/lib/share';
import { cn } from '@/lib/utils';

const LOGIN_ROUTE = '/login';

const PAGE =
  'flex min-h-[calc(100dvh-(--spacing(28)))] w-full flex-col gap-6 px-5 py-6 lg:min-h-[calc(100dvh-(--spacing(20)))] lg:px-6 lg:py-10 xl:px-8';

const AVATAR = 'size-22 lg:size-20';

const EDIT_PHOTO =
  'flex items-center gap-1.5 rounded-full text-callout font-semibold text-brand transition-colors outline-none hover:text-brand-bright focus-visible:ring-2 focus-visible:ring-brand';

const LINK_COPIED = 'Link copiado';
const SHARE_ERROR = 'No pudimos compartir tu perfil. Probá de nuevo.';
const SIGN_OUT_ERROR = 'No pudimos cerrar la sesión. Probá de nuevo.';

type ToastState = { message: string; tone: ToastTone };

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading, error } = useCurrentUser();
  const [signingOut, setSigningOut] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(null), TOAST_DURATION);
    return () => clearTimeout(timer);
  }, [toast]);

  async function shareProfile(userId: string, name: string) {
    try {
      const result = await shareLink({
        title: `${name} en SportMatch`,
        url: `${window.location.origin}/usuarios/${userId}`,
      });

      if (result === 'copied') setToast({ message: LINK_COPIED, tone: 'success' });
    } catch {
      setToast({ message: SHARE_ERROR, tone: 'danger' });
    }
  }

  async function handleSignOut() {
    setSigningOut(true);

    try {
      await signOut(auth);
      router.replace(LOGIN_ROUTE);
    } catch {
      setToast({ message: SIGN_OUT_ERROR, tone: 'danger' });
      setSigningOut(false);
    }
  }

  function renderContent() {
    if (loading) {
      return (
        <div aria-busy="true" aria-label="Cargando ajustes" className="flex flex-col gap-3">
          <div className="flex flex-col items-center gap-3 pb-3">
            <Skeleton className={cn(AVATAR, 'rounded-full')} />
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-52" />
          </div>
          <Skeleton className="h-18 rounded-md lg:h-13 lg:rounded-sm" />
          <Skeleton className="h-18 rounded-md lg:h-13 lg:rounded-sm" />
        </div>
      );
    }

    if (error || !user) {
      return (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <h2 className="text-headline font-bold text-white">No pudimos cargar tus ajustes</h2>
          <p className="text-callout text-ink-46">{error}</p>
        </div>
      );
    }

    return (
      <>
        <div className="flex flex-col items-center gap-3 pb-3">
          <UserAvatar
            name={user.name}
            photoUrl={user.photoUrl}
            sizes="88px"
            className={cn(AVATAR, AVATAR_RING)}
            initialsClassName="text-title"
          />

          <Link href={EDIT_PROFILE_HREF} className={EDIT_PHOTO}>
            <Camera className="size-4.5" aria-hidden="true" />
            Editar foto
          </Link>

          <div className="flex flex-col items-center gap-0.5 text-center">
            <p className="text-headline font-bold text-white">{user.name}</p>
            <p className="text-caption text-ink-46">{user.email}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:gap-2">
          <SettingsRowLink
            href={EDIT_PROFILE_HREF}
            icon={Pencil}
            label="Editar perfil"
            hint="Nombre, ciudad y contraseña"
          />
          <SettingsRowButton
            icon={Share2}
            label="Compartir perfil"
            hint="Enviá tu link de SportMatch"
            onClick={() => void shareProfile(user.id, user.name)}
          />
        </div>
      </>
    );
  }

  return (
    <main className={PAGE}>
      <ScreenHeader overline="Perfil" title="Ajustes" />

      {renderContent()}

      <div className="mt-auto">
        <ConfirmAction
          label="Cerrar sesión"
          message="Vas a tener que volver a iniciar sesión para usar SportMatch."
          cancelLabel="Cancelar"
          confirmLabel="Cerrar sesión"
          pendingLabel="Cerrando…"
          pending={signingOut}
          trigger={
            <SettingsRowButton
              icon={LogOut}
              label="Cerrar sesión"
              tone="danger"
              disabled={signingOut}
            />
          }
          onConfirm={() => void handleSignOut()}
        />
      </div>

      {toast && (
        <div className="fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 lg:bottom-28">
          <Toast message={toast.message} tone={toast.tone} />
        </div>
      )}
    </main>
  );
}
