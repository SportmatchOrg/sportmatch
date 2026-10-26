import { apiFetch } from '@/lib/api';
import type { Match, PublicUser } from '@/types/match';
import type { OnboardingData, ProfileUpdate, PublicProfile, User } from '@/types/user';

export const USER_SEARCH_MIN_LENGTH = 2;
export const USER_SEARCH_MAX_LENGTH = 50;

export async function searchUsers(query: string, signal?: AbortSignal): Promise<PublicUser[]> {
  const params = new URLSearchParams({ q: query });
  return apiFetch<PublicUser[]>(`/users/search?${params}`, { signal });
}

export async function fetchPublicProfile(userId: string, signal?: AbortSignal): Promise<PublicProfile> {
  return apiFetch<PublicProfile>(`/users/${userId}`, { signal });
}

export async function fetchPlayedBy(userId: string, signal?: AbortSignal): Promise<Match[]> {
  return apiFetch<Match[]>(`/matches/played-by/${userId}`, { signal });
}

export async function uploadProfilePhoto(userId: string, file: File): Promise<{ photoUrl: string }> {
  const body = new FormData();
  body.append('photo', file);
  return apiFetch(`/users/${userId}/photo`, { method: 'POST', body });
}

export async function updateProfile(userId: string, update: ProfileUpdate): Promise<User> {
  return apiFetch<User>(`/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(update),
  });
}

export async function completeOnboarding(userId: string, data: OnboardingData): Promise<User> {
  return apiFetch<User>(`/users/${userId}/onboarding`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
