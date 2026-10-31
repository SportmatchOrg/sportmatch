'use client';

import { LoaderCircle, MapPin, User as UserIcon } from 'lucide-react';
import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent } from 'react';

import { AiImageDialog } from '@/components/ai-image-dialog';
import { AuthField } from '@/components/auth/auth-field';
import { PasswordField } from '@/components/auth/password-field';
import { EditField, editFieldErrorId } from '@/components/profile/edit-field';
import { EditProfileLayout } from '@/components/profile/edit-profile-layout';
import { SportsPicker } from '@/components/profile/sports-picker';
import { ProfileAvatar } from '@/components/profile/profile-avatar';
import { FilterChip } from '@/components/ui/filter-chip';
import { PillButton, pillButtonClassName } from '@/components/ui/pill-button';
import { TOAST_DURATION, Toast, type ToastTone } from '@/components/ui/toast';
import { useAuth } from '@/context/auth-context';
import { useSyncProfileCache } from '@/hooks/use-sync-profile-cache';
import { useUploadProfilePhoto } from '@/hooks/use-upload-profile-photo';
import { PHOTO_HINT, PHOTO_TYPES } from '@/lib/photo-upload';
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
import { LEVELS, LEVEL_LABEL, type Level } from '@/types/match';
import {
  CITY_MAX,
  CITY_MIN,
  NAME_MAX,
  NAME_MIN,
  type User,
} from '@/types/user';

const FORM_ID = 'edit-profile-form';

const FIELD = 'lg:py-3';

const CHIPS = 'flex flex-wrap gap-2';

const GROUP_LABEL = 'flex items-center justify-between gap-3 px-1 text-overline text-ink-46 uppercase';

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
  const syncProfileCache = useSyncProfileCache();
  const photo = useUploadProfilePhoto(user.id);
  const photoInput = useRef<HTMLInputElement>(null);
  const photoHintId = useId();
  const photoErrorId = useId();
  const canChangePassword = hasPassword(firebaseUser);

  const [name, setName] = useState(user.name);
  const [city, setCity] = useState(user.city ?? '');
  const [sportIds, setSportIds] = useState(() => user.sports.map((sport) => sport.id));
  const [level, setLevel] = useState<Level | null>(user.level);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  async function applyPhoto(file: File): Promise<boolean> {
    const updated = await photo.upload(file);
    if (updated) setToast({ message: 'Foto actualizada', tone: 'success' });
    return updated;
  }

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (file) await applyPhoto(file);
  }

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

  async function save(): Promise<Errors | string | null> {
    if (wantsPassword && firebaseUser) {
      try {
        await confirmPassword(firebaseUser, currentPassword);
      } catch (caught) {
        return {
          currentPassword: isWrongPassword(caught) ? WRONG_PASSWORD : getAuthErrorMessage(caught),
        };
      }
    }

    let saved: User;
    try {
      saved = await updateProfile(user.id, {
        name: trimmedName,
        city: trimmedCity || null,
        level,
        sportIds,
      });
    } catch {
      return null;
    }

    await syncProfileCache(user.id, user.firebaseUid, {
      name: saved.name,
      city: saved.city,
      level: saved.level,
      sports: saved.sports,
    });

    if (firebaseUser) {
      try {
        await syncDisplayName(firebaseUser, trimmedName);
      } catch {
        return 'Tu perfil se guardó, pero no pudimos sincronizar el nombre con Firebase. Probá de nuevo.';
      }
    }

    if (wantsPassword && firebaseUser) {
      try {
        await changePassword(firebaseUser, newPassword);
      } catch (caught) {
        setToast({ message: 'Tu perfil se guardó, pero no pudimos cambiar la contraseña.', tone: 'danger' });
        return {
          newPassword: isWeakPassword(caught) ? WEAK_PASSWORD : getAuthErrorMessage(caught),
        };
      }
    }

    return {};
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || photo.pending) return;

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    try {
      const result = await save();

      if (result === null || typeof result === 'string') {
        setToast({ message: result ?? SAVE_ERROR, tone: 'danger' });
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
    } catch {
      setToast({ message: 'No pudimos completar todas las operaciones. Revisá tu perfil antes de volver a intentar.', tone: 'danger' });
    } finally {
      setSaving(false);
    }
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
          disabled={saving || photo.pending}
          className="hidden lg:flex"
        >
          {saveLabel}
        </PillButton>
      }
    >
      <section aria-label="Foto de perfil" className="flex flex-col items-center gap-3 lg:items-start">
        <button
          type="button"
          disabled={saving || photo.pending}
          onClick={() => photoInput.current?.click()}
          aria-label="Cambiar foto"
          aria-busy={photo.pending}
          aria-describedby={photo.error ? `${photoHintId} ${photoErrorId}` : photoHintId}
          className="flex flex-col items-center gap-4 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed"
        >
          <span className="relative rounded-full">
            <ProfileAvatar name={user.name} photoUrl={user.photoUrl} />
            {photo.pending && (
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-base/70">
                <LoaderCircle className="size-7 animate-spin text-white" aria-hidden="true" />
              </span>
            )}
          </span>
          <span className={pillButtonClassName({ variant: 'glass', size: 'md' })}>
            {photo.pending ? 'Subiendo foto…' : 'Cambiar foto'}
          </span>
        </button>
        <AiImageDialog target="profile" disabled={saving || photo.pending} onUse={applyPhoto} />
        <input
          ref={photoInput}
          type="file"
          accept={PHOTO_TYPES.join(',')}
          disabled={saving || photo.pending}
          onChange={(event) => void handlePhotoChange(event)}
          aria-label="Elegir foto de perfil"
          tabIndex={-1}
          className="sr-only"
        />
        <p id={photoHintId} className="text-caption text-ink-64">{PHOTO_HINT}</p>
        {photo.error && <p id={photoErrorId} role="alert" className="text-caption text-danger">{photo.error}</p>}
      </section>
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

            <SportsPicker value={sportIds} onChange={setSportIds} disabled={saving} />

            <div className="flex flex-col gap-2">
              <p id="level-label" className={GROUP_LABEL}>
                Nivel
              </p>

              <div role="group" aria-labelledby="level-label" className={CHIPS}>
                {LEVELS.map((option) => (
                  <FilterChip
                    key={option}
                    selected={level === option}
                    aria-disabled={saving}
                    onClick={() => !saving && setLevel(level === option ? null : option)}
                  >
                    {LEVEL_LABEL[option]}
                  </FilterChip>
                ))}
              </div>
            </div>
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

        <PillButton type="submit" disabled={saving || photo.pending} className="lg:hidden">
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
