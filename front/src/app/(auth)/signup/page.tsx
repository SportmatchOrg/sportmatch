'use client';

import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { Mail, User } from 'lucide-react';
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

export default function SignupPage() {
  const { checkingSession } = useRedirectIfAuthenticated();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== repeatPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setSubmitting(true);

    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName: name.trim() });
    } catch (caught) {
      setError(getAuthErrorMessage(caught));
      setSubmitting(false);
    }
  }

  if (checkingSession) {
    return null;
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-[40px] font-extrabold leading-tight tracking-[-0.036em] text-white">Creá tu cuenta</h2>
        <p className="mt-2 text-sm text-neutral-400">
          Sumate y empezá a jugar con gente cerca tuyo
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthField
          icon={<User className="h-5 w-5" />}
          type="text"
          placeholder="Nombre completo"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="name"
          disabled={submitting}
          required
        />

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
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
          disabled={submitting}
          required
        />

        <PasswordField
          placeholder="Repetir contraseña"
          value={repeatPassword}
          onChange={(event) => setRepeatPassword(event.target.value)}
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
          disabled={submitting}
          required
        />

        <FormError message={error} />

        <SubmitButton loading={submitting}>Crear cuenta</SubmitButton>
      </form>

      <AuthDivider label="O registrate con" />

      <GoogleButton label="Google" />

      <p className="text-center text-sm text-neutral-400">
        ¿Ya tenés cuenta?{' '}
        <Link href="/login" className="font-semibold text-sky-400 hover:underline">
          Iniciá sesión
        </Link>
      </p>
    </div>
  );
}
