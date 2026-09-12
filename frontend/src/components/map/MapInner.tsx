"use client";

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TimelineStop } from '../timeline/StopTimeline';

function isValidLatLng(lat?: any, lng?: any): boolean {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    (lat !== 0 || lng !== 0)
  );
}

interface MapInnerProps {
  stops: (TimelineStop & { lat: number; lng: number })[];
  currentLocation?: { lat: number; lng: number };
}

export default function MapInner({ stops, currentLocation }: MapInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    // Fix leaflet marker icon URLs
    if (L.Icon.Default.prototype) {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
    }

    // Initialize Leaflet Map once
    if (!mapRef.current) {
      const map = L.map(containerRef.current, {
        center: [22.5726, 88.3639],
        zoom: 11,
        zoomControl: true
      });

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapRef.current = map;
    }

    const map = mapRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    // Clear previous markers & polylines
    layerGroup.clearLayers();

    // Create custom div icons
    const stopIcon = L.divIcon({
      className: 'custom-stop-icon',
      html: `<div style="background-color: #94a3b8; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });

    const nextStopIcon = L.divIcon({
      className: 'custom-stop-icon',
      html: `<div style="background-color: #2563eb; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });

    const destIcon = L.divIcon({
      className: 'custom-stop-icon',
      html: `<div style="background-color: #16a34a; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });

    const busIcon = L.divIcon({
      className: 'custom-bus-icon',
      html: `<div style="font-size: 26px; line-height: 1; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">🚌</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    // Validate stops
    const validStops = (stops || []).filter(s => s && isValidLatLng(s.lat, s.lng));
    const routeCoords: [number, number][] = validStops.map(s => [s.lat, s.lng]);

    // Draw route polyline
    if (routeCoords.length > 1) {
      L.polyline(routeCoords, {
        color: '#2563eb',
        weight: 4,
        opacity: 0.7,
        dashArray: '10, 10'
      }).addTo(layerGroup);
    }

    // Add stop markers
    validStops.forEach(stop => {
      const icon = stop.status === 'passed' ? stopIcon 
                 : stop.status === 'destination' ? destIcon 
                 : nextStopIcon;

      const marker = L.marker([stop.lat, stop.lng], { icon }).addTo(layerGroup);
      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 13px;">
          <div style="font-weight: bold; color: #0f172a;">${stop.name || 'Stop'}</div>
          <div style="color: #64748b; font-size: 12px; margin-top: 2px;">${stop.time || ''}</div>
        </div>
      `);
    });

    // Add live bus marker if valid
    const hasValidCurrentLoc = currentLocation && isValidLatLng(currentLocation.lat, currentLocation.lng);
    if (hasValidCurrentLoc) {
      const busMarker = L.marker([currentLocation.lat, currentLocation.lng], { icon: busIcon }).addTo(layerGroup);
      busMarker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 13px; font-weight: bold;">
          📍 Live Bus Position
        </div>
      `);
    }

    // Auto-fit bounds
    const allCoords: [number, number][] = hasValidCurrentLoc
      ? [...routeCoords, [currentLocation.lat, currentLocation.lng]]
      : routeCoords;

    if (allCoords.length > 0) {
      try {
        const bounds = L.latLngBounds(allCoords);
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
      } catch (e) {
        console.error('Fit bounds error:', e);
      }
    } else {
      map.setView([22.5726, 88.3639], 11);
    }

  }, [stops, currentLocation]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full h-full relative rounded-xl overflow-hidden shadow-md border border-slate-200 bg-slate-100">
      <div ref={containerRef} className="w-full h-full z-0" />
    </div>
  );
}
