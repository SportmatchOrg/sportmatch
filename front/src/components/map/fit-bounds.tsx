'use client';

import { useMap } from '@vis.gl/react-google-maps';
import { useEffect } from 'react';

const PADDING = { top: 144, right: 48, bottom: 48, left: 48 };

const SINGLE_POINT_ZOOM = 15;

export function FitBounds({ points }: { points: google.maps.LatLngLiteral[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || points.length === 0) return;

    if (points.length === 1) {
      map.setCenter(points[0]);
      map.setZoom(SINGLE_POINT_ZOOM);
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    points.forEach((point) => bounds.extend(point));
    map.fitBounds(bounds, PADDING);
  }, [map, points]);

  return null;
}
