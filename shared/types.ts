// Shared types between frontend and backend
// Keep this file framework-agnostic (pure TypeScript)

// ─── Enums ────────────────────────────────────────────────────────────────────

export enum LocationSource {
  SIMULATED = 'SIMULATED',
  GPS = 'GPS',
}

export enum TripStatus {
  SCHEDULED = 'SCHEDULED',
  RUNNING = 'RUNNING',
  DELAYED = 'DELAYED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum BusStatus {
  RUNNING = 'RUNNING',
  ESTIMATED = 'ESTIMATED',
  DELAYED = 'DELAYED',
  COMPLETED = 'COMPLETED',
  NOT_STARTED = 'NOT_STARTED',
}

// ─── Core Entities ────────────────────────────────────────────────────────────

export interface StopInfo {
  id: string;
  name: string;
  nameBn?: string;
  lat?: number;
  lng?: number;
  aliases?: string[];
}

export interface RouteInfo {
  id: string;
  name: string;
  busId: string;
  busName: string;
  contactNo?: string;
  stops: TripStopInfo[];
  isActive: boolean;
}

export interface TripStopInfo {
  id: string;
  stopId: string;
  stopName: string;
  stopNameBn?: string;
  sequence: number;
  scheduledTime: string; // HH:mm format
  lat?: number;
  lng?: number;
}

// ─── Search ───────────────────────────────────────────────────────────────────

export interface SearchParams {
  from: string;
  to: string;
  date?: string; // YYYY-MM-DD
  time?: string; // HH:mm
}

export interface BusSearchResult {
  tripId: string;
  busName: string;
  routeName: string;
  contactNo?: string;
  fromStop: TripStopInfo;
  toStop: TripStopInfo;
  status: BusStatus;
  locationSource: LocationSource;
  estimatedLocation?: EstimatedLocation;
  nextStop?: TripStopInfo;
  etaMinutes?: number;
  delayMinutes: number;
  allStops: TripStopInfo[];
}

export interface EstimatedLocation {
  lat: number;
  lng: number;
  segmentProgress: number; // 0-1
  prevStopName: string;
  nextStopName: string;
  source: LocationSource;
}

// ─── Tracking ─────────────────────────────────────────────────────────────────

export interface TripLocationResponse {
  tripId: string;
  busName: string;
  routeName: string;
  status: BusStatus;
  locationSource: LocationSource;
  currentLocation?: EstimatedLocation;
  currentSegment?: {
    from: TripStopInfo;
    to: TripStopInfo;
    progress: number;
  };
  passedStops: TripStopInfo[];
  upcomingStops: UpcomingStop[];
  delayMinutes: number;
  lastUpdated: string; // ISO timestamp
}

export interface UpcomingStop extends TripStopInfo {
  etaMinutes: number;
  estimatedArrival: string; // HH:mm
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalBuses: number;
  totalRoutes: number;
  totalStops: number;
  runningTrips: number;
  delayedTrips: number;
  completedTrips: number;
}

export interface AdminBus {
  id: string;
  name: string;
  contactNo?: string;
  isActive: boolean;
  routeCount: number;
  createdAt: string;
}

export interface AdminRoute {
  id: string;
  name: string;
  busId: string;
  busName: string;
  stopCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface AdminStop {
  id: string;
  name: string;
  nameBn?: string;
  lat?: number;
  lng?: number;
  routeCount: number;
  aliases: string[];
}

export interface DelayUpdate {
  tripId: string;
  delayMinutes: number;
  reason?: string;
}

// ─── Excel Import ─────────────────────────────────────────────────────────────

export interface ExcelColumnMapping {
  slNo?: number;
  busName?: number;
  routeName?: number;
  stopSeq?: number;
  stoppage?: number;
  time?: number;
  contactNo?: number;
}

export interface ExcelPreviewRow {
  rowIndex: number;
  slNo?: string | number;
  busName?: string;
  routeName?: string;
  stopSeq?: string | number;
  stoppage?: string;
  time?: string;
  contactNo?: string;
  errors: ExcelRowError[];
  isValid: boolean;
}

export interface ExcelRowError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ExcelImportPreview {
  totalRows: number;
  validRows: number;
  errorRows: number;
  warningRows: number;
  buses: string[];
  routes: string[];
  stops: string[];
  rows: ExcelPreviewRow[];
  detectedColumns: ExcelColumnMapping;
}

export interface ExcelImportResult {
  success: boolean;
  imported: {
    buses: number;
    routes: number;
    stops: number;
    tripStops: number;
  };
  skipped: number;
  errors: string[];
}

// ─── API Response Wrappers ────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  details?: string[];
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}
