"use client";

import { useEffect, useState } from "react";
import { getActiveDelays, getAdminTrips, setDelay, clearDelay, AdminTrip, DelayInfo } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, AlertCircle } from "lucide-react";

export default function AdminDelaysPage() {
  const [delays, setDelays] = useState<DelayInfo[]>([]);
  const [trips, setTrips] = useState<AdminTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    tripId: "",
    delayMinutes: "",
    reason: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [delaysData, tripsData] = await Promise.all([
        getActiveDelays(),
        getAdminTrips()
      ]);
      setDelays(delaysData);
      // Only show running trips in the selector
      setTrips(tripsData.filter(t => t.status === 'running' || t.isActive));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load delays data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tripId) {
      toast({ title: "Error", description: "Please select a trip", variant: "destructive" });
      return;
    }
    
    try {
      setSubmitting(true);
      await setDelay({
        tripId: formData.tripId,
        delayMinutes: parseInt(formData.delayMinutes, 10),
        reason: formData.reason || undefined,
      });
      
      toast({ title: "Success", description: "Delay set successfully" });
      setFormData({ tripId: "", delayMinutes: "", reason: "" });
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to set delay",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClearDelay = async (id: string) => {
    if (!confirm("Are you sure you want to clear this delay?")) return;
    try {
      await clearDelay(id);
      toast({ title: "Success", description: "Delay cleared successfully" });
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to clear delay",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Delay Management</h1>
        <p className="text-muted-foreground mt-1">
          Report active delays on running trips
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Report New Delay</CardTitle>
            <CardDescription>
              Mark a running trip as delayed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tripId">Running Trip</Label>
                <Select
                  value={formData.tripId}
                  onValueChange={(value) => setFormData({ ...formData, tripId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a trip" />
                  </SelectTrigger>
                  <SelectContent>
                    {trips.length === 0 ? (
                      <SelectItem value="none" disabled>No active trips found</SelectItem>
                    ) : (
                      trips.map((trip) => (
                        <SelectItem key={trip.id} value={trip.id}>
                          {trip.busName} - {trip.routeName}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="delayMinutes">Delay Time (Minutes)</Label>
                <Input
                  id="delayMinutes"
                  type="number"
                  min="1"
                  required
                  value={formData.delayMinutes}
                  onChange={(e) => setFormData({ ...formData, delayMinutes: e.target.value })}
                  placeholder="e.g. 15"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason (Optional)</Label>
                <Textarea
                  id="reason"
                  rows={3}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="e.g. Heavy traffic at Mor, breakdown"
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Submitting..." : "Report Delay"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" /> Active Delays
          </h2>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trip ID</TableHead>
                  <TableHead>Delay</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Reported At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-10 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : delays.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No active delays at the moment.
                    </TableCell>
                  </TableRow>
                ) : (
                  delays.map((delay) => {
                    const trip = trips.find(t => t.id === delay.tripId);
                    return (
                      <TableRow key={delay.id}>
                        <TableCell className="font-medium">
                          {trip ? `${trip.busName} (${trip.routeName})` : delay.tripId.substring(0, 8)}
                        </TableCell>
                        <TableCell className="text-red-500 font-medium">
                          +{delay.delayMinutes}m
                        </TableCell>
                        <TableCell>
                          {delay.reason || <span className="text-muted-foreground italic">None</span>}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(delay.setAt).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleClearDelay(delay.id)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            Clear
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
