'use client';

import { BellRing } from 'lucide-react';
import { useEffect, useState } from 'react';

import { PillButton } from '@/components/ui/pill-button';
import { savePushSubscription } from '@/lib/notifications';

type PushStatus = 'checking' | 'inactive' | 'activating' | 'active' | 'blocked' | 'unsupported';

const ACTIVATION_ERROR = 'No pudimos activar las notificaciones. Probá de nuevo.';

function supportsPush(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

function applicationServerKey(key: string): Uint8Array<ArrayBuffer> {
  const base64 = key.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

export function PushNotificationsControl() {
  const [status, setStatus] = useState<PushStatus>('checking');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let current = true;

    async function checkSubscription() {
      if (!supportsPush()) {
        if (current) setStatus('unsupported');
        return;
      }

      if (Notification.permission === 'denied') {
        if (current) setStatus('blocked');
        return;
      }

      if (Notification.permission !== 'granted') {
        if (current) setStatus('inactive');
        return;
      }

      try {
        const registration = await navigator.serviceWorker.getRegistration();
        const subscription = await registration?.pushManager.getSubscription();
        if (current) setStatus(subscription ? 'active' : 'inactive');
      } catch {
        if (current) setStatus('inactive');
      }
    }

    void checkSubscription();
    return () => {
      current = false;
    };
  }, []);

  async function activate() {
    if (status !== 'inactive') return;

    setStatus('activating');
    setError(null);

    try {
      // Keep the permission request inside the click gesture (also required on iOS).
      const permission =
        Notification.permission === 'default'
          ? await Notification.requestPermission()
          : Notification.permission;

      if (permission !== 'granted') {
        setStatus(permission === 'denied' ? 'blocked' : 'inactive');
        return;
      }

      const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!key) throw new Error('Missing NEXT_PUBLIC_VAPID_PUBLIC_KEY');

      await navigator.serviceWorker.register('/sw.js');
      const registration = await navigator.serviceWorker.ready;
      const subscription =
        (await registration.pushManager.getSubscription()) ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey(key),
        }));

      await savePushSubscription(subscription);
      setStatus('active');
    } catch {
      setStatus('inactive');
      setError(ACTIVATION_ERROR);
    }
  }

  return (
    <section className="flex flex-col gap-4 rounded-md border border-glass-border bg-panel p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <BellRing className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
        <div className="flex flex-col gap-1">
          <h2 className="text-callout font-semibold text-white">Notificaciones en tu dispositivo</h2>
          <p className="text-caption text-ink-64">
            Recibí avisos de tus partidos aunque la app esté cerrada.
          </p>
          <p className="text-caption text-ink-46">
            En iPhone solo funciona con la app instalada en la pantalla de inicio (iOS 16.4+).
          </p>
          {status === 'blocked' && (
            <p className="text-caption text-warning" role="status">
              Las notificaciones están bloqueadas. Permitilas desde la configuración de este sitio
              en tu navegador y volvé a cargar la página.
            </p>
          )}
          {status === 'unsupported' && (
            <p className="text-caption text-ink-64" role="status">
              Este navegador no admite notificaciones push.
            </p>
          )}
          {error && (
            <p className="text-caption text-danger" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>

      {(status === 'inactive' || status === 'activating' || status === 'checking') && (
        <PillButton
          size="md"
          disabled={status !== 'inactive'}
          onClick={() => void activate()}
          className="w-full sm:w-auto"
        >
          {status === 'activating' ? 'Activando…' : 'Activar notificaciones'}
        </PillButton>
      )}
      {status === 'active' && (
        <span className="shrink-0 text-caption font-semibold text-success" role="status">
          Notificaciones activadas
        </span>
      )}
    </section>
  );
}
