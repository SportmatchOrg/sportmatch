'use client';

import { Eye, EyeOff, Lock } from 'lucide-react';
import { useState, type InputHTMLAttributes } from 'react';

import { AuthField } from './auth-field';

type PasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

export function PasswordField(props: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <AuthField
      {...props}
      type={visible ? 'text' : 'password'}
      icon={<Lock className="h-5 w-5" />}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          className="rounded-full p-1 text-neutral-400 transition hover:text-neutral-200"
        >
          {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      }
    />
  );
}
