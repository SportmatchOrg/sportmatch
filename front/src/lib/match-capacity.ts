export function formatPlayers(joinedCount: number, capacity: number): string {
  return `${Math.min(joinedCount, capacity)}/${capacity}`;
}
