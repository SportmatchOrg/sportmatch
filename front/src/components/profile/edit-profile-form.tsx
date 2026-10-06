'use client';

import { MapPin, User as UserIcon } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';

import { AuthField } from '@/components/auth/auth-field';
import { PasswordField } from '@/components/auth/password-field';
import { EditField, editFieldErrorId } from '@/components/profile/edit-field';
import { EditProfileLayout } from '@/components/profile/edit-profile-layout';
import { PillButton } from '@/components/ui/pill-button';
import { TOAST_DURATION, Toast, type ToastTone } from '@/components/ui/toast';
import { useAuth } from '@/context/auth-context';
import {
  MIN_PASSWORD_LENGTH,
  changePassword,
  confirmPassword,
  hasPassword,
  isWeakPassword,
  isWrongPassword,
  syncDisplayName,
} from '@/lib/account';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import { updateProfile } from '@/lib/users';
import { cn } from '@/lib/utils';
import { CITY_MAX, CITY_MIN, NAME_MAX, NAME_MIN, type User } from '@/types/user';

const FORM_ID = 'edit-profile-form';

const FIELD = 'lg:py-3';

const SAVED = 'Cambios guardados';
const SAVE_ERROR = 'No pudimos guardar los cambios. Probá de nuevo.';

const NAME_TOO_SHORT = `El nombre tiene que tener al menos ${NAME_MIN} caracteres.`;
const CITY_TOO_SHORT = `La ciudad tiene que tener al menos ${CITY_MIN} caracteres.`;
const CURRENT_PASSWORD_REQUIRED = 'Ingresá tu contraseña actual.';
const WRONG_PASSWORD = 'La contraseña actual es incorrecta.';
const WEAK_PASSWORD = `La contraseña nueva es muy débil. Usá al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
const PASSWORD_MISMATCH = 'Las contraseñas no coinciden.';

type FieldName = 'name' | 'city' | 'currentPassword' | 'newPassword' | 'repeatPassword';

type Errors = Partial<Record<FieldName, string>>;

type ToastState = { message: string; tone: ToastTone };

function SectionHeading({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-subhead font-bold text-white">{title}</h2>
      <p className="text-caption text-ink-46">{hint}</p>
    </div>
  );
}

export function EditProfileForm({ user }: { user: User }) {
  const { user: firebaseUser } = useAuth();
  const canChangePassword = hasPassword(firebaseUser);

  const [name, setName] = useState(user.name);
  const [city, setCity] = useState(user.city ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(null), TOAST_DURATION);
    return () => clearTimeout(timer);
  }, [toast]);

  const trimmedName = name.trim();
  const trimmedCity = city.trim();
  const wantsPassword =
    canChangePassword && [currentPassword, newPassword, repeatPassword].some(Boolean);

  function validate(): Errors {
    const found: Errors = {};

    if (trimmedName.length < NAME_MIN) found.name = NAME_TOO_SHORT;
    if (trimmedCity.length > 0 && trimmedCity.length < CITY_MIN) found.city = CITY_TOO_SHORT;

    if (wantsPassword) {
      if (!currentPassword) found.currentPassword = CURRENT_PASSWORD_REQUIRED;
      if (newPassword.length < MIN_PASSWORD_LENGTH) found.newPassword = WEAK_PASSWORD;
      if (newPassword !== repeatPassword) found.repeatPassword = PASSWORD_MISMATCH;
    }

    return found;
  }

  async function save(): Promise<Errors | null> {
    if (wantsPassword && firebaseUser) {
      try {
        await confirmPassword(firebaseUser, currentPassword);
      } catch (caught) {
        return {
          currentPassword: isWrongPassword(caught) ? WRONG_PASSWORD : getAuthErrorMessage(caught),
        };
      }
    }

    try {
      await updateProfile(user.id, { name: trimmedName, city: trimmedCity || null });
    } catch {
      return null;
    }

    if (firebaseUser) await syncDisplayName(firebaseUser, trimmedName);

    if (wantsPassword && firebaseUser) {
      try {
        await changePassword(firebaseUser, newPassword);
      } catch (caught) {
        return {
          newPassword: isWeakPassword(caught) ? WEAK_PASSWORD : getAuthErrorMessage(caught),
        };
      }
    }

    return {};
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    const result = await save();
    setSaving(false);

    if (result === null) {
      setToast({ message: SAVE_ERROR, tone: 'danger' });
      return;
    }

    setErrors(result);
    if (Object.keys(result).length > 0) return;

    setName(trimmedName);
    setCity(trimmedCity);
    setCurrentPassword('');
    setNewPassword('');
    setRepeatPassword('');
    setToast({ message: SAVED, tone: 'success' });
  }

  const describedBy = (field: FieldName) => (errors[field] ? editFieldErrorId(field) : undefined);
  const saveLabel = saving ? 'Guardando…' : 'Guardar cambios';

  return (
    <EditProfileLayout
      action={
        <PillButton
          type="submit"
          form={FORM_ID}
          size="md"
          disabled={saving}
          className="hidden lg:flex"
        >
          {saveLabel}
        </PillButton>
      }
    >
      <form
        id={FORM_ID}
        onSubmit={handleSubmit}
        noValidate
        className={cn('flex flex-col gap-8', canChangePassword && 'lg:grid lg:grid-cols-2')}
      >
        <section className="flex flex-col gap-4">
          {canChangePassword && (
            <SectionHeading title="Tus datos" hint="Así te ven los demás jugadores." />
          )}

          <div
            className={cn(
              'flex flex-col gap-4',
              !canChangePassword && 'lg:grid lg:grid-cols-2 lg:gap-8'
            )}
          >
            <EditField id="name" label="Nombre" error={errors.name}>
              <AuthField
                id="name"
                icon={<UserIcon className="size-5" aria-hidden="true" />}
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                maxLength={NAME_MAX}
                invalid={Boolean(errors.name)}
                aria-describedby={describedBy('name')}
                disabled={saving}
                className={FIELD}
              />
            </EditField>

            <EditField id="city" label="Ciudad" error={errors.city}>
              <AuthField
                id="city"
                icon={<MapPin className="size-5" aria-hidden="true" />}
                type="text"
                placeholder="¿Dónde jugás?"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                autoComplete="address-level2"
                maxLength={CITY_MAX}
                invalid={Boolean(errors.city)}
                aria-describedby={describedBy('city')}
                disabled={saving}
                className={FIELD}
              />
            </EditField>
          </div>
        </section>

        {canChangePassword && (
          <section className="flex flex-col gap-4">
            <SectionHeading
              title="Cambiar contraseña"
              hint="Dejá los campos vacíos para mantener la actual."
            />

            <EditField id="currentPassword" label="Contraseña actual" error={errors.currentPassword}>
              <PasswordField
                id="currentPassword"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                autoComplete="current-password"
                invalid={Boolean(errors.currentPassword)}
                aria-describedby={describedBy('currentPassword')}
                disabled={saving}
                className={FIELD}
              />
            </EditField>

            <EditField id="newPassword" label="Contraseña nueva" error={errors.newPassword}>
              <PasswordField
                id="newPassword"
                placeholder={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres`}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                autoComplete="new-password"
                invalid={Boolean(errors.newPassword)}
                aria-describedby={describedBy('newPassword')}
                disabled={saving}
                className={FIELD}
              />
            </EditField>

            <EditField
              id="repeatPassword"
              label="Repetir contraseña nueva"
              error={errors.repeatPassword}
            >
              <PasswordField
                id="repeatPassword"
                placeholder="Repetila"
                value={repeatPassword}
                onChange={(event) => setRepeatPassword(event.target.value)}
                autoComplete="new-password"
                invalid={Boolean(errors.repeatPassword)}
                aria-describedby={describedBy('repeatPassword')}
                disabled={saving}
                className={FIELD}
              />
            </EditField>
          </section>
        )}

        <PillButton type="submit" disabled={saving} className="lg:hidden">
          {saveLabel}
        </PillButton>
      </form>

      {toast && (
        <div className="fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 lg:bottom-8">
          <Toast message={toast.message} tone={toast.tone} />
        </div>
      )}
    </EditProfileLayout>
  );
}
