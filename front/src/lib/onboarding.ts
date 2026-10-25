const ONBOARDING_DISMISSED_KEY = 'onboarding-dismissed';

export function isOnboardingDismissed(): boolean {
  try {
    return window.sessionStorage.getItem(ONBOARDING_DISMISSED_KEY) === '1';
  } catch {
    return false;
  }
}

export function dismissOnboarding(): void {
  try {
    window.sessionStorage.setItem(ONBOARDING_DISMISSED_KEY, '1');
  } catch {
    return;
  }
}
