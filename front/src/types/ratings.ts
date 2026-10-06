import type { ToastTone } from '@/components/ui/toast';
import type { PublicUser } from '@/types/match';

export type RatingFeedback = { message: string; tone: ToastTone };
export type RatingAnswer = { score: number; comment: string };

export type RatingInput = {
  ratedUserId: string;
  score: number;
  comment?: string;
};

export type RatingTargets = {
  matchId: string;
  targets: PublicUser[];
  players: PublicUser[];
};
