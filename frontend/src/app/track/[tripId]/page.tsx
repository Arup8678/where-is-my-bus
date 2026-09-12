"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { TrackingMap } from '@/components/map/TrackingMap';
import { StopTimeline, TimelineStop } from '@/components/timeline/StopTimeline';
import { StatusBadge } from '@/components/StatusBadge';
import { getTripLocation, TripLocationResponse } from '@/lib/api';
import { Info, RefreshCw, ArrowLeft } from 'lucide-react';
import { formatTimeAMPM } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function TrackPage() {

  const params = useParams();
  const rawTripId = params?.tripId;
  const tripId = Array.isArray(rawTripId) ? rawTripId[0] : (typeof rawTripId === 'string' ? rawTripId : '');
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tripLocation, setTripLocation] = useState<TripLocationResponse | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchTracking = useCallback(async () => {
    if (!tripId) return;
    try {
      const data = await getTripLocation(tripId);
      setTripLocation(data);
      setError(null);
      setLastUpdated(new Date());
    } catch (e: any) {
      console.error('Failed to fetch tracking data:', e);
      setError(e.message || 'Failed to load live tracking data for this trip.');
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchTracking();
    const interval = setInterval(fetchTracking, 30000);
    return () => clearInterval(interval);
  }, [fetchTracking]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Loading live bus tracking data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !tripLocation) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Trip Not Found</h2>
            <p className="text-slate-500 mb-6">{error || 'Could not load tracking data for this trip.'}</p>
            <Button onClick={() => router.push('/')} className="bg-blue-600 hover:bg-blue-500">Go Back Home</Button>
          </div>
        </div>
      </div>
    );
  }

  const passedStops = Array.isArray(tripLocation.passedStops) ? tripLocation.passedStops : [];
  const upcomingStops = Array.isArray(tripLocation.upcomingStops) ? tripLocation.upcomingStops : [];

  // Build timeline stops safely
  const allTimelineStops: (TimelineStop & { lat: number; lng: number })[] = [];

  for (const stop of passedStops) {
    if (!stop) continue;
    allTimelineStops.push({
      id: stop.id || `passed-${stop.sequence || Math.random()}`,
      name: stop.stopName || 'Stop',
      time: formatTimeAMPM(stop.scheduledTime) || '00:00 AM',
      status: 'passed',
      lat: typeof stop.lat === 'number' ? stop.lat : 0,
      lng: typeof stop.lng === 'number' ? stop.lng : 0
    });
  }

  for (let i = 0; i < upcomingStops.length; i++) {
    const stop = upcomingStops[i];
    if (!stop) continue;
    const isNext = i === 0;
    const isLast = i === upcomingStops.length - 1;
    const sched = formatTimeAMPM(stop.scheduledTime) || '00:00 AM';
    const eta = formatTimeAMPM(stop.estimatedArrival || stop.scheduledTime) || sched;

    allTimelineStops.push({
      id: stop.id || `upcoming-${stop.sequence || i}`,
      name: stop.stopName || 'Stop',
      time: `${sched}${eta !== sched ? ` (ETA: ${eta})` : ''}`,
      status: isLast ? 'destination' : isNext ? 'current' : 'upcoming',
      lat: typeof stop.lat === 'number' ? stop.lat : 0,
      lng: typeof stop.lng === 'number' ? stop.lng : 0
    });
  }

  const mapStops = allTimelineStops.filter(
    s => typeof s.lat === 'number' && typeof s.lng === 'number' && !isNaN(s.lat) && !isNaN(s.lng) && (s.lat !== 0 || s.lng !== 0)
  );

  const currentLocation = (tripLocation.currentLocation && 
    typeof tripLocation.currentLocation.lat === 'number' && 
    typeof tripLocation.currentLocation.lng === 'number' &&
    !isNaN(tripLocation.currentLocation.lat) &&
    !isNaN(tripLocation.currentLocation.lng))
    ? { lat: tripLocation.currentLocation.lat, lng: tripLocation.currentLocation.lng }
    : undefined;

  const statusMap: Record<string, string> = {
    'RUNNING': 'RUNNING',
    'DELAYED': 'DELAYED',
    'COMPLETED': 'COMPLETED',
    'SCHEDULED': 'ESTIMATED',
    'NOT_STARTED': 'ESTIMATED',
    'ESTIMATED': 'ESTIMATED'
  };
  const displayStatus = statusMap[tripLocation.status] || 'ESTIMATED';
  const totalStopsCount = passedStops.length + upcomingStops.length;

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      {/* Header */}
      <div className="bg-white border-b border-slate-200 py-4 shadow-sm z-10 relative">
        <div className="container mx-auto px-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-2 -ml-2 text-slate-500 hover:text-slate-900"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                🚌
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-900">{tripLocation.busName || 'Bus'}</h1>
                <p className="text-sm text-slate-500">{tripLocation.routeName || 'Route'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={displayStatus as any} />
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchTracking}
                className="text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                {lastUpdated.toLocaleTimeString()}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Estimated location notice */}
      {tripLocation.locationSource === 'SIMULATED' && displayStatus !== 'COMPLETED' && (
        <div className="bg-amber-50 border-b border-amber-200 p-3 text-amber-800 text-sm flex items-center justify-center gap-2">
          <Info className="h-4 w-4 shrink-0" />
          <span>🟡 Estimated Location (Timetable-based) — Not Live GPS</span>
        </div>
      )}

      {displayStatus === 'COMPLETED' && (
        <div className="bg-slate-100 border-b border-slate-300 p-3 text-slate-600 text-sm flex items-center justify-center gap-2 font-medium">
          <Info className="h-4 w-4 shrink-0" />
          <span>This trip has completed for today.</span>
        </div>
      )}

      {(tripLocation.delayMinutes || 0) > 0 && (
        <div className="bg-red-50 border-b border-red-200 p-3 text-red-800 text-sm flex items-center justify-center gap-2 font-medium">
          ⚠️ This bus is delayed by approximately {tripLocation.delayMinutes} minutes
        </div>
      )}

      {/* Map + Timeline */}
      <div className="container mx-auto px-4 py-6 flex-1 flex flex-col lg:flex-row gap-6">
        {/* Map Section */}
        <div className="w-full lg:w-2/3 h-[50vh] lg:h-[70vh] rounded-xl overflow-hidden shadow-lg order-1">
          <TrackingMap stops={mapStops} currentLocation={currentLocation} />
        </div>
        
        {/* Timeline Section */}
        <div className="w-full lg:w-1/3 bg-white rounded-xl shadow-lg border border-slate-100 p-6 order-2 overflow-y-auto max-h-[70vh]">
          <h3 className="font-bold text-lg mb-2 sticky top-0 bg-white z-10 pb-2 border-b flex items-center justify-between">
            <span>Route Stops</span>
            <span className="text-sm font-normal text-slate-400">
              {passedStops.length}/{totalStopsCount} stops
            </span>
          </h3>

          {/* Current location summary */}
          {currentLocation && tripLocation.currentLocation && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 text-sm">
              <p className="text-blue-700 font-medium">
                📍 Between {tripLocation.currentLocation.prevStopName} and {tripLocation.currentLocation.nextStopName}
              </p>
              <p className="text-blue-500 text-xs mt-1">
                Segment progress: {Math.round((tripLocation.currentLocation.segmentProgress || 0) * 100)}%
              </p>
            </div>
          )}

          <StopTimeline stops={allTimelineStops} />
        </div>
      </div>
    </main>
  );
}
