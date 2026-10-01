'use client';

import { APIProvider } from '@vis.gl/react-google-maps';
import type { ReactNode } from 'react';

import { requireEnv } from '@/lib/env';

export function MapsProvider({ children }: { children: ReactNode }) {
  const apiKey = requireEnv(
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY',
  );

  return (
    <APIProvider apiKey={apiKey} language="es" region="AR">
      {children}
    </APIProvider>
  );
}
