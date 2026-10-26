'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';

import { useAuth } from '@/context/auth-context';
import { ApiError } from '@/lib/api';
import { photoError } from '@/lib/photo-upload';
import { matchKeys, userKeys } from '@/lib/query-keys';
import { uploadProfilePhoto } from '@/lib/users';
import type { PublicProfile, User } from '@/types/user';

export function useUploadProfilePhoto(userId: string) {
  const { user: firebaseUser, loading: sessionLoading } = useAuth();
  const queryClient = useQueryClient();
  const sending = useRef(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const mutationKey = userKeys.photo(userId);
  const mutation = useMutation({
    mutationKey,
    mutationFn: (file: File) => uploadProfilePhoto(userId, file),
    onSuccess: async ({ photoUrl }) => {
      await queryClient.cancelQueries({ queryKey: userKeys.all });
      queryClient.setQueryData<User>(userKeys.current(firebaseUser?.uid ?? ''), (user) =>
        user ? { ...user, photoUrl } : undefined);
      queryClient.setQueryData<PublicProfile>(userKeys.publicProfile(userId), (profile) =>
        profile ? { ...profile, photoUrl } : undefined);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: userKeys.all }),
        queryClient.invalidateQueries({ queryKey: matchKeys.all }),
      ]);
    },
  });

  async function upload(file: File): Promise<boolean> {
    if (sending.current || queryClient.isMutating({ mutationKey }) > 0) return false;
    mutation.reset();
    const error = photoError(file);
    setValidationError(error);
    if (error) return false;
    if (sessionLoading || !firebaseUser) {
      setValidationError('Iniciá sesión para cambiar tu foto.');
      return false;
    }
    sending.current = true;
    try {
      await mutation.mutateAsync(file);
      return true;
    } catch {
      return false;
    } finally {
      sending.current = false;
    }
  }

  return {
    upload,
    pending: mutation.isPending,
    error: validationError ?? (mutation.error instanceof ApiError ? mutation.error.message
      : mutation.error ? 'No pudimos subir la foto. Probá de nuevo.' : null),
  };
}
