const DISCOVER_TUTORIAL_KEY = 'discover-tutorial-seen';

export function hasSeenDiscoverTutorial(): boolean {
  try {
    return window.localStorage.getItem(DISCOVER_TUTORIAL_KEY) === '1';
  } catch {
    return true;
  }
}

export function markDiscoverTutorialSeen(): void {
  try {
    window.localStorage.setItem(DISCOVER_TUTORIAL_KEY, '1');
  } catch {
    return;
  }
}
