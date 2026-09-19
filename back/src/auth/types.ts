import type { Request } from 'express';
import type { DecodedIdToken } from 'firebase-admin/auth';

export type FirebaseUser = {
  uid: string;
  email: string;
  name: string;
  photoUrl?: string;
};

export interface FirebaseIdToken extends DecodedIdToken {
  name?: string;
}

export interface AuthenticatedRequest extends Request {
  user: FirebaseUser;
}
