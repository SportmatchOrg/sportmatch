'use client';

import { Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { HERO_BUTTON } from '@/components/matches/match-detail-layout';
import { TOAST_DURATION, Toast, type ToastTone } from '@/components/ui/toast';
import { matchPath } from '@/lib/public-matches';
import { shareLink } from '@/lib/share';

const COPIED = 'Copiamos el link del partido';
const SHARE_ERROR = 'No pudimos compartir el link. Probá de nuevo.';

const TOAST_POSITION = 'fixed inset-x-0 top-16 z-50 flex justify-center px-4';

type ShareToast = { message: string; tone: ToastTone };

type ShareMatchButtonProps = {
  matchId: string;
  title: string;
};

export function ShareMatchButton({ matchId, title }: ShareMatchButtonProps) {
  const [toast, setToast] = useState<ShareToast | null>(null);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(null), TOAST_DURATION);
    return () => clearTimeout(timer);
  }, [toast]);

  async function share() {
    try {
      const result = await shareLink({
        title,
        url: `${window.location.origin}${matchPath(matchId)}`,
      });

      if (result === 'copied') setToast({ message: COPIED, tone: 'success' });
    } catch {
      setToast({ message: SHARE_ERROR, tone: 'danger' });
    }
  }

  return (
    <>
      <button type="button" aria-label="Compartir" onClick={() => void share()} className={HERO_BUTTON}>
        <Share2 className="size-5" aria-hidden="true" />
      </button>

      {toast &&
        createPortal(
          <div className={TOAST_POSITION}>
            <Toast message={toast.message} tone={toast.tone} />
          </div>,
          document.body
        )}
    </>
  );
}
