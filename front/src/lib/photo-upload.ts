export const PHOTO_MAX_BYTES = 5 * 1024 * 1024;
export const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const PHOTO_HINT = 'JPG, PNG o WebP · hasta 5 MB';

export function photoError(file: File): string | null {
  if (!PHOTO_TYPES.includes(file.type as (typeof PHOTO_TYPES)[number])) {
    return 'La foto tiene que ser JPG, PNG o WebP';
  }
  if (file.size > PHOTO_MAX_BYTES) return 'La foto pesa más de 5 MB';
  return null;
}
