'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';

import { useAuth } from '@/context/auth-context';
import { useSyncProfileCache } from '@/hooks/use-sync-profile-cache';
import { ApiError } from '@/lib/api';
import { photoError } from '@/lib/photo-upload';
import { userKeys } from '@/lib/query-keys';
import { uploadProfilePhoto } from '@/lib/users';

export function useUploadProfilePhoto(userId: string) {
  const { user: firebaseUser, loading: sessionLoading } = useAuth();
  const queryClient = useQueryClient();
  const syncProfileCache = useSyncProfileCache();
  const sending = useRef(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const mutationKey = userKeys.photo(userId);
  const mutation = useMutation({
    mutationKey,
    mutationFn: (file: File) => uploadProfilePhoto(userId, file),
    onSuccess: ({ photoUrl }) => syncProfileCache(userId, firebaseUser?.uid ?? '', { photoUrl }),
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
