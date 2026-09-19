import type { JoinRequestStatus } from '../generated/prisma/client';
import type { PublicUser } from '../users/types';

export type ListedPartido = {
  organizerId: string;
  date: Date;
  _count: { participants: number; joinRequests: number };
  participants: { id: string }[];
  joinRequests: { status: JoinRequestStatus }[];
  ratings: { id: string }[];
};

export type DetailedPartido = {
  organizerId: string;
  date: Date;
  _count: { participants: number; joinRequests: number };
  participants: { user: PublicUser; createdAt: Date }[];
  joinRequests: { status: JoinRequestStatus }[];
  ratings: { id: string }[];
};
