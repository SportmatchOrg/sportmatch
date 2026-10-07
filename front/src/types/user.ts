export type UserStats = {
  rating: number | null;
  ratingCount: number;
  playedCount: number;
  weekStreak: number;
  noShowCount90d: number;
};

export type PublicProfile = {
  id: string;
  name: string;
  photoUrl: string | null;
  city: string | null;
  stats: UserStats;
};

export type User = {
  id: string;
  firebaseUid: string;
  email: string;
  name: string;
  photoUrl: string | null;
  city: string | null;
  stats: UserStats & { suspendedUntil: string | null };
};

export type ProfileUpdate = {
  name: string;
  city: string | null;
};

export const NAME_MIN = 2;
export const NAME_MAX = 60;
export const CITY_MIN = 2;
export const CITY_MAX = 80;
