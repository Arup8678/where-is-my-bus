"use client";

import { useEffect, useState } from "react";
import { getBuses, getAdminRoutes, getAdminTrips, getTripDetails, AdminBus, AdminRoute, AdminTrip } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

export default function AdminTimetablePage() {
  const [buses, setBuses] = useState<AdminBus[]>([]);
  const [routes, setRoutes] = useState<AdminRoute[]>([]);
  const [trips, setTrips] = useState<AdminTrip[]>([]);
  
  const [selectedBusId, setSelectedBusId] = useState("");
  const [selectedRouteId, setSelectedRouteId] = useState("");
  
  const [tripDetails, setTripDetails] = useState<any>(null);
  
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingTimetable, setLoadingTimetable] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoadingInitial(true);
        const [busesData, routesData, tripsData] = await Promise.all([
          getBuses(),
          getAdminRoutes(),
          getAdminTrips()
        ]);
        setBuses(busesData);
        setRoutes(routesData);
        setTrips(tripsData);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load buses and routes",
          variant: "destructive",
        });
      } finally {
        setLoadingInitial(false);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    // Reset route selection if bus changes
    setSelectedRouteId("");
    setTripDetails(null);
  }, [selectedBusId]);

  useEffect(() => {
    const fetchTimetable = async () => {
      if (!selectedBusId || !selectedRouteId) {
        setTripDetails(null);
        return;
      }

      const bus = buses.find(b => b.id === selectedBusId);
      const route = routes.find(r => r.id === selectedRouteId);
      
      if (!bus || !route) return;

      // Find the corresponding trip
      const matchingTrip = trips.find(
        t => t.busName === bus.name && t.routeName === route.name
      );

      if (!matchingTrip) {
        setTripDetails({ noTripFound: true });
        return;
      }

      try {
        setLoadingTimetable(true);
        const details = await getTripDetails(matchingTrip.id);
        setTripDetails(details);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load timetable",
          variant: "destructive",
        });
        setTripDetails(null);
      } finally {
        setLoadingTimetable(false);
      }
    };

    fetchTimetable();
  }, [selectedBusId, selectedRouteId, buses, routes, trips]);

  const filteredRoutes = routes.filter(r => r.busId === selectedBusId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Timetable Viewer</h1>
        <p className="text-muted-foreground mt-1">
          View scheduled stops and times for specific routes
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="bus-select">Select Bus</Label>
              <Select value={selectedBusId} onValueChange={setSelectedBusId} disabled={loadingInitial}>
                <SelectTrigger id="bus-select">
                  <SelectValue placeholder="Choose a bus..." />
                </SelectTrigger>
                <SelectContent>
                  {buses.map(bus => (
                    <SelectItem key={bus.id} value={bus.id}>{bus.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1 space-y-2">
              <Label htmlFor="route-select">Select Route</Label>
              <Select 
                value={selectedRouteId} 
                onValueChange={setSelectedRouteId}
                disabled={!selectedBusId || loadingInitial}
              >
                <SelectTrigger id="route-select">
                  <SelectValue placeholder={selectedBusId ? "Choose a route..." : "Select bus first"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredRoutes.length === 0 ? (
                    <SelectItem value="none" disabled>No routes for this bus</SelectItem>
                  ) : (
                    filteredRoutes.map(route => (
                      <SelectItem key={route.id} value={route.id}>{route.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedBusId && selectedRouteId && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary" /> Timetable
          </h2>
          
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Seq</TableHead>
                  <TableHead>Stop Name</TableHead>
                  <TableHead>Bengali Name</TableHead>
                  <TableHead className="text-right">Scheduled Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingTimetable ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : tripDetails?.noTripFound ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No trip found for this bus and route combination.
                    </TableCell>
                  </TableRow>
                ) : tripDetails?.stops && tripDetails.stops.length > 0 ? (
                  tripDetails.stops.map((stop: any, index: number) => (
                    <TableRow key={stop.id || index}>
                      <TableCell className="font-medium">{stop.sequence || index + 1}</TableCell>
                      <TableCell>{stop.stopName || stop.name}</TableCell>
                      <TableCell>{stop.stopNameBn || stop.nameBn || "-"}</TableCell>
                      <TableCell className="text-right font-medium">
                        {stop.scheduledTime ? (
                          new Date(stop.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        ) : (
                          stop.time || "-"
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No stops available for this route.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
