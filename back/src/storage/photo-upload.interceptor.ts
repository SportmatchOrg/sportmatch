import {
  BadRequestException,
  Injectable,
  PayloadTooLargeException,
  type CallHandler,
  type ExecutionContext,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Observable } from 'rxjs';
import { PHOTO_MAX_BYTES, PHOTO_UPLOAD_ERROR } from './storage.service';

@Injectable()
export class PhotoUploadInterceptor extends FileInterceptor('photo', {
  // Busboy rejects at the limit; allow exactly 5 MB and reject the next byte.
  limits: { fileSize: PHOTO_MAX_BYTES + 1, files: 1 },
}) {
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    try {
      return await super.intercept(context, next);
    } catch (error) {
      if (error instanceof PayloadTooLargeException) {
        throw new BadRequestException(PHOTO_UPLOAD_ERROR);
      }
      throw error;
    }
  }
}
