import { IsIn } from 'class-validator';

export const INVITATION_RESPONSES = ['ACCEPTED', 'REJECTED'] as const;

export type InvitationResponse = (typeof INVITATION_RESPONSES)[number];

export class RespondInvitationDto {
  @IsIn(INVITATION_RESPONSES)
  status: InvitationResponse;
}
