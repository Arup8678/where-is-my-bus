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
    // Compute current time in IST (Asia/Kolkata) to avoid timezone drift on Vercel servers
    const now = new Date();
    const istString = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata', hour12: false });
    // istString format: "M/D/YYYY, HH:MM:SS"
    const timePart = istString.split(',')[1].trim();
    const [hourStr, minuteStr] = timePart.split(':');
    const currentMins = parseInt(hourStr, 10) * 60 + parseInt(minuteStr, 10);

    let passedStops: any[] = [];
    let upcomingStops: any[] = [];
    let status = BusStatus.NOT_STARTED;
    let currentLocation: any = undefined;
    let currentSegment: any = undefined;

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

    // Build stops with absolute minutes, handling crossing midnight
    let prevMins = -1;
    let dayOffset = 0;
    const stops = trip.stops.map((ts: any) => {
      let scheduledMins = parseTimeMins(ts.scheduledTime);
      if (prevMins !== -1 && scheduledMins < prevMins) {
        dayOffset += 1440; // next day
      }
      scheduledMins += dayOffset;
      prevMins = scheduledMins;
      return { ...ts, timeMins: scheduledMins + delayMinutes };
    });

    // Adjust current time for trips that span midnight
    let adjustedNow = currentMins;
    if (dayOffset > 0 && currentMins < stops[0].timeMins) {
      adjustedNow += 1440;
    }

    if (adjustedNow < stops[0].timeMins) {
      status = BusStatus.NOT_STARTED;
      upcomingStops = stops;
    } else if (adjustedNow >= stops[stops.length - 1].timeMins) {
      status = BusStatus.COMPLETED;
      passedStops = stops;
      // Set location to final stop when completed
      const last = stops[stops.length - 1];
      const pLat = last.stop?.lat;
      const pLng = last.stop?.lng;
      if (pLat != null && pLng != null) {
        currentLocation = {
          lat: pLat,
          lng: pLng,
          segmentProgress: 1,
          prevStopName: last.stop?.name || 'Last Stop',
          nextStopName: last.stop?.name || 'Last Stop',
          source: LocationSource.SIMULATED
        };
      }
    } else {
      status = delayMinutes > 0 ? BusStatus.DELAYED : BusStatus.RUNNING;
      for (let i = 0; i < stops.length - 1; i++) {
        const p = stops[i];
        const n = stops[i + 1];
        if (adjustedNow >= p.timeMins && adjustedNow < n.timeMins) {
          passedStops = stops.slice(0, i + 1);
          upcomingStops = stops.slice(i + 1);

          const duration = Math.max(1, n.timeMins - p.timeMins);
          const progress = Math.min(1, Math.max(0, (adjustedNow - p.timeMins) / duration));
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
      // Fallback: if no segment matched but we have passed stops, set location to last passed stop
      if (!currentLocation && passedStops.length > 0) {
        const lastPassed = passedStops[passedStops.length - 1];
        const lat = lastPassed.stop?.lat;
        const lng = lastPassed.stop?.lng;
        if (lat != null && lng != null) {
          currentLocation = {
            lat,
            lng,
            segmentProgress: 1,
            prevStopName: lastPassed.stop?.name || 'Last Passed',
            nextStopName: lastPassed.stop?.name || 'Last Passed',
            source: LocationSource.SIMULATED
          };
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
      upcomingStops: upcomingStops.map(s => ({
        ...this.mapStop(s),
        etaMinutes: Math.max(0, s.timeMins - adjustedNow),
        estimatedArrival: formatMinsToHHMM(s.timeMins)
      })),
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
