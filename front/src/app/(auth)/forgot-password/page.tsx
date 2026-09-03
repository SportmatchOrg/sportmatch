'use client';

import { sendPasswordResetEmail } from 'firebase/auth';
import { Mail } from 'lucide-react';
import Link from 'next/link';
import { useState, type FormEvent } from 'react';

import { AuthField } from '@/components/auth/auth-field';
import { FormError } from '@/components/auth/form-error';
import { SubmitButton } from '@/components/auth/submit-button';
import { useRedirectIfAuthenticated } from '@/hooks/use-redirect-if-authenticated';
import { getAuthErrorCode, getAuthErrorMessage } from '@/lib/auth-errors';
import { auth } from '@/lib/firebase';

const SILENT_CODES = ['auth/user-not-found', 'auth/invalid-credential'];

export default function ForgotPasswordPage() {
  const { checkingSession } = useRedirectIfAuthenticated();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (caught) {
      if (SILENT_CODES.includes(getAuthErrorCode(caught))) {
        setSent(true);
      } else {
        setError(getAuthErrorMessage(caught));
        setSubmitting(false);
      }
    }
  }

  if (checkingSession) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h2 className="text-[40px] font-extrabold leading-tight tracking-[-0.036em] text-white">
          Recuperar acceso
        </h2>
        <p className="text-sm text-neutral-400">
          Te mandamos un link para que puedas elegir una contraseña nueva
        </p>
      </header>

      {sent ? (
        <div className="flex flex-col gap-4 rounded-3xl border border-white/12 bg-surface-glass p-6">
          <p className="text-sm text-neutral-200">
            Si <span className="font-semibold text-white">{email}</span> tiene una
            cuenta, te va a llegar un mail con el link para cambiar la contraseña.
          </p>
          <p className="text-sm text-neutral-400">
            Revisá también la carpeta de spam.
          </p>
        </div>
      ) : (
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

          <FormError message={error} />

          <SubmitButton loading={submitting}>Enviar link</SubmitButton>
        </form>
      )}

      <p className="text-center text-sm text-neutral-400">
        <Link href="/login" className="font-semibold text-sky-400 hover:underline">
          Volver a iniciar sesión
        </Link>
      </p>
    </div>
  );
}
