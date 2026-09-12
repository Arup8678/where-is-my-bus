"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bus, Map, MapPin, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { getDashboardStats, DashboardStats } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err: any) {
        console.error('Dashboard fetch failed:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Refresh every 60 seconds
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const statCards = [
    { title: 'Total Buses', value: stats?.totalBuses, icon: Bus, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Total Routes', value: stats?.totalRoutes, icon: Map, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { title: 'Total Stops', value: stats?.totalStops, icon: MapPin, color: 'text-purple-600', bg: 'bg-purple-100' },
    { title: 'Running Trips', value: stats?.runningTrips, icon: Activity, color: 'text-green-600', bg: 'bg-green-100' },
    { title: 'Delayed Trips', value: stats?.delayedTrips, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' },
    { title: 'Completed', value: stats?.completedTrips, icon: CheckCircle2, color: 'text-slate-600', bg: 'bg-slate-100' },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500">Failed to load dashboard: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Dashboard</h1>
        <p className="text-slate-500">Overview of your bus tracking platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                {stat.title}
              </CardTitle>
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${stat.bg} ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stat.value ?? 0}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-0 shadow-sm mt-8">
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-500">Platform</span>
              <span className="font-medium">Where Is My Bus</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-500">Tracking Mode</span>
              <span className="font-medium text-amber-600">Simulated (Timetable)</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-500">Region</span>
              <span className="font-medium">West Bengal</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-500">Total Trips</span>
              <span className="font-medium">{stats?.totalTrips ?? 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
