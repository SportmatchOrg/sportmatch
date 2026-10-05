self.addEventListener('push', (event) => {
  let message = {};

  try {
    message = event.data?.json() ?? {};
  } catch {
    // A malformed payload should still produce a visible notification.
  }

  const title = typeof message.title === 'string' ? message.title : 'SportMatch';
  const body = typeof message.body === 'string' ? message.body : 'Tenés una novedad.';
  const url = typeof message.url === 'string' ? message.url : '/notificaciones';

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/icon-192.png',
      data: { url },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const path = event.notification.data?.url;
  const requested = new URL(
    typeof path === 'string' && path.startsWith('/') && !path.startsWith('//')
      ? path
      : '/notificaciones',
    self.location.origin,
  );
  const target =
    requested.origin === self.location.origin
      ? requested
      : new URL('/notificaciones', self.location.origin);

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      const existing = windows.find((client) => new URL(client.url).origin === target.origin);

      if (existing) {
        const navigated = await existing.navigate(target.href);
        await (navigated ?? existing).focus();
      } else {
        await self.clients.openWindow(target.href);
      }
    })(),
  );
});
