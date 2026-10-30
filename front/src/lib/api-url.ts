import { requireEnv } from './env';

export function apiBaseUrl(): string {
  if (typeof window === 'undefined') {
    return requireEnv(process.env.API_URL, 'API_URL');
  }

  return requireEnv(process.env.NEXT_PUBLIC_API_URL, 'NEXT_PUBLIC_API_URL');
}
