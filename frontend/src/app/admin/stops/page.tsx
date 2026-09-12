"use client";

import { useEffect, useState } from "react";
import { getAdminStops, createStop, updateStop, deleteStop, AdminStop } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Edit, Plus, Trash2, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminStopsPage() {
  const [stops, setStops] = useState<AdminStop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStop, setEditingStop] = useState<AdminStop | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    nameBn: "",
    lat: "",
    lng: "",
  });

  const loadStops = async () => {
    try {
      setLoading(true);
      const data = await getAdminStops();
      setStops(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load stops",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStops();
  }, []);

  const handleOpenDialog = (stop?: AdminStop) => {
    if (stop) {
      setEditingStop(stop);
      setFormData({
        name: stop.name,
        nameBn: stop.nameBn || "",
        lat: stop.lat ? stop.lat.toString() : "",
        lng: stop.lng ? stop.lng.toString() : "",
      });
    } else {
      setEditingStop(null);
      setFormData({ name: "", nameBn: "", lat: "", lng: "" });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        nameBn: formData.nameBn || undefined,
        lat: formData.lat ? parseFloat(formData.lat) : undefined,
        lng: formData.lng ? parseFloat(formData.lng) : undefined,
      };

      if (editingStop) {
        await updateStop(editingStop.id, payload);
        toast({ title: "Success", description: "Stop updated successfully" });
      } else {
        await createStop(payload);
        toast({ title: "Success", description: "Stop created successfully" });
      }
      setIsDialogOpen(false);
      loadStops();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save stop",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this stop?")) return;
    try {
      await deleteStop(id);
      toast({ title: "Success", description: "Stop deleted successfully" });
      loadStops();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete stop",
        variant: "destructive",
      });
    }
  };

  const filteredStops = stops.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.nameBn && s.nameBn.includes(searchQuery))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Manage Stops</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" /> Add Stop
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingStop ? "Edit Stop" : "Add New Stop"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Stop Name (English)</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameBn">Stop Name (Bengali)</Label>
                <Input
                  id="nameBn"
                  value={formData.nameBn}
                  onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lat">Latitude</Label>
                  <Input
                    id="lat"
                    type="number"
                    step="any"
                    value={formData.lat}
                    onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lng">Longitude</Label>
                  <Input
                    id="lng"
                    type="number"
                    step="any"
                    value={formData.lng}
                    onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                {editingStop ? "Update Stop" : "Create Stop"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2 max-w-sm">
        <Search className="text-muted-foreground w-5 h-5" />
        <Input
          placeholder="Search stops..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Bengali Name</TableHead>
              <TableHead>Coordinates</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredStops.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No stops found.
                </TableCell>
              </TableRow>
            ) : (
              filteredStops.map((stop) => (
                <TableRow key={stop.id}>
                  <TableCell className="font-medium">{stop.name}</TableCell>
                  <TableCell>{stop.nameBn || "-"}</TableCell>
                  <TableCell>
                    {stop.lat && stop.lng ? (
                      <span className="text-xs text-muted-foreground">
                        {stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}
                      </span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(stop)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(stop.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
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
