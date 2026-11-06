import { isMatchSortKey, type MatchSortKey } from './match-sort-key';

export const NEXT_CURSOR_HEADER = 'X-Next-Cursor';

export const encodeMatchCursor = (key: MatchSortKey): string =>
  Buffer.from(JSON.stringify(key)).toString('base64url');

export const decodeMatchCursor = (
  cursor: string,
  withDistance: boolean,
): MatchSortKey | null => {
  try {
    const value: unknown = JSON.parse(
      Buffer.from(cursor, 'base64url').toString(),
    );

    return isMatchSortKey(value, withDistance) ? value : null;
  } catch {
    return null;
  }
};
