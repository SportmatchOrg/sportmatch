'use client';

import { Map, type MapProps } from '@vis.gl/react-google-maps';

import { requireEnv } from '@/lib/env';
import { cn } from '@/lib/utils';

type BaseMapProps = Required<
  Pick<MapProps, 'defaultCenter' | 'defaultZoom' | 'className'>
> &
  Pick<MapProps, 'children'> & { bottomInset?: boolean };

export function BaseMap({
  defaultCenter,
  defaultZoom,
  className,
  children,
  bottomInset = false,
}: BaseMapProps) {
  const mapId = requireEnv(
    process.env.NEXT_PUBLIC_GOOGLE_MAP_ID,
    'NEXT_PUBLIC_GOOGLE_MAP_ID',
  );

  return (
    <Map
      mapId={mapId}
      colorScheme="DARK"
      disableDefaultUI
      clickableIcons={false}
      gestureHandling="greedy"
      defaultCenter={defaultCenter}
      defaultZoom={defaultZoom}
      className={cn(className, bottomInset && 'map-with-bottom-inset')}
    >
      {children}
    </Map>
  );
}
