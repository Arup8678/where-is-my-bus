"use client";

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Search, Edit, Trash2, Power, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getBuses, createBus, updateBus, deleteBus, toggleBus, AdminBus } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminBuses() {
  const [buses, setBuses] = useState<AdminBus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editBus, setEditBus] = useState<AdminBus | null>(null);
  const [formName, setFormName] = useState('');
  const [formContact, setFormContact] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchBuses = useCallback(async () => {
    try {
      const data = await getBuses();
      setBuses(data);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchBuses(); }, [fetchBuses]);

  const filteredBuses = buses.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.contactNo || '').includes(searchQuery)
  );

  const openCreate = () => {
    setEditBus(null);
    setFormName('');
    setFormContact('');
    setDialogOpen(true);
  };

  const openEdit = (bus: AdminBus) => {
    setEditBus(bus);
    setFormName(bus.name);
    setFormContact(bus.contactNo || '');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) return;
    setSaving(true);
    try {
      if (editBus) {
        await updateBus(editBus.id, { name: formName.trim(), contactNo: formContact.trim() || undefined });
        toast({ title: 'Bus updated' });
      } else {
        await createBus({ name: formName.trim(), contactNo: formContact.trim() || undefined });
        toast({ title: 'Bus created' });
      }
      setDialogOpen(false);
      fetchBuses();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete bus "${name}"? This will also delete all its routes and trips.`)) return;
    try {
      await deleteBus(id);
      toast({ title: 'Bus deleted' });
      fetchBuses();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await toggleBus(id);
      fetchBuses();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Buses</h1>
        <p className="text-slate-500">Manage all buses in the system</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search buses..." 
            className="pl-9" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="icon" onClick={fetchBuses}><RefreshCw className="h-4 w-4" /></Button>
          <Button className="flex-1 sm:flex-none bg-accent hover:bg-accent/90" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" /> Add Bus
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Routes</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBuses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-slate-400 py-8">
                  {searchQuery ? 'No buses match your search' : 'No buses yet. Click "Add Bus" to create one.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredBuses.map((bus) => (
                <TableRow key={bus.id}>
                  <TableCell className="font-medium">{bus.name}</TableCell>
                  <TableCell className="text-slate-500">{bus.contactNo || '—'}</TableCell>
                  <TableCell>{bus.routeCount}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={bus.isActive ? 'default' : 'secondary'} 
                      className={bus.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-slate-100 text-slate-500'}
                    >
                      {bus.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleToggle(bus.id)} title={bus.isActive ? 'Deactivate' : 'Activate'}>
                      <Power className={`h-4 w-4 ${bus.isActive ? 'text-green-600' : 'text-slate-400'}`} />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 text-blue-600" onClick={() => openEdit(bus)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 text-red-600" onClick={() => handleDelete(bus.id, bus.name)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editBus ? 'Edit Bus' : 'Add New Bus'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="busName">Bus Name *</Label>
              <Input id="busName" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. MAA SARADA" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="busContact">Contact Number</Label>
              <Input id="busContact" value={formContact} onChange={(e) => setFormContact(e.target.value)} placeholder="e.g. 9876543210" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !formName.trim()} className="bg-accent hover:bg-accent/90">
              {saving ? 'Saving...' : editBus ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
