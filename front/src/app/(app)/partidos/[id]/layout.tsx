import type { Metadata } from 'next';

import { fetchPublicMatch, matchShareDescription, matchShareTitle } from '@/lib/public-matches';
import { sportPhotoUrl } from '@/lib/sport-photo';

const FALLBACK_METADATA: Metadata = { title: 'Partido · SportMatch' };

const PREVIEW_REVALIDATE_SECONDS = 60;

export async function generateMetadata({
  params,
}: LayoutProps<'/partidos/[id]'>): Promise<Metadata> {
  const { id } = await params;
  const match = await fetchPublicMatch(id, {
    next: { revalidate: PREVIEW_REVALIDATE_SECONDS },
  }).catch(() => null);

  if (!match) return FALLBACK_METADATA;

  const title = matchShareTitle(match);
  const description = matchShareDescription(match);
  const photo = match.photoUrl ?? sportPhotoUrl(match.sport.name, match.id);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'SportMatch',
      images: photo ? [photo] : undefined,
    },
  };
}

export default function MatchLayout({ children }: LayoutProps<'/partidos/[id]'>) {
  return children;
}
