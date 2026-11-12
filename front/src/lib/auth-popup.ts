import { auth } from '@/lib/firebase';

export function watchAuthPopupResult(onResult: () => void): () => void {
  const authOrigin = `https://${auth.config.authDomain}`;
  let leftPage = false;

  function handleVisibilityChange() {
    if (document.visibilityState === 'hidden') leftPage = true;
  }

  function handleMessage(event: MessageEvent) {
    if (!leftPage || event.origin !== authOrigin) return;
    stop();
    onResult();
  }

  function stop() {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('message', handleMessage);
  }

  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('message', handleMessage);

  return stop;
}
