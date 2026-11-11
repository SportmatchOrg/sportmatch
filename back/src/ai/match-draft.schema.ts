import { z } from 'zod';
import { Level } from '../generated/prisma/client';

export const DRAFT_SPORTS = [
  'FUTBOL',
  'BASQUET',
  'TENIS',
  'PADEL',
  'RUNNING',
] as const;

export const matchDraftSchema = z.object({
  sport: z.enum(DRAFT_SPORTS).nullable(),
  level: z.enum(Level).nullable(),
  date: z.string().nullable(),
  location: z.string().nullable(),
  capacity: z.number().nullable(),
  description: z.string().nullable(),
});

export type MatchDraftOutput = z.infer<typeof matchDraftSchema>;
