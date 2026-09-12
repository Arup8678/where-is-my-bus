import prisma from '../lib/prisma';
import { LocationEngine } from './locationEngine';

const STOP_ALIASES: Record<string, string[]> = {
  'midnapore': ['medinipur', 'midnapur', 'midnapore'],
  'medinipur': ['medinipur', 'midnapur', 'midnapore'],
  'kolkata': ['kolkata', 'calcutta', 'esplanade', 'karunamoyee', 'santragachi'],
  'howrah': ['howrah', 'howrah station', 'santragachi'],
  'burdwan': ['burdwan', 'bardhaman', 'bardhaman station'],
  'bardhaman': ['burdwan', 'bardhaman'],
  'durgapur': ['durgapur', 'durgapur station'],
  'silda': ['silda', 'shilda', 'sildha'],
  'raipur': ['raipur', 'raypur'],
  'jhargram': ['jhargram', 'jhar gram'],
  'tatanagar': ['tatanagar', 'jamshedpur', 'tata'],
  'contai': ['contai', 'kanthi'],
  'digha': ['digha', 'digha beach'],
  'purulia': ['purulia', 'purulia town'],
};

function matchStop(stopObj: any, query: string): boolean {
  if (!query || !stopObj) return false;
  const q = query.toLowerCase().trim();
  const sName = stopObj.name.toLowerCase();
  const sBn = stopObj.nameBn ? stopObj.nameBn.toLowerCase() : '';

  if (sName.includes(q) || q.includes(sName)) return true;
  if (sBn && (sBn.includes(q) || q.includes(sBn))) return true;

  // Check alias dictionary
  for (const [key, aliases] of Object.entries(STOP_ALIASES)) {
    if (aliases.some(a => a.includes(q) || q.includes(a))) {
      if (aliases.some(a => sName.includes(a))) return true;
    }
  }

  // Check database stop aliases
  if (stopObj.aliases && Array.isArray(stopObj.aliases)) {
    if (stopObj.aliases.some((a: any) => a.alias.toLowerCase().includes(q))) return true;
  }

  return false;
}

export class SearchEngine {
  static async search(from: string, to: string) {
    const qFrom = from.toLowerCase().trim();
    const qTo = to.toLowerCase().trim();

    // Fetch all active trips with stop aliases included
    const trips = await prisma.trip.findMany({
      where: { isActive: true },
      include: {
        stops: { 
          include: { 
            stop: { 
              include: { aliases: true } 
            } 
          }, 
          orderBy: { sequence: 'asc' } 
        },
        route: { include: { bus: true } },
        delays: { where: { expiresAt: null }, take: 1, orderBy: { setAt: 'desc' } }
      }
    });

    const results = [];

    for (const trip of trips) {
      const fromStops = trip.stops.filter(s => matchStop(s.stop, qFrom));
      const toStops = trip.stops.filter(s => matchStop(s.stop, qTo));

      for (const fs of fromStops) {
        for (const ts of toStops) {
          // Departure stop sequence must come BEFORE arrival stop sequence
          if (fs.sequence < ts.sequence) {
            const delayMinutes = trip.delays[0]?.delayMinutes || 0;
            const loc = LocationEngine.getCurrentLocation(trip, delayMinutes);

            results.push({
              tripId: trip.id,
              busName: trip.route.bus.name,
              routeName: trip.route.name,
              contactNo: trip.route.bus.contactNo,
              fromStop: { ...fs, stopName: fs.stop.name, stopNameBn: fs.stop.nameBn },
              toStop: { ...ts, stopName: ts.stop.name, stopNameBn: ts.stop.nameBn },
              status: loc.status,
              locationSource: loc.locationSource,
              estimatedLocation: loc.currentLocation,
              delayMinutes,
              allStops: trip.stops.map(s => ({ ...s, stopName: s.stop.name, stopNameBn: s.stop.nameBn }))
            });
          }
        }
      }
    }

    // Deduplicate results by tripId
    const uniqueResultsMap = new Map();
    for (const item of results) {
      if (!uniqueResultsMap.has(item.tripId)) {
        uniqueResultsMap.set(item.tripId, item);
      }
    }
    const uniqueResults = Array.from(uniqueResultsMap.values());

    // Sort buses by departure time (earliest first)
    return uniqueResults.sort((a, b) => {
      return a.fromStop.scheduledTime.localeCompare(b.fromStop.scheduledTime);
    });
  }
}

