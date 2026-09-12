"use client";

import dynamic from 'next/dynamic';
import { MapErrorBoundary } from '../MapErrorBoundary';

const MapInner = dynamic(() => import('./MapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-100 flex items-center justify-center rounded-xl animate-pulse">
      <p className="text-slate-500 font-medium">Loading Route Map...</p>
    </div>
  )
});

export function TrackingMap(props: any) {
  return (
    <MapErrorBoundary>
      <MapInner {...props} />
    </MapErrorBoundary>
  );
}
