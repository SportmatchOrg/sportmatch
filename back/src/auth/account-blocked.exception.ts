import { ForbiddenException, HttpStatus } from '@nestjs/common';

export const ACCOUNT_BLOCKED = 'ACCOUNT_BLOCKED';

export class AccountBlockedException extends ForbiddenException {
  constructor(until: Date | null) {
    super({
      statusCode: HttpStatus.FORBIDDEN,
      code: ACCOUNT_BLOCKED,
      message: 'Your account is blocked',
      until,
    });
  }
}
