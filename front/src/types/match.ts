export type SportName = 'FUTBOL' | 'BASQUET' | 'TENIS' | 'PADEL' | 'RUNNING';

export type Sport = {
  id: string;
  name: SportName;
};

export const SPORT_LABEL: Record<SportName, string> = {
  FUTBOL: 'Fútbol',
  BASQUET: 'Básquet',
  TENIS: 'Tenis',
  PADEL: 'Pádel',
  RUNNING: 'Running',
};

export type Level = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export const LEVELS: Level[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

export const LEVEL_LABEL: Record<Level, string> = {
  BEGINNER: 'Principiante',
  INTERMEDIATE: 'Intermedio',
  ADVANCED: 'Avanzado',
};

export type PublicUser = {
  id: string;
  name: string;
  photoUrl: string | null;
};

export type JoinRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export type MatchStatus = 'ACTIVE' | 'CANCELED';

export const CANCEL_REASONS = [
  'Mal clima',
  'No se juntaron jugadores',
  'La cancha no está disponible',
  'Me surgió un imprevisto',
  'Lesión o problema de salud',
  'Se reprograma para otra fecha',
  'Se cruzó con otro compromiso',
  'Otro',
] as const;

export type CancelReason = (typeof CANCEL_REASONS)[number];

export type Match = {
  id: string;
  sportId: string;
  sport: Sport;
  level: Level;
  date: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  capacity: number;
  description: string | null;
  status: MatchStatus;
  cancelReason: string | null;
  organizer: PublicUser;
  joinedCount: number;
  isJoined: boolean;
  myJoinRequest: JoinRequestStatus | null;
  pendingRequests: number | null;
  ratingPending: boolean | null;
};

export type MyMatches = {
  organizing: Match[];
  playing: Match[];
  played: Match[];
  requested: Match[];
};

export type MatchDetail = Match & {
  participants: PublicUser[];
};

export const CAPACITY_MIN = 2;
export const CAPACITY_MAX = 30;
export const CAPACITY_DEFAULT = 10;
export const LOCATION_MIN = 3;
export const LOCATION_MAX = 120;
export const TITLE_MAX = 60;
export const DESCRIPTION_MAX = 500;
