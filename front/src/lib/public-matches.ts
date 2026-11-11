import { apiBaseUrl } from '@/lib/api-url';
import { LEVEL_LABEL, SPORT_LABEL, type PublicMatch } from '@/types/match';

const NOT_FOUND = 404;

const SHARE_DATE = new Intl.DateTimeFormat('es-AR', {
  timeZone: 'America/Argentina/Buenos_Aires',
  weekday: 'short',
  day: 'numeric',
  month: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

type ShareableMatch = Pick<
  PublicMatch,
  'date' | 'location' | 'sport' | 'status' | 'level' | 'joinedCount' | 'capacity'
> & { organizer: { name: string } };

export async function publicFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${apiBaseUrl()}${path}`, init);
}

export async function fetchPublicMatch(
  matchId: string,
  init?: RequestInit
): Promise<PublicMatch | null> {
  const response = await publicFetch(`/public/matches/${encodeURIComponent(matchId)}`, init);

  if (response.status === NOT_FOUND) return null;
  if (!response.ok) throw new Error(`Public match request failed with status ${response.status}`);

  return response.json() as Promise<PublicMatch>;
}

export function matchPath(matchId: string): string {
  return `/partidos/${matchId}`;
}

function shareDate(value: string): string {
  const parts = Object.fromEntries(
    SHARE_DATE.formatToParts(new Date(value)).map(({ type, value: part }) => [type, part])
  );

  return `${parts.weekday.replace('.', '')} ${parts.day}/${parts.month} ${parts.hour}:${parts.minute}`;
}

export function matchShareTitle(match: ShareableMatch): string {
  const title = `${SPORT_LABEL[match.sport.name]} · ${shareDate(match.date)} · ${match.location}`;

  return match.status === 'CANCELED' ? `Cancelado · ${title}` : title;
}

export function matchShareDescription(match: ShareableMatch): string {
  if (match.status === 'CANCELED') return 'Este partido se canceló.';

  return `${LEVEL_LABEL[match.level]} · ${match.joinedCount}/${match.capacity} jugadores · Organiza ${match.organizer.name}. Sumate en SportMatch.`;
}
