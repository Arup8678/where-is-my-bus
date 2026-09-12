"use client";

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { BusResultCard } from '@/components/search/BusResultCard';
import { searchBuses, BusSearchResult } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useLanguage();
  
  const fromName = searchParams.get('from') || '';
  const toName = searchParams.get('to') || '';

  const [buses, setBuses] = useState<BusSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchResults = useCallback(async () => {
    if (!fromName || !toName) return;
    setLoading(true);
    setError(null);
    try {
      const data = await searchBuses({ from: fromName, to: toName });
      setBuses(data || []);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('Search failed:', err);
      setError(err.message || 'Failed to fetch results');
      setBuses([]);
    } finally {
      setLoading(false);
    }
  }, [fromName, toName]);

  useEffect(() => {
    fetchResults();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchResults, 60000);
    return () => clearInterval(interval);
  }, [fetchResults]);

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      {/* Header */}
      <div className="bg-primary text-white py-6">
        <div className="container mx-auto px-4">
          <Button 
            variant="ghost" 
            className="text-white hover:bg-white/20 hover:text-white -ml-4 mb-4" 
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> {t('modifySearch') || 'Modify Search'}
          </Button>
          
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                {fromName} <span className="text-slate-400">→</span> {toName}
              </h1>
              <p className="text-slate-300 mt-2">
                {buses.length} {buses.length === 1 ? 'bus' : 'buses'} found on this route
              </p>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
              onClick={fetchResults}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Updated {lastUpdated.toLocaleTimeString()}
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-8 flex-1">
        {loading ? (
          <div className="space-y-4 max-w-4xl mx-auto">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-48 w-full rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Something went wrong</h2>
            <p className="text-slate-500 max-w-md mx-auto mb-6">{error}</p>
            <Button onClick={fetchResults}>Try Again</Button>
          </div>
        ) : buses.length > 0 ? (
          <div className="space-y-6 max-w-4xl mx-auto">
            {buses.map((bus, idx) => (
              <div key={bus?.tripId || `bus-result-${idx}`} className={idx === 0 ? "relative" : ""}>
                {idx === 0 && (
                  <div className="absolute -top-3 left-4 bg-accent text-white px-3 py-1 rounded-full text-xs font-bold z-10 shadow-sm">
                    🚌 {t('nextBus') || 'Next Bus'}
                  </div>
                )}
                {idx === 1 && (
                  <div className="absolute -top-3 left-4 bg-slate-600 text-white px-3 py-1 rounded-full text-xs font-bold z-10 shadow-sm">
                    Following Bus
                  </div>
                )}
                <div className={idx === 0 ? "ring-2 ring-accent rounded-xl" : ""}>
                  <BusResultCard bus={bus} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🚏</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">No buses found</h2>
            <p className="text-slate-500 max-w-md mx-auto">
              We couldn&apos;t find any buses connecting <strong>{fromName}</strong> to <strong>{toName}</strong>. Try modifying your search to other connected stops like Silda to Bankura or Raipur to Howrah.
            </p>
            <Button className="mt-6" onClick={() => router.push('/')}>Go Back Home</Button>
          </div>
        )}
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">🚌</div>
          <p className="text-slate-500">Finding buses...</p>
        </div>
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}
