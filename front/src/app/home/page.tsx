'use client';

import { signOut } from 'firebase/auth';

import { useAuth } from '@/context/auth-context';
import { auth } from '@/lib/firebase';


export default function HomePage() {
  const { user } = useAuth();

  return (
    <main className="flex min-h-screen flex-col items-start gap-4 bg-neutral-950 p-8 text-white">
      <p className="text-lg">Home — {user?.displayName ?? user?.email}</p>

      <button
        type="button"
        onClick={() => signOut(auth)}
        className="rounded-full border border-neutral-800 bg-surface-glass px-5 py-2 text-sm transition hover:bg-neutral-900"
      >
        Cerrar sesión
      </button>
    </main>
  );
}
