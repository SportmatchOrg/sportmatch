import { Global, Module } from '@nestjs/common';
import { App, cert, getApp, getApps, initializeApp } from 'firebase-admin/app';

export const FIREBASE_ADMIN = 'FIREBASE_ADMIN';

@Global()
@Module({
  providers: [
    {
      provide: FIREBASE_ADMIN,
      useFactory: (): App => {
        if (getApps().length) return getApp();

        return initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          }),
        });
      },
    },
  ],
  exports: [FIREBASE_ADMIN],
})
export class FirebaseModule {}
