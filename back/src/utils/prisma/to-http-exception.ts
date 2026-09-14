import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';

type PrismaErrorMessages = {
  P2002?: string;
  P2003?: string;
  P2025?: string;
};

export const toPrismaHttpException = (
  error: unknown,
  messages: PrismaErrorMessages,
): Error => {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return error instanceof Error ? error : new Error(String(error));
  }

  if (error.code === 'P2002' && messages.P2002) {
    return new ConflictException(messages.P2002);
  }

  if (error.code === 'P2003' && messages.P2003) {
    return new BadRequestException(messages.P2003);
  }

  if (error.code === 'P2025' && messages.P2025) {
    return new NotFoundException(messages.P2025);
  }

  return error;
};
