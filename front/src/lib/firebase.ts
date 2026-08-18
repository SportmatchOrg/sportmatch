import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

function requireEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Copy front/.env.example to front/.env and fill it in.`,
    );
  }

  return value;
}

const config = {
  apiKey: requireEnv(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    'NEXT_PUBLIC_FIREBASE_API_KEY',
  ),
  authDomain: requireEnv(
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  ),
  projectId: requireEnv(
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  ),
  appId: requireEnv(
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    'NEXT_PUBLIC_FIREBASE_APP_ID',
  ),
};

export const app = getApps().length ? getApp() : initializeApp(config);
export const auth = getAuth(app);
