import type { JoinRequestStatus } from '../generated/prisma/client';

export type PublicUser = {
  id: string;
  nombre: string;
  fotoUrl: string | null;
};

export type ListedPartido = {
  organizadorId: string;
  _count: { participantes: number; joinRequests: number };
  participantes: { id: string }[];
  joinRequests: { status: JoinRequestStatus }[];
};

export type DetailedPartido = {
  organizadorId: string;
  _count: { participantes: number; joinRequests: number };
  participantes: { usuario: PublicUser; createdAt: Date }[];
  joinRequests: { status: JoinRequestStatus }[];
};
