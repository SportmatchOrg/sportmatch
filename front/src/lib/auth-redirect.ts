export const LOGIN_HREF = '/login';
export const SIGNUP_HREF = '/signup';

const NEXT_PARAM = 'next';

function safeNextPath(value: string | null): string | null {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
    return null;
  }

  return value;
}

export function readNextPath(search: string): string | null {
  return safeNextPath(new URLSearchParams(search).get(NEXT_PARAM));
}

export function withNext(href: string, next: string | null): string {
  return next ? `${href}?${NEXT_PARAM}=${encodeURIComponent(next)}` : href;
}

export function isPublicMatchPath(pathname: string): boolean {
  const [, section, matchId, ...rest] = pathname.split('/');

  return section === 'partidos' && Boolean(matchId) && matchId !== 'nuevo' && rest.length === 0;
}
