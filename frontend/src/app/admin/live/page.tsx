"use client";

import { useEffect, useState } from "react";
import { getLiveTrips } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { StatusBadge } from "@/components/StatusBadge";
import Link from "next/link";
import { RefreshCw } from "lucide-react";

export default function LiveTripsPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTrips = async () => {
    try {
      const data = await getLiveTrips();
      setTrips(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load live trips",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
    const interval = setInterval(fetchTrips, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Live Trips Monitor</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Monitoring active trips in real-time. Auto-refreshes every 30 seconds.
          </p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchTrips(); }}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bus</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Current Location</TableHead>
              <TableHead>Next Stop</TableHead>
              <TableHead>ETA</TableHead>
              <TableHead>Delay</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && trips.length === 0 ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                </TableRow>
              ))
            ) : trips.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No running trips at the moment.
                </TableCell>
              </TableRow>
            ) : (
              trips.map((trip) => (
                <TableRow key={trip.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">
                    <Link href={`/track/${trip.id}`} target="_blank" className="hover:underline block">
                      {trip.busName}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/track/${trip.id}`} target="_blank" className="block">
                      {trip.routeName}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {trip.currentLocation?.prevStopName || "-"}
                  </TableCell>
                  <TableCell>
                    {trip.nextStop?.name || "-"}
                  </TableCell>
                  <TableCell>
                    {trip.nextStop?.etaMinutes ? `${Math.round(trip.nextStop.etaMinutes)} min` : "-"}
                  </TableCell>
                  <TableCell>
                    {trip.delayMinutes > 0 ? (
                      <span className="text-red-500 font-medium">+{trip.delayMinutes}m</span>
                    ) : (
                      <span className="text-green-500">On Time</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={trip.status} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
