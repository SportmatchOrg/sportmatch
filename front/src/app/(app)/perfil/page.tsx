'use client';

import { signOut } from 'firebase/auth';

import { useAuth } from '@/context/auth-context';
import { auth } from '@/lib/firebase';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <main className="mx-auto flex w-full max-w-md flex-col items-start gap-4 p-6">
      <h1 className="text-title">Perfil</h1>
      <p className="text-body text-neutral-400">{user?.displayName ?? user?.email}</p>

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
