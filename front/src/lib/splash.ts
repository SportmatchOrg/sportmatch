const SPLASH_PENDING_KEY = 'splash-pending';

export const SPLASH_SOUND_SRC = '/sfx/splash.mp3';

export function markSplashPending(): void {
  try {
    window.sessionStorage.setItem(SPLASH_PENDING_KEY, '1');
  } catch {
    return;
  }
}

export function isSplashPending(): boolean {
  try {
    return window.sessionStorage.getItem(SPLASH_PENDING_KEY) === '1';
  } catch {
    return false;
  }
}

export function clearSplashPending(): void {
  try {
    window.sessionStorage.removeItem(SPLASH_PENDING_KEY);
  } catch {
    return;
  }
}
