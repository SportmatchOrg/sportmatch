import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';

export const PHOTO_MAX_BYTES = 5 * 1024 * 1024;
export const PHOTO_UPLOAD_ERROR =
  'La foto tiene que ser JPG, PNG o WebP de hasta 5 MB';
const PATH_PATTERN = /^[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*$/;

const IMAGE_FORMATS = {
  'image/jpeg': {
    extension: 'jpg',
    matches: (buffer: Buffer) =>
      buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])),
  },
  'image/png': {
    extension: 'png',
    matches: (buffer: Buffer) =>
      buffer
        .subarray(0, 8)
        .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  },
  'image/webp': {
    extension: 'webp',
    matches: (buffer: Buffer) =>
      buffer.subarray(0, 4).equals(Buffer.from('RIFF')) &&
      buffer.subarray(8, 12).equals(Buffer.from('WEBP')),
  },
} satisfies Record<
  string,
  { extension: string; matches: (buffer: Buffer) => boolean }
>;

@Injectable()
export class StorageService {
  private readonly container: ContainerClient;

  constructor(config: ConfigService) {
    const connectionString = config.getOrThrow<string>(
      'AZURE_STORAGE_CONNECTION_STRING',
    );
    const container = config.getOrThrow<string>('AZURE_STORAGE_CONTAINER');
    try {
      const client = BlobServiceClient.fromConnectionString(connectionString);
      this.container = client.getContainerClient(container);
    } catch {
      throw new Error('Invalid AZURE_STORAGE_CONNECTION_STRING configuration');
    }
  }

  async upload(
    buffer: Buffer,
    contentType: string,
    path: string,
  ): Promise<string> {
    const format = Object.hasOwn(IMAGE_FORMATS, contentType)
      ? IMAGE_FORMATS[contentType as keyof typeof IMAGE_FORMATS]
      : undefined;

    if (!buffer.length || buffer.length > PHOTO_MAX_BYTES) {
      throw new BadRequestException(PHOTO_UPLOAD_ERROR);
    }
    if (!format || !format.matches(buffer)) {
      throw new BadRequestException(PHOTO_UPLOAD_ERROR);
    }
    if (!PATH_PATTERN.test(path)) {
      throw new BadRequestException('Invalid image path');
    }

    const blob = this.container.getBlockBlobClient(
      `${path}/${randomUUID()}.${format.extension}`,
    );

    try {
      await blob.uploadData(buffer, {
        blobHTTPHeaders: { blobContentType: contentType },
      });
      const { origin, pathname } = new URL(blob.url);
      return `${origin}${pathname}`;
    } catch {
      throw new ServiceUnavailableException('Image storage is unavailable');
    }
  }

  async remove(url: string): Promise<void> {
    const blobName = this.blobNameFromUrl(url);

    try {
      await this.container.getBlockBlobClient(blobName).deleteIfExists();
    } catch {
      throw new ServiceUnavailableException('Image storage is unavailable');
    }
  }

  isStoredInPath(url: string, path: string): boolean {
    if (!PATH_PATTERN.test(path)) return false;
    try {
      return this.blobNameFromUrl(url).startsWith(`${path}/`);
    } catch {
      return false;
    }
  }

  private blobNameFromUrl(value: string): string {
    const invalidUrl = () => new BadRequestException('Invalid image URL');
    let url: URL;
    try {
      url = new URL(value);
    } catch {
      throw invalidUrl();
    }

    const containerUrl = new URL(this.container.url);
    const prefix = `${containerUrl.pathname}/`;
    if (
      url.href !== value ||
      url.protocol !== 'https:' ||
      url.origin !== containerUrl.origin ||
      url.username ||
      url.password ||
      value.includes('?') ||
      value.includes('#') ||
      !url.pathname.startsWith(prefix)
    ) {
      throw invalidUrl();
    }

    const blobName = url.pathname.slice(prefix.length);
    if (
      !blobName ||
      blobName
        .split('/')
        .some((segment) => !/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(segment))
    ) {
      throw invalidUrl();
    }
    return blobName;
  }
}
