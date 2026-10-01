import { MS_PER_HOUR } from './milliseconds';

export const hoursAgo = (hours: number): Date =>
  new Date(Date.now() - hours * MS_PER_HOUR);
