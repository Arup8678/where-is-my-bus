import * as xlsx from 'xlsx';
import prisma from '../lib/prisma';
import {
  ExcelColumnMapping,
  ExcelImportPreview,
  ExcelImportResult,
  ExcelPreviewRow,
  ExcelRowError
} from '../types/shared';

// ─── Column Detection ─────────────────────────────────────────────────────────

const COLUMN_ALIASES: Record<keyof ExcelColumnMapping, string[]> = {
  slNo:      ['sl no', 'sl.no', 'sno', 's.no', 'serial', 'sl'],
  busName:   ['bus name', 'busname', 'bus', 'vehicle name', 'vehicle'],
  routeName: ['route name', 'routename', 'route', 'route no'],
  stopSeq:   ['stop seq', 'stop sequence', 'seq', 'sequence', 'stop no', 'order'],
  stoppage:  ['stoppage', 'stop', 'stop name', 'station', 'station name'],
  time:      ['time', 'scheduled time', 'departure', 'arrival', 'dep time'],
  contactNo: ['bus contact no', 'contact', 'contact no', 'phone', 'mobile', 'contact number'],
};

function detectColumns(headers: string[]): ExcelColumnMapping {
  const mapping: ExcelColumnMapping = {};
  const lowerHeaders = headers.map(h => (h || '').toString().toLowerCase().trim());

  for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
    for (const alias of aliases) {
      const idx = lowerHeaders.findIndex(h => h === alias || h.includes(alias));
      if (idx !== -1) {
        (mapping as any)[field] = idx;
        break;
      }
    }
  }
  return mapping;
}

// ─── Time Validation ──────────────────────────────────────────────────────────

function normalizeTime(raw: unknown): string | null {
  if (!raw) return null;

  // Handle Excel numeric date serial for time (fraction of a day)
  if (typeof raw === 'number') {
    const totalMins = Math.round(raw * 24 * 60);
    const h = Math.floor(totalMins / 60) % 24;
    const m = totalMins % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  const str = raw.toString().trim();

  // HH:mm or H:mm
  const match = str.match(/^(\d{1,2}):(\d{2})(?::\d{2})?(?:\s*[AP]M)?$/i);
  if (match) {
    let h = parseInt(match[1]);
    const m = parseInt(match[2]);
    // Handle AM/PM
    if (str.toUpperCase().includes('PM') && h < 12) h += 12;
    if (str.toUpperCase().includes('AM') && h === 12) h = 0;
    if (h >= 0 && h < 24 && m >= 0 && m < 60) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }
  }

  return null;
}

// ─── Main Parse Function ──────────────────────────────────────────────────────

export function parseExcelPreview(buffer: Buffer): ExcelImportPreview {
  const wb = xlsx.read(buffer, { type: 'buffer', cellDates: false });
  const ws = wb.Sheets[wb.SheetNames[0]];

  // Get raw data as array-of-arrays (preserves column positions)
  const rawData: unknown[][] = xlsx.utils.sheet_to_json(ws, { header: 1, defval: '' });

  if (rawData.length < 2) {
    return {
      totalRows: 0, validRows: 0, errorRows: 0, warningRows: 0,
      buses: [], routes: [], stops: [], rows: [],
      detectedColumns: {}
    };
  }

  const headers = rawData[0].map(h => (h || '').toString().trim());
  const detectedColumns = detectColumns(headers);
  const dataRows = rawData.slice(1);

  let lastBusName = '';
  let lastRouteName = '';
  let lastContactNo = '';

  const rows: ExcelPreviewRow[] = [];
  const busSet = new Set<string>();
  const routeSet = new Set<string>();
  const stopSet = new Set<string>();
  const routeStopMap = new Map<string, Set<string>>();

  dataRows.forEach((row, idx) => {
    const errors: ExcelRowError[] = [];
    const get = (colIdx?: number) =>
      colIdx !== undefined ? (row[colIdx] || '').toString().trim() : '';

    // Fill-forward Bus Name and Route Name
    const rawBus = get(detectedColumns.busName) || lastBusName;
    const rawRoute = get(detectedColumns.routeName) || lastRouteName;
    const rawContact = get(detectedColumns.contactNo) || lastContactNo;

    if (rawBus) { lastBusName = rawBus; }
    if (rawRoute) { lastRouteName = rawRoute; }
    if (rawContact) { lastContactNo = rawContact; }

    const busName = rawBus;
    const routeName = rawRoute;
    const contactNo = rawContact;
    const stoppage = get(detectedColumns.stoppage);
    const rawSeq = get(detectedColumns.stopSeq);
    const stopSeq = rawSeq ? parseInt(rawSeq) : NaN;
    const rawTime = detectedColumns.time !== undefined ? row[detectedColumns.time] : undefined;
    const time = normalizeTime(rawTime);

    // Skip completely empty rows
    const allEmpty = !busName && !routeName && !stoppage && !rawSeq && !rawTime;
    if (allEmpty) return;

    // Validate
    if (!busName) errors.push({ field: 'busName', message: 'Bus Name is missing', severity: 'error' });
    if (!routeName) errors.push({ field: 'routeName', message: 'Route Name is missing', severity: 'error' });
    if (!stoppage) errors.push({ field: 'stoppage', message: 'Stop Name is missing', severity: 'error' });
    if (isNaN(stopSeq)) errors.push({ field: 'stopSeq', message: 'Invalid or missing stop sequence', severity: 'error' });
    if (!time) errors.push({ field: 'time', message: `Invalid time format: "${rawTime}"`, severity: 'error' });

    // Duplicate stop check within same route
    if (busName && routeName && stoppage) {
      const key = `${busName}|||${routeName}`;
      if (!routeStopMap.has(key)) routeStopMap.set(key, new Set());
      if (routeStopMap.get(key)!.has(stoppage)) {
        errors.push({ field: 'stoppage', message: `Duplicate stop "${stoppage}" in this route`, severity: 'warning' });
      } else {
        routeStopMap.get(key)!.add(stoppage);
      }
    }

    if (busName) busSet.add(busName);
    if (routeName && busName) routeSet.add(`${busName} | ${routeName}`);
    if (stoppage) stopSet.add(stoppage);

    const hasErrors = errors.some(e => e.severity === 'error');

    rows.push({
      rowIndex: idx + 2, // +2 for header row + 1-based index
      slNo: get(detectedColumns.slNo),
      busName,
      routeName,
      stopSeq,
      stoppage,
      time: time || get(detectedColumns.time),
      contactNo,
      errors,
      isValid: !hasErrors
    });
  });

  return {
    totalRows: rows.length,
    validRows: rows.filter(r => r.isValid).length,
    errorRows: rows.filter(r => !r.isValid).length,
    warningRows: rows.filter(r => r.isValid && r.errors.length > 0).length,
    buses: [...busSet],
    routes: [...routeSet],
    stops: [...stopSet],
    rows,
    detectedColumns
  };
}

// ─── Import to Database ───────────────────────────────────────────────────────

export async function importExcelRows(rows: ExcelPreviewRow[]): Promise<ExcelImportResult> {
  const validRows = rows.filter(r => r.isValid);
  const errors: string[] = [];

  let busCount = 0;
  let routeCount = 0;
  let stopCount = 0;
  let tripStopCount = 0;

  // Group by bus + route
  type GroupKey = string;
  const groups = new Map<GroupKey, ExcelPreviewRow[]>();

  for (const row of validRows) {
    const key = `${row.busName}|||${row.routeName}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(row);
  }

  for (const [key, groupRows] of groups) {
    const [busName, routeName] = key.split('|||');
    const contactNo = groupRows[0].contactNo || undefined;

    // Sort by sequence
    groupRows.sort((a, b) => (a.stopSeq as number) - (b.stopSeq as number));

    try {
      await prisma.$transaction(async (tx) => {
        // Upsert Bus
        const bus = await tx.bus.upsert({
          where: { name: busName },
          create: { name: busName, contactNo },
          update: { contactNo: contactNo || undefined }
        });
        busCount++;

        // Upsert Route
        let route = await tx.route.findFirst({ where: { name: routeName, busId: bus.id } });
        if (!route) {
          route = await tx.route.create({ data: { name: routeName, busId: bus.id } });
          routeCount++;
        }

        // Create Trip for this route
        const trip = await tx.trip.create({ data: { routeId: route.id } });

        // Upsert stops and create TripStops
        for (const row of groupRows) {
          const stop = await tx.stop.upsert({
            where: { name: row.stoppage! },
            create: { name: row.stoppage! },
            update: {}
          });
          stopCount++;

          await tx.tripStop.create({
            data: {
              tripId: trip.id,
              stopId: stop.id,
              sequence: row.stopSeq as number,
              scheduledTime: row.time!
            }
          });
          tripStopCount++;
        }
      });
    } catch (err: any) {
      errors.push(`Failed to import "${busName} - ${routeName}": ${err.message}`);
    }
  }

  return {
    success: errors.length === 0,
    imported: { buses: busCount, routes: routeCount, stops: stopCount, tripStops: tripStopCount },
    skipped: rows.length - validRows.length,
    errors
  };
}
