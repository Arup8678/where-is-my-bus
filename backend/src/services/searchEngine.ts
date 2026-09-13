import prisma from '../lib/prisma';
import { LocationEngine } from './locationEngine';
import { BusStatus } from '../../shared/types';

// Alias dictionary for stop name variations
const STOP_ALIASES: Record<string, string[]> = {
  midnapore: ['medinipur', 'midnapur', 'midnapore'],
  medinipur: ['medinipur', 'midnapur', 'midnapore'],
  kolkata: ['kolkata', 'calcutta', 'esplanade', 'karunamoyee', 'santragachi'],
  howrah: ['howrah', 'howrah station', 'santragachi'],
  burdwan: ['burdwan', 'bardhaman', 'bardhaman station'],
  bardhaman: ['burdwan', 'bardhaman'],
  durgapur: ['durgapur', 'durgapur station'],
  silda: ['silda', 'shilda', 'sildha'],
  raipur: ['raipur', 'raypur'],
  jhargram: ['jhargram', 'jhar gram'],
  tatanagar: ['tatanagar', 'jamshedpur', 'tata'],
  contai: ['contai', 'kanthi'],
  digha: ['digha', 'digha beach'],
  purulia: ['purulia', 'purulia town'],
};

function matchStop(stopObj: any, query: string): boolean {
  if (!query || !stopObj) return false;
  const q = query.toLowerCase().trim();
  const sName = stopObj.name?.toLowerCase() ?? '';
  const sBn = stopObj.nameBn?.toLowerCase() ?? '';

  if (sName.includes(q) || q.includes(sName)) return true;
  if (sBn && (sBn.includes(q) || q.includes(sBn))) return true;

  // Check alias dictionary
  for (const [_, aliases] of Object.entries(STOP_ALIASES)) {
    if (aliases.some(a => a.includes(q) || q.includes(a))) {
      if (aliases.some(a => sName.includes(a))) return true;
    }
  }

  // Check database stop aliases
  if (Array.isArray(stopObj.aliases)) {
    if (stopObj.aliases.some((a: any) => a.alias?.toLowerCase().includes(q))) return true;
  }
  return false;
}

export class SearchEngine {
  static async search(from: string, to: string) {
    const qFrom = from.toLowerCase().trim();
    const qTo = to.toLowerCase().trim();

    // Fetch all active trips with stops and related data
    const trips = await prisma.trip.findMany({
      where: { isActive: true },
      include: {
        stops: {
          include: { stop: { include: { aliases: true } } },
          orderBy: { sequence: 'asc' },
        },
        route: { include: { bus: true } },
        delays: { where: { expiresAt: null }, take: 1, orderBy: { setAt: 'desc' } },
      },
    });

    const results: any[] = [];

    for (const trip of trips) {
      const fromStops = trip.stops.filter((s: any) => matchStop(s.stop, qFrom));
      const toStops = trip.stops.filter((s: any) => matchStop(s.stop, qTo));

      for (const fs of fromStops) {
        for (const ts of toStops) {
          // Ensure the departure stop appears before the arrival stop in the sequence
          if (fs.sequence < ts.sequence) {
            const delayMinutes = trip.delays[0]?.delayMinutes || 0;
            const loc = LocationEngine.getCurrentLocation(trip, delayMinutes);

            // Do not return trips that are already completed
            if (loc.status === BusStatus.COMPLETED) continue;

            // Map NOT_STARTED to ESTIMATED so the UI shows an upcoming bus
            const status = loc.status === BusStatus.NOT_STARTED ? BusStatus.ESTIMATED : loc.status;

            results.push({
              tripId: trip.id,
              busId: trip.route.bus.id,
              busName: trip.route.bus.name,
              routeName: trip.route.name,
              contactNo: trip.route.bus.contactNo,
              fromStop: { ...fs, stopName: fs.stop.name, stopNameBn: fs.stop.nameBn },
              toStop: { ...ts, stopName: ts.stop.name, stopNameBn: ts.stop.nameBn },
              status,
              locationSource: loc.locationSource,
              estimatedLocation: loc.currentLocation,
              delayMinutes,
              allStops: trip.stops.map((s: any) => ({ ...s, stopName: s.stop.name, stopNameBn: s.stop.nameBn })),
            });
          }
        }
      }
    }

    // Deduplicate by bus (busId) + direction (fromStop → toStop)
    // Keep the entry with the highest status priority; if equal, keep the earlier departure time.
    const statusPriority = (status: string) => {
      switch (status) {
        case BusStatus.COMPLETED:
          return 5;
        case BusStatus.DELAYED:
          return 4;
        case BusStatus.RUNNING:
          return 3;
        case BusStatus.ESTIMATED:
          return 2;
        case BusStatus.NOT_STARTED:
          return 1;
        default:
          return 0;
      }
    };
    const dedupMap = new Map<string, any>();
    for (const item of results) {
      const key = `${item.busId || item.busName}-${item.fromStop.stopId || item.fromStop.id}-${item.toStop.stopId || item.toStop.id}`;
      if (!dedupMap.has(key)) {
        dedupMap.set(key, item);
      } else {
        const existing = dedupMap.get(key);
        if (
          statusPriority(item.status) > statusPriority(existing.status) ||
          (statusPriority(item.status) === statusPriority(existing.status) &&
            item.fromStop.scheduledTime < existing.fromStop.scheduledTime)
        ) {
          dedupMap.set(key, item);
        }
      }
    }
    const uniqueResults = Array.from(dedupMap.values());

    // Sort by earliest departure time
    return uniqueResults.sort((a, b) => a.fromStop.scheduledTime.localeCompare(b.fromStop.scheduledTime));
  }
}
