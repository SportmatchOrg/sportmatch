export type PublicUser = {
  id: string;
  name: string;
  photoUrl: string | null;
};

export type NoShowReportsFilter =
  { matchIds: string[] } | { reportedUserIds: string[] };
