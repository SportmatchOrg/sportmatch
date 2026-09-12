import type { JoinRequestStatus } from '../generated/prisma/client';
import type { PublicUser } from '../users/types';

export type ListedPartido = {
  organizadorId: string;
  fecha: Date;
  _count: { participantes: number; joinRequests: number };
  participantes: { id: string }[];
  joinRequests: { status: JoinRequestStatus }[];
  ratings: { id: string }[];
};

export type DetailedPartido = {
  organizadorId: string;
  fecha: Date;
  _count: { participantes: number; joinRequests: number };
  participantes: { usuario: PublicUser; createdAt: Date }[];
  joinRequests: { status: JoinRequestStatus }[];
  ratings: { id: string }[];
};
