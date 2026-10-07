import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile,
  type User,
} from 'firebase/auth';

import { getAuthErrorCode } from '@/lib/auth-errors';

const PASSWORD_PROVIDER = 'password';

const WRONG_PASSWORD_CODES = ['auth/invalid-credential', 'auth/wrong-password'];

const WEAK_PASSWORD_CODE = 'auth/weak-password';

export const MIN_PASSWORD_LENGTH = 6;

export function hasPassword(user: User | null): boolean {
  return user?.providerData.some(({ providerId }) => providerId === PASSWORD_PROVIDER) ?? false;
}

export async function confirmPassword(user: User, password: string): Promise<void> {
  await reauthenticateWithCredential(
    user,
    EmailAuthProvider.credential(user.email ?? '', password)
  );
}

export async function changePassword(user: User, password: string): Promise<void> {
  await updatePassword(user, password);
}

export async function syncDisplayName(user: User, name: string): Promise<void> {
  await updateProfile(user, { displayName: name }).catch(() => undefined);
}

export function isWrongPassword(error: unknown): boolean {
  return WRONG_PASSWORD_CODES.includes(getAuthErrorCode(error));
}

export function isWeakPassword(error: unknown): boolean {
  return getAuthErrorCode(error) === WEAK_PASSWORD_CODE;
}
