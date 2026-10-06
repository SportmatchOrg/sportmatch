export type ShareResult = 'shared' | 'copied' | 'dismissed';

type ShareLink = { title: string; url: string };

function canUseShareSheet(): boolean {
  return typeof navigator.share === 'function' && window.matchMedia('(pointer: coarse)').matches;
}

function isDismissal(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

export async function shareLink({ title, url }: ShareLink): Promise<ShareResult> {
  if (canUseShareSheet()) {
    try {
      await navigator.share({ title, url });
      return 'shared';
    } catch (error) {
      if (isDismissal(error)) return 'dismissed';
    }
  }

  await navigator.clipboard.writeText(url);
  return 'copied';
}
