import { BusStatus, LocationSource, TripLocationResponse } from '../types/shared';

function parseTimeMins(tStr: string): number {
  if (!tStr) return 0;
  try {
    const clean = tStr.trim().toUpperCase();
    const isPM = clean.includes('PM');
    const isAM = clean.includes('AM');
    const timeOnly = clean.replace(/(AM|PM)/g, '').trim();
    const parts = timeOnly.split(':').map(Number);
    let hours = isNaN(parts[0]) ? 0 : parts[0];
    const mins = isNaN(parts[1]) ? 0 : parts[1];
    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;
    return hours * 60 + mins;
  } catch {
    return 0;
  }
}

function formatMinsToHHMM(mins: number): string {
  const normalized = Math.max(0, mins) % (24 * 60);
  const h = Math.floor(normalized / 60);
  const m = Math.floor(normalized % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export class LocationEngine {
  static getCurrentLocation(trip: any, delayMinutes: number = 0): TripLocationResponse {
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    let passedStops: any[] = [];
    let upcomingStops: any[] = [];
    let status = BusStatus.NOT_STARTED;

    if (!trip || !trip.stops || trip.stops.length === 0) {
      return {
        tripId: trip?.id || '',
        busName: trip?.route?.bus?.name || 'Unknown Bus',
        routeName: trip?.route?.name || 'Unknown Route',
        status: BusStatus.NOT_STARTED,
        locationSource: LocationSource.SIMULATED,
        passedStops: [],
        upcomingStops: [],
        delayMinutes,
        lastUpdated: new Date().toISOString()
      };
    }

    let prevMins = -1;
    let dayOffset = 0;
    const stops = trip.stops.map((ts: any) => {
      let scheduledMins = parseTimeMins(ts.scheduledTime);
      if (prevMins !== -1 && scheduledMins < prevMins - 180) {
        dayOffset += 1440; // Trip crosses midnight
      }
      scheduledMins += dayOffset;
      prevMins = scheduledMins;

      return { 
        ...ts, 
        timeMins: scheduledMins + delayMinutes 
      };
    });

    let currentSegment: any = undefined;
    let currentLocation: any = undefined;

    if (currentMins < stops[0].timeMins) {
      status = BusStatus.NOT_STARTED;
      upcomingStops = stops;
    } else if (currentMins >= stops[stops.length - 1].timeMins) {
      status = BusStatus.COMPLETED;
      passedStops = stops;
    } else {
      status = delayMinutes > 0 ? BusStatus.DELAYED : BusStatus.RUNNING;
      for (let i = 0; i < stops.length - 1; i++) {
        const p = stops[i];
        const n = stops[i + 1];
        if (currentMins >= p.timeMins && currentMins < n.timeMins) {
          passedStops = stops.slice(0, i + 1);
          upcomingStops = stops.slice(i + 1);

          const duration = Math.max(1, n.timeMins - p.timeMins);
          const progress = Math.min(1, Math.max(0, (currentMins - p.timeMins) / duration));
          currentSegment = { from: p, to: n, progress };

          const pLat = p.stop?.lat;
          const pLng = p.stop?.lng;
          const nLat = n.stop?.lat;
          const nLng = n.stop?.lng;

          if (pLat != null && pLng != null && nLat != null && nLng != null) {
            currentLocation = {
              lat: pLat + (nLat - pLat) * progress,
              lng: pLng + (nLng - pLng) * progress,
              segmentProgress: progress,
              prevStopName: p.stop?.name || 'Previous Stop',
              nextStopName: n.stop?.name || 'Next Stop',
              source: LocationSource.SIMULATED
            };
          }
          break;
        }
      }
    }

    return {
      tripId: trip.id,
      busName: trip.route?.bus?.name || 'Bus',
      routeName: trip.route?.name || 'Route',
      status: status as any,
      locationSource: LocationSource.SIMULATED,
      currentLocation,
      currentSegment,
      passedStops: passedStops.map(s => this.mapStop(s)),
      upcomingStops: upcomingStops.map(s => {
        const t = s.timeMins;
        return {
          ...this.mapStop(s),
          etaMinutes: Math.max(0, t - currentMins),
          estimatedArrival: formatMinsToHHMM(t)
        };
      }),
      delayMinutes,
      lastUpdated: new Date().toISOString()
    };
  }

  private static mapStop(ts: any) {
    return {
      id: ts.id || `stop-${ts.sequence}`,
      stopId: ts.stopId || '',
      stopName: ts.stop?.name || 'Stop',
      stopNameBn: ts.stop?.nameBn || undefined,
      sequence: ts.sequence,
      scheduledTime: ts.scheduledTime || '00:00',
      lat: ts.stop?.lat ?? undefined,
      lng: ts.stop?.lng ?? undefined
    };
  }
}
