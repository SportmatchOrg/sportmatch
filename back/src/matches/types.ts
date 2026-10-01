import type { JoinRequestStatus } from '../generated/prisma/client';
import type { PublicUser } from '../users/types';

export type ListedMatch = {
  organizerId: string;
  date: Date;
  _count: { participants: number; joinRequests: number };
  participants: { id: string }[];
  joinRequests: { status: JoinRequestStatus }[];
  ratings: { id: string }[];
};

export type DetailedMatch = {
  organizerId: string;
  date: Date;
  _count: { participants: number; joinRequests: number };
  participants: { user: PublicUser; createdAt: Date }[];
  joinRequests: { status: JoinRequestStatus }[];
  ratings: { id: string }[];
};
