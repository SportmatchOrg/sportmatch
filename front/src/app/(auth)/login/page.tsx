'use client';

import { signInWithEmailAndPassword } from 'firebase/auth';
import { Mail } from 'lucide-react';
import Link from 'next/link';
import { useState, type FormEvent } from 'react';

import { AuthDivider } from '@/components/auth/auth-divider';
import { AuthField } from '@/components/auth/auth-field';
import { FormError } from '@/components/auth/form-error';
import { GoogleButton } from '@/components/auth/google-button';
import { PasswordField } from '@/components/auth/password-field';
import { SubmitButton } from '@/components/auth/submit-button';
import { useRedirectIfAuthenticated } from '@/hooks/use-redirect-if-authenticated';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import { auth } from '@/lib/firebase';

const MIN_PASSWORD_LENGTH = 6;

export default function LoginPage() {
  const { checkingSession } = useRedirectIfAuthenticated();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (caught) {
      setError(getAuthErrorMessage(caught));
      setSubmitting(false);
    }
  }

  if (checkingSession) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h2 className="text-[40px] font-extrabold leading-tight tracking-[-0.036em] text-white">
          Bienvenido
        </h2>
        <p className="text-sm text-neutral-400">
          Iniciá sesión para encontrar tu próximo partido
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AuthField
          icon={<Mail className="h-5 w-5" />}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          disabled={submitting}
          required
        />

        <PasswordField
          placeholder="Contraseña"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          minLength={MIN_PASSWORD_LENGTH}
          disabled={submitting}
          required
        />

        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-sm font-semibold text-sky-400 hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <FormError message={error} />

        <SubmitButton loading={submitting}>Iniciar sesión</SubmitButton>
      </form>

      <AuthDivider label="O continuá con" />

      <GoogleButton label="Google" disabled={submitting} onError={setError} />

      <p className="text-center text-sm text-neutral-400">
        ¿No tenés cuenta?{' '}
        <Link href="/signup" className="font-semibold text-sky-400 hover:underline">
          Registrate
        </Link>
      </p>
    </div>
  );
}
