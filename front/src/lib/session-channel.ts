const CHANNEL_NAME = 'sportmatch-session';
const SESSION_CHANGED = 'session-changed';

let channel: BroadcastChannel | null | undefined;

function sessionChannel(): BroadcastChannel | null {
  if (channel === undefined) {
    channel = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(CHANNEL_NAME);
  }

  return channel;
}

export function announceSessionChange(): void {
  sessionChannel()?.postMessage(SESSION_CHANGED);
}

export function onSessionChangedElsewhere(listener: () => void): () => void {
  const current = sessionChannel();

  if (!current) return () => undefined;

  const handle = (event: MessageEvent) => {
    if (event.data === SESSION_CHANGED) listener();
  };

  current.addEventListener('message', handle);

  return () => current.removeEventListener('message', handle);
}
