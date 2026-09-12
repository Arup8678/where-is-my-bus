import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token on admin routes
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Unwrap { success, data } envelope
function unwrap<T>(response: { data: { success: boolean; data: T; error?: string } }): T {
  if (!response.data.success) {
    throw new Error(response.data.error || 'Request failed');
  }
  return response.data.data;
}

// ─── Types matching backend responses ─────────────────────────────────────────

export interface StopInfo {
  id: string;
  name: string;
  nameBn: string | null;
  lat: number | null;
  lng: number | null;
  aliases?: { id: string; alias: string }[];
}

export interface TripStopInfo {
  id: string;
  stopId: string;
  stopName: string;
  stopNameBn?: string | null;
  sequence: number;
  scheduledTime: string;
  lat?: number | null;
  lng?: number | null;
}

export interface BusSearchResult {
  tripId: string;
  busName: string;
  routeName: string;
  contactNo: string | null;
  fromStop: TripStopInfo;
  toStop: TripStopInfo;
  status: string;
  locationSource: string;
  estimatedLocation: {
    lat: number;
    lng: number;
    segmentProgress: number;
    prevStopName: string;
    nextStopName: string;
    source: string;
  } | null;
  delayMinutes: number;
  allStops: TripStopInfo[];
}

export interface TripLocationResponse {
  tripId: string;
  busName: string;
  routeName: string;
  status: string;
  locationSource: string;
  currentLocation: {
    lat: number;
    lng: number;
    segmentProgress: number;
    prevStopName: string;
    nextStopName: string;
    source: string;
  } | null;
  currentSegment: {
    from: TripStopInfo;
    to: TripStopInfo;
    progress: number;
  } | null;
  passedStops: TripStopInfo[];
  upcomingStops: (TripStopInfo & { etaMinutes: number; estimatedArrival: string })[];
  delayMinutes: number;
  lastUpdated: string;
}

export interface DashboardStats {
  totalBuses: number;
  totalRoutes: number;
  totalStops: number;
  totalTrips: number;
  runningTrips: number;
  delayedTrips: number;
  completedTrips: number;
}

export interface AdminBus {
  id: string;
  name: string;
  contactNo: string | null;
  isActive: boolean;
  routeCount: number;
  createdAt: string;
}

export interface AdminRoute {
  id: string;
  name: string;
  busId: string;
  busName?: string;
  stopCount?: number;
  isActive: boolean;
  createdAt?: string;
}

export interface AdminStop {
  id: string;
  name: string;
  nameBn: string | null;
  lat: number | null;
  lng: number | null;
  aliases?: { id: string; alias: string }[];
}

export interface AdminTrip {
  id: string;
  busName: string;
  routeName: string;
  isActive: boolean;
  stopCount: number;
  status: string;
  delayMinutes: number;
  currentLocation: any;
  nextStop: any;
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
  detectedColumns: Record<string, number | undefined>;
}

export interface ExcelPreviewRow {
  rowIndex: number;
  slNo?: string | number;
  busName?: string;
  routeName?: string;
  stopSeq?: number;
  stoppage?: string;
  time?: string;
  contactNo?: string;
  errors: { field: string; message: string; severity: 'error' | 'warning' }[];
  isValid: boolean;
}

export interface ExcelImportResult {
  success: boolean;
  imported: { buses: number; routes: number; stops: number; tripStops: number };
  skipped: number;
  errors: string[];
}

export interface LoginResponse {
  token: string;
  user: { id: string; email: string; name: string };
}

export interface DelayInfo {
  id: string;
  tripId: string;
  delayMinutes: number;
  reason: string | null;
  setAt: string;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function searchBuses(params: {
  from: string;
  to: string;
  date?: string;
  time?: string;
}): Promise<BusSearchResult[]> {
  const resp = await api.get('/api/search', { params });
  return unwrap(resp);
}

export async function getStops(query?: string): Promise<StopInfo[]> {
  const resp = await api.get('/api/stops', { params: query ? { q: query } : {} });
  return unwrap(resp);
}

export async function getRoutes(): Promise<any[]> {
  const resp = await api.get('/api/routes');
  return unwrap(resp);
}

export async function getTripDetails(tripId: string): Promise<any> {
  const resp = await api.get(`/api/trips/${tripId}`);
  return unwrap(resp);
}

export async function getTripLocation(tripId: string): Promise<TripLocationResponse> {
  const resp = await api.get(`/api/trips/${tripId}/location`);
  return unwrap(resp);
}

// ─── Admin API ────────────────────────────────────────────────────────────────

export async function adminLogin(email: string, password: string): Promise<LoginResponse> {
  const resp = await api.post('/api/admin/auth/login', { email, password });
  return unwrap(resp);
}

export async function getAdminMe(): Promise<any> {
  const resp = await api.get('/api/admin/auth/me');
  return unwrap(resp);
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const resp = await api.get('/api/admin/dashboard');
  return unwrap(resp);
}

// Buses
export async function getBuses(): Promise<AdminBus[]> {
  const resp = await api.get('/api/admin/buses');
  return unwrap(resp);
}

export async function createBus(data: { name: string; contactNo?: string }): Promise<AdminBus> {
  const resp = await api.post('/api/admin/buses', data);
  return unwrap(resp);
}

export async function updateBus(id: string, data: { name?: string; contactNo?: string; isActive?: boolean }): Promise<AdminBus> {
  const resp = await api.put(`/api/admin/buses/${id}`, data);
  return unwrap(resp);
}

export async function deleteBus(id: string): Promise<void> {
  await api.delete(`/api/admin/buses/${id}`);
}

export async function toggleBus(id: string): Promise<AdminBus> {
  const resp = await api.patch(`/api/admin/buses/${id}/toggle`);
  return unwrap(resp);
}

// Routes
export async function getAdminRoutes(): Promise<AdminRoute[]> {
  const resp = await api.get('/api/admin/routes');
  return unwrap(resp);
}

export async function createRoute(data: { name: string; busId: string }): Promise<AdminRoute> {
  const resp = await api.post('/api/admin/routes', data);
  return unwrap(resp);
}

export async function updateRoute(id: string, data: any): Promise<AdminRoute> {
  const resp = await api.put(`/api/admin/routes/${id}`, data);
  return unwrap(resp);
}

export async function deleteRoute(id: string): Promise<void> {
  await api.delete(`/api/admin/routes/${id}`);
}

// Stops
export async function getAdminStops(): Promise<AdminStop[]> {
  const resp = await api.get('/api/admin/stops');
  return unwrap(resp);
}

export async function createStop(data: { name: string; nameBn?: string; lat?: number; lng?: number }): Promise<AdminStop> {
  const resp = await api.post('/api/admin/stops', data);
  return unwrap(resp);
}

export async function updateStop(id: string, data: any): Promise<AdminStop> {
  const resp = await api.put(`/api/admin/stops/${id}`, data);
  return unwrap(resp);
}

export async function deleteStop(id: string): Promise<void> {
  await api.delete(`/api/admin/stops/${id}`);
}

// Trips
export async function getAdminTrips(): Promise<AdminTrip[]> {
  const resp = await api.get('/api/admin/trips');
  return unwrap(resp);
}

export async function getLiveTrips(): Promise<any[]> {
  const resp = await api.get('/api/admin/trips/live');
  return unwrap(resp);
}

// Delays
export async function getActiveDelays(): Promise<DelayInfo[]> {
  const resp = await api.get('/api/admin/delays');
  return unwrap(resp);
}

export async function setDelay(data: { tripId: string; delayMinutes: number; reason?: string }): Promise<any> {
  const resp = await api.post('/api/admin/delays', data);
  return unwrap(resp);
}

export async function clearDelay(id: string): Promise<void> {
  await api.delete(`/api/admin/delays/${id}`);
}

// Excel Import
export async function previewExcelImport(file: File): Promise<ExcelImportPreview> {
  const formData = new FormData();
  formData.append('file', file);
  const resp = await api.post('/api/admin/import/preview', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return unwrap(resp);
}

export async function confirmExcelImport(rows: ExcelPreviewRow[]): Promise<ExcelImportResult> {
  const resp = await api.post('/api/admin/import/confirm', { rows });
  return unwrap(resp);
}

// Feedback & Contributions
export interface FeedbackItem {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export async function submitFeedback(data: { name?: string; email?: string; phone?: string; message: string }): Promise<FeedbackItem> {
  const resp = await api.post('/api/feedback', data);
  return unwrap(resp);
}

export async function getAdminFeedback(): Promise<FeedbackItem[]> {
  const resp = await api.get('/api/feedback');
  return unwrap(resp);
}

export async function markFeedbackRead(id: string): Promise<FeedbackItem> {
  const resp = await api.patch(`/api/feedback/${id}/read`);
  return unwrap(resp);
}

export async function deleteFeedback(id: string): Promise<void> {
  await api.delete(`/api/feedback/${id}`);
}

