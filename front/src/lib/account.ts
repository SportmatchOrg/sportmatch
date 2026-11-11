import {
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile,
  type User,
} from 'firebase/auth';

import { getAuthErrorCode } from '@/lib/auth-errors';
import { auth } from '@/lib/firebase';
import type { SessionUser } from '@/types/session';

const PASSWORD_PROVIDER = 'password';

const WRONG_PASSWORD_CODES = ['auth/invalid-credential', 'auth/wrong-password'];

const WEAK_PASSWORD_CODE = 'auth/weak-password';

export const MIN_PASSWORD_LENGTH = 6;

export function hasPassword(user: SessionUser | null): boolean {
  return user?.signInProvider === PASSWORD_PROVIDER;
}

export async function confirmPassword(email: string, password: string): Promise<User> {
  const { user } = await signInWithEmailAndPassword(auth, email, password);

  return user;
}

export async function releaseCredential(): Promise<void> {
  await signOut(auth).catch(() => undefined);
}

export async function changePassword(user: User, password: string): Promise<void> {
  await updatePassword(user, password);
}

export async function syncDisplayName(user: User, name: string): Promise<void> {
  await updateProfile(user, { displayName: name });
}

export function isWrongPassword(error: unknown): boolean {
  return WRONG_PASSWORD_CODES.includes(getAuthErrorCode(error));
}

export function isWeakPassword(error: unknown): boolean {
  return getAuthErrorCode(error) === WEAK_PASSWORD_CODE;
}
