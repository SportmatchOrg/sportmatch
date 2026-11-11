import { signOut, type User as FirebaseUser } from 'firebase/auth';

import { apiBaseUrl } from './api-url';
import { auth } from './firebase';

const SESSION_PATH = '/auth/session';

export async function openSession(firebaseUser: FirebaseUser): Promise<void> {
  const idToken = await firebaseUser.getIdToken(true);

  try {
    const response = await fetch(`${apiBaseUrl()}${SESSION_PATH}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${idToken}` },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Session request failed with status ${response.status}`);
    }
  } finally {
    await signOut(auth).catch(() => undefined);
  }
}

export async function closeSession(): Promise<void> {
  const response = await fetch(`${apiBaseUrl()}${SESSION_PATH}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Session close failed with status ${response.status}`);
  }
}
