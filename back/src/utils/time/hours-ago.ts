const MS_PER_HOUR = 60 * 60 * 1000;

export const hoursAgo = (hours: number): Date =>
  new Date(Date.now() - hours * MS_PER_HOUR);
