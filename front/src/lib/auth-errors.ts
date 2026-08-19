import { FirebaseError } from 'firebase/app';

const MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'Email o contraseña incorrectos.',
  'auth/email-already-in-use': 'Ya existe una cuenta con ese email.',
  'auth/weak-password': 'La contraseña tiene que tener al menos 6 caracteres.',
  'auth/invalid-email': 'El email no es válido.',
  'auth/too-many-requests': 'Demasiados intentos. Esperá un momento.',
  'auth/network-request-failed': 'No pudimos conectarnos. Revisá tu conexión.',
  'auth/popup-closed-by-user': 'Cerraste la ventana de Google antes de terminar.',
  'auth/account-exists-with-different-credential':
    'Ese email ya está registrado con otro método.',
};

const FALLBACK = 'Algo salió mal. Probá de nuevo.';

export function getAuthErrorCode(error: unknown): string {
  return error instanceof FirebaseError ? error.code : '';
}

export function getAuthErrorMessage(error: unknown): string {
  const code = getAuthErrorCode(error);

  if (!MESSAGES[code]) {
    console.error('Unhandled auth error:', code, error);
  }

  return MESSAGES[code] ?? FALLBACK;
}
