import type { JoinRequestStatus } from '../generated/prisma/client';

export type PublicUser = {
  id: string;
  nombre: string;
  fotoUrl: string | null;
};

export type ListedPartido = {
  _count: { participantes: number };
  participantes: { id: string }[];
  joinRequests: { status: JoinRequestStatus }[];
};

export type DetailedPartido = {
  _count: { participantes: number };
  participantes: { usuario: PublicUser; createdAt: Date }[];
  joinRequests: { status: JoinRequestStatus }[];
};
