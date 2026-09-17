export type UserStats = {
  rating: number | null;
  ratingCount: number;
  playedCount: number;
  weekStreak: number;
};

export type PublicProfile = {
  id: string;
  nombre: string;
  fotoUrl: string | null;
  stats: UserStats;
};

export type User = {
  id: string;
  firebaseUid: string;
  email: string;
  nombre: string;
  fotoUrl: string | null;
  stats: UserStats;
};
