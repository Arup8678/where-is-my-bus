"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, Bus, Map, MapPin, Clock, 
  FileSpreadsheet, Activity, AlertTriangle, Settings, LogOut, Menu, X, MessageSquare 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('token');
    if (!token && !pathname.includes('/login')) {
      router.push('/admin/login');
    }
  }, [pathname, router]);

  if (!mounted) return null;
  if (pathname.includes('/login')) return <>{children}</>;

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/admin/login');
  };

  const menuItems = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/buses', icon: Bus, label: 'Buses' },
    { href: '/admin/routes', icon: Map, label: 'Routes' },
    { href: '/admin/stops', icon: MapPin, label: 'Stops' },
    { href: '/admin/timetable', icon: Clock, label: 'Timetable' },
    { href: '/admin/feedback', icon: MessageSquare, label: 'Contributions' },
    { href: '/admin/import', icon: FileSpreadsheet, label: 'Import Excel' },
    { href: '/admin/live', icon: Activity, label: 'Live Trips' },
    { href: '/admin/delays', icon: AlertTriangle, label: 'Delays' },
    { href: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-primary text-slate-300 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static flex flex-col",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center justify-between px-6 bg-slate-900">
          <Link href="/admin" className="text-xl font-bold text-white flex items-center gap-2">
            🚌 Admin Panel
          </Link>
          <button className="lg:hidden" onClick={() => setIsMobileOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2.5 rounded-lg font-medium transition-colors group",
                  pathname === item.href 
                    ? "bg-accent text-white" 
                    : "hover:bg-slate-800 hover:text-white"
                )}
                onClick={() => setIsMobileOpen(false)}
              >
                <item.icon className={cn(
                  "mr-3 h-5 w-5",
                  pathname === item.href ? "text-white" : "text-slate-400 group-hover:text-white"
                )} />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-4 bg-slate-900 border-t border-slate-800">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 lg:px-8 shrink-0">
          <button 
            className="lg:hidden mr-4 text-slate-500 hover:text-slate-700"
            onClick={() => setIsMobileOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">
              {menuItems.find(i => i.href === pathname)?.label || 'Admin'}
            </h2>
            <Link href="/" target="_blank">
              <Button variant="outline" size="sm">View Site</Button>
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
