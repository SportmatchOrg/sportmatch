const GOOGLE_PHOTO_HOST = 'lh3.googleusercontent.com';

const GOOGLE_SIZE_SUFFIX = /=s\d+-c$/;

const GOOGLE_PHOTO_SIZE = 400;

function isGooglePhoto(photoUrl: string): boolean {
  try {
    return new URL(photoUrl).hostname === GOOGLE_PHOTO_HOST;
  } catch {
    return false;
  }
}

export function sharpPhotoUrl(photoUrl: string): string {
  return isGooglePhoto(photoUrl)
    ? photoUrl.replace(GOOGLE_SIZE_SUFFIX, `=s${GOOGLE_PHOTO_SIZE}-c`)
    : photoUrl;
}
