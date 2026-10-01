'use client';

import { Map, type MapProps } from '@vis.gl/react-google-maps';

import { requireEnv } from '@/lib/env';

type BaseMapProps = Required<
  Pick<MapProps, 'defaultCenter' | 'defaultZoom' | 'className'>
> &
  Pick<MapProps, 'children'>;

export function BaseMap({
  defaultCenter,
  defaultZoom,
  className,
  children,
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
      className={className}
    >
      {children}
    </Map>
  );
}
