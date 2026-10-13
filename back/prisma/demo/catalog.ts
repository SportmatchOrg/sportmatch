import type {
  Level,
  NotificationType,
  Prisma,
} from '../../src/generated/prisma/client';

export const DEMO_DOMAIN = 'demouser.sportmatch.com';
export const DEMO_ID_PREFIX = 'demo-';
export const HOST = 'host';

export const SPORT_NAMES = [
  'FUTBOL',
  'BASQUET',
  'TENIS',
  'PADEL',
  'RUNNING',
] as const;

export type SportName = (typeof SPORT_NAMES)[number];

export type DemoUserKey =
  | 'martina'
  | 'joaquin'
  | 'lucia'
  | 'bruno'
  | 'valentina'
  | 'federico'
  | 'camila'
  | 'nicolas';

export type PlayerKey = DemoUserKey | typeof HOST;

export type DemoUser = {
  key: DemoUserKey;
  emailName: string;
  name: string;
  city: string;
  level: Level;
  sports: SportName[];
};

export type Place = {
  location: string;
  latitude: number;
  longitude: number;
};

export type DemoMatch = {
  key: string;
  sport: SportName;
  level: Level;
  daysFromToday: number;
  hour: number;
  place: Place;
  capacity: number;
  description?: string;
  organizer: PlayerKey;
  participants: PlayerKey[];
  pendingRequests?: PlayerKey[];
};

export type DemoRating = {
  match: string;
  rater: PlayerKey;
  rated: PlayerKey;
  score: number;
};

export type DemoPlayerEvent = {
  match: string;
  player: PlayerKey;
};

export type DemoNotification = {
  key: string;
  type: NotificationType;
  actor: PlayerKey;
  match: string;
  hoursAgo: number;
  read: boolean;
  payload?: Prisma.InputJsonObject;
};

export const FALLBACK_HOST: DemoUserKey = 'nicolas';

export const DEMO_USERS: DemoUser[] = [
  {
    key: 'martina',
    emailName: 'martina.sosa',
    name: 'Martina Sosa',
    city: 'Pilar',
    level: 'INTERMEDIATE',
    sports: ['FUTBOL', 'PADEL'],
  },
  {
    key: 'joaquin',
    emailName: 'joaquin.ferreyra',
    name: 'Joaquín Ferreyra',
    city: 'Pilar',
    level: 'ADVANCED',
    sports: ['PADEL', 'TENIS'],
  },
  {
    key: 'lucia',
    emailName: 'lucia.benitez',
    name: 'Lucía Benítez',
    city: 'CABA',
    level: 'BEGINNER',
    sports: ['RUNNING', 'TENIS'],
  },
  {
    key: 'bruno',
    emailName: 'bruno.castro',
    name: 'Bruno Castro',
    city: 'CABA',
    level: 'INTERMEDIATE',
    sports: ['FUTBOL', 'BASQUET'],
  },
  {
    key: 'valentina',
    emailName: 'valentina.rios',
    name: 'Valentina Ríos',
    city: 'Pilar',
    level: 'BEGINNER',
    sports: ['PADEL', 'RUNNING'],
  },
  {
    key: 'federico',
    emailName: 'federico.molina',
    name: 'Federico Molina',
    city: 'CABA',
    level: 'ADVANCED',
    sports: ['FUTBOL', 'BASQUET'],
  },
  {
    key: 'camila',
    emailName: 'camila.duarte',
    name: 'Camila Duarte',
    city: 'Pilar',
    level: 'INTERMEDIATE',
    sports: ['TENIS', 'PADEL'],
  },
  {
    key: 'nicolas',
    emailName: 'nicolas.romero',
    name: 'Nicolás Romero',
    city: 'CABA',
    level: 'INTERMEDIATE',
    sports: ['BASQUET', 'RUNNING'],
  },
];

const PLACES = {
  parqueSur: {
    location: 'Parque Sur',
    latitude: -34.60655,
    longitude: -58.43556,
  },
  riverCourts: {
    location: 'River Courts · Cancha 2',
    latitude: -34.55818,
    longitude: -58.49974,
  },
  clubPalermo: {
    location: 'Club Palermo',
    latitude: -34.5795,
    longitude: -58.428,
  },
  costanera: {
    location: 'Costanera, kilómetro 0',
    latitude: -34.60841,
    longitude: -58.35904,
  },
  clubNorte: {
    location: 'Club Norte · Cancha 3',
    latitude: -34.46472,
    longitude: -58.91042,
  },
  polideportivo: {
    location: 'Polideportivo Municipal',
    latitude: -34.46775,
    longitude: -58.9204,
  },
  complejoDelEste: {
    location: 'Complejo Del Este',
    latitude: -34.46896,
    longitude: -58.91957,
  },
  clubDelOeste: {
    location: 'Club del Oeste · Cancha 1',
    latitude: -34.4663,
    longitude: -58.9183,
  },
} satisfies Record<string, Place>;

export const DEMO_MATCHES: DemoMatch[] = [
  {
    key: 'f01',
    sport: 'FUTBOL',
    level: 'INTERMEDIATE',
    daysFromToday: 2,
    hour: 19,
    place: PLACES.parqueSur,
    capacity: 10,
    description: 'Faltan jugadores para armar dos equipos',
    organizer: 'bruno',
    participants: ['federico', 'lucia', 'valentina'],
    pendingRequests: ['camila'],
  },
  {
    key: 'f02',
    sport: 'PADEL',
    level: 'BEGINNER',
    daysFromToday: 3,
    hour: 20,
    place: PLACES.clubNorte,
    capacity: 4,
    description: 'Dobles tranquilos',
    organizer: 'martina',
    participants: [HOST, 'valentina', 'camila'],
  },
  {
    key: 'f03',
    sport: 'TENIS',
    level: 'ADVANCED',
    daysFromToday: 4,
    hour: 18,
    place: PLACES.riverCourts,
    capacity: 2,
    description: 'Singles, traer pelotas',
    organizer: 'joaquin',
    participants: [],
  },
  {
    key: 'f04',
    sport: 'BASQUET',
    level: 'INTERMEDIATE',
    daysFromToday: 5,
    hour: 21,
    place: PLACES.clubPalermo,
    capacity: 10,
    organizer: 'federico',
    participants: ['bruno', 'lucia', 'joaquin', 'martina'],
  },
  {
    key: 'f05',
    sport: 'RUNNING',
    level: 'BEGINNER',
    daysFromToday: 6,
    hour: 8,
    place: PLACES.costanera,
    capacity: 15,
    description: 'Ritmo suave, 5 km',
    organizer: 'lucia',
    participants: ['valentina', 'camila'],
  },
  {
    key: 'f06',
    sport: 'TENIS',
    level: 'INTERMEDIATE',
    daysFromToday: 8,
    hour: 19,
    place: PLACES.clubDelOeste,
    capacity: 4,
    description: 'Dobles, nivel parejo',
    organizer: 'camila',
    participants: ['joaquin', 'martina', 'lucia'],
  },
  {
    key: 'f07',
    sport: 'PADEL',
    level: 'INTERMEDIATE',
    daysFromToday: 3,
    hour: 21,
    place: PLACES.polideportivo,
    capacity: 4,
    description: 'Busco dos para completar',
    organizer: HOST,
    participants: ['joaquin'],
    pendingRequests: ['camila', 'valentina'],
  },
  {
    key: 'f08',
    sport: 'FUTBOL',
    level: 'BEGINNER',
    daysFromToday: 9,
    hour: 20,
    place: PLACES.complejoDelEste,
    capacity: 10,
    description: 'Fútbol 5 para despejarse',
    organizer: HOST,
    participants: ['bruno', 'federico'],
    pendingRequests: ['lucia'],
  },
  {
    key: 'f09',
    sport: 'BASQUET',
    level: 'ADVANCED',
    daysFromToday: 10,
    hour: 20,
    place: PLACES.polideportivo,
    capacity: 6,
    description: '3 contra 3',
    organizer: 'federico',
    participants: [HOST, 'bruno'],
  },
  {
    key: 'f10',
    sport: 'PADEL',
    level: 'ADVANCED',
    daysFromToday: 12,
    hour: 19,
    place: PLACES.clubPalermo,
    capacity: 4,
    description: 'Pádel competitivo',
    organizer: 'valentina',
    participants: ['joaquin'],
  },
  {
    key: 'p01',
    sport: 'FUTBOL',
    level: 'INTERMEDIATE',
    daysFromToday: -5,
    hour: 20,
    place: PLACES.parqueSur,
    capacity: 10,
    description: 'Partido jugado con una falta confirmada',
    organizer: 'martina',
    participants: [HOST, 'bruno', 'federico', 'lucia'],
  },
  {
    key: 'p02',
    sport: 'PADEL',
    level: 'BEGINNER',
    daysFromToday: -12,
    hour: 19,
    place: PLACES.clubNorte,
    capacity: 4,
    description: 'Partido jugado con una baja tarde',
    organizer: 'joaquin',
    participants: [HOST, 'valentina'],
  },
  {
    key: 'p03',
    sport: 'TENIS',
    level: 'ADVANCED',
    daysFromToday: -20,
    hour: 18,
    place: PLACES.riverCourts,
    capacity: 2,
    description: 'Singles a tres sets',
    organizer: 'lucia',
    participants: [HOST],
  },
];

export const DEMO_RATINGS: DemoRating[] = [
  { match: 'p01', rater: 'martina', rated: HOST, score: 5 },
  { match: 'p01', rater: 'federico', rated: HOST, score: 4 },
  { match: 'p01', rater: HOST, rated: 'martina', score: 5 },
  { match: 'p01', rater: HOST, rated: 'federico', score: 4 },
  { match: 'p01', rater: 'lucia', rated: 'federico', score: 5 },
  { match: 'p02', rater: 'joaquin', rated: HOST, score: 5 },
  { match: 'p02', rater: 'valentina', rated: HOST, score: 4 },
  { match: 'p02', rater: HOST, rated: 'joaquin', score: 4 },
  { match: 'p02', rater: HOST, rated: 'valentina', score: 5 },
  { match: 'p03', rater: 'lucia', rated: HOST, score: 4 },
  { match: 'p03', rater: HOST, rated: 'lucia', score: 5 },
];

export const DEMO_NO_SHOWS: DemoPlayerEvent[] = [
  { match: 'p01', player: 'bruno' },
];

export const DEMO_LATE_WITHDRAWALS: DemoPlayerEvent[] = [
  { match: 'p02', player: 'camila' },
];

export const DEMO_NOTIFICATIONS: DemoNotification[] = [
  {
    key: 'n01',
    type: 'JOIN_REQUEST_RECEIVED',
    actor: 'camila',
    match: 'f07',
    hoursAgo: 0.5,
    read: false,
  },
  {
    key: 'n02',
    type: 'JOIN_REQUEST_RECEIVED',
    actor: 'valentina',
    match: 'f07',
    hoursAgo: 2,
    read: false,
  },
  {
    key: 'n03',
    type: 'JOIN_REQUEST_RECEIVED',
    actor: 'lucia',
    match: 'f08',
    hoursAgo: 5,
    read: false,
  },
  {
    key: 'n04',
    type: 'MATCH_UPDATED',
    actor: 'federico',
    match: 'f09',
    hoursAgo: 20,
    read: false,
    payload: { changed: ['date', 'location'] },
  },
  {
    key: 'n05',
    type: 'JOIN_REQUEST_ACCEPTED',
    actor: 'martina',
    match: 'f02',
    hoursAgo: 26,
    read: true,
  },
  {
    key: 'n06',
    type: 'PARTICIPANT_LEFT',
    actor: 'valentina',
    match: 'f08',
    hoursAgo: 48,
    read: true,
  },
];
