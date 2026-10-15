const ORGANIZER = 1;

export const playerCount = (participants: number): number =>
  participants + ORGANIZER;

export const isFull = (participants: number, capacity: number): boolean =>
  playerCount(participants) >= capacity;
