'use client';

import { signOut } from 'firebase/auth';

import { useAuth } from '@/context/auth-context';
import { auth } from '@/lib/firebase';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <main className="flex flex-col items-start gap-4 p-8">
      <p className="text-body">Inicio — {user?.displayName ?? user?.email}</p>

      <button
        type="button"
        onClick={() => signOut(auth)}
        className="rounded-full border border-glass-strong bg-glass px-5 py-2 text-caption transition hover:bg-glass-strong"
      >
        Cerrar sesión
      </button>
    </main>
  );
}
