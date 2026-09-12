"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n';
import { StatusBadge } from '../StatusBadge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, MapPin, Navigation, Phone } from 'lucide-react';
import { BusSearchResult } from '@/lib/api';
import { formatTimeAMPM } from '@/lib/utils';

interface BusResultCardProps {
  bus: BusSearchResult;
}

export function BusResultCard({ bus }: BusResultCardProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  const statusLabel = bus.status === 'RUNNING' ? 'RUNNING'
    : bus.status === 'DELAYED' ? 'DELAYED'
    : bus.status === 'COMPLETED' ? 'COMPLETED'
    : 'ESTIMATED';

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="p-4 sm:p-5">
        {/* Header: Bus name + Status */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{bus.busName}</h3>
            <p className="text-sm text-slate-500">{bus.routeName}</p>
            {bus.contactNo && (
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <Phone className="h-3 w-3" /> {bus.contactNo}
              </p>
            )}
          </div>
          <StatusBadge status={statusLabel as any} />
        </div>

        {/* From → To with times */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex-1">
            <p className="text-sm text-slate-500">{t('from')}</p>
            <p className="font-semibold text-slate-900">{bus?.fromStop?.stopName || 'Origin'}</p>
            <p className="font-bold text-lg text-accent">{formatTimeAMPM(bus?.fromStop?.scheduledTime)}</p>
          </div>
          
          <div className="px-4 text-slate-300 flex-1 text-center">
            <div className="h-[2px] bg-slate-200 w-full relative">
              <div className="absolute right-0 -top-1.5 w-3 h-3 border-t-2 border-r-2 border-slate-300 transform rotate-45"></div>
            </div>
          </div>
          
          <div className="flex-1 text-right">
            <p className="text-sm text-slate-500">{t('to')}</p>
            <p className="font-semibold text-slate-900">{bus?.toStop?.stopName || 'Destination'}</p>
            <p className="font-bold text-lg text-accent">{formatTimeAMPM(bus?.toStop?.scheduledTime)}</p>
          </div>
        </div>

        {/* Delay indicator */}
        {(bus?.delayMinutes || 0) > 0 && (
          <div className="mt-3 bg-red-50 p-2 rounded-lg border border-red-100 text-sm text-red-700 flex items-center gap-2">
            ⚠️ Delayed by {bus.delayMinutes} minutes
          </div>
        )}

        {/* Estimated location / Next Stop */}
        {bus?.estimatedLocation && (
          <div className="mt-3 bg-amber-50 p-3 rounded-lg border border-amber-100 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-amber-600 flex-shrink-0" />
            <span className="text-sm text-amber-800">
              🟡 Between <span className="font-semibold">{bus.estimatedLocation.prevStopName || 'Stop'}</span> and <span className="font-semibold">{bus.estimatedLocation.nextStopName || 'Stop'}</span>
              <span className="text-amber-600 ml-1">(Estimated)</span>
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="mt-5 flex gap-3">
          <Button 
            className="flex-1 bg-primary text-white hover:bg-primary/90"
            onClick={() => router.push(`/track/${bus.tripId}`)}
          >
            <Navigation className="h-4 w-4 mr-2" />
            {t('track')}
          </Button>
          <Button 
            variant="outline" 
            className="flex-none px-3"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      {/* Expanded: All stops */}
      <div 
        className={`bg-slate-50 px-5 overflow-hidden transition-all duration-300 ease-in-out ${
          expanded ? 'max-h-[600px] py-4 border-t border-slate-100 overflow-y-auto' : 'max-h-0'
        }`}
      >
        <p className="text-sm text-slate-500 mb-3 font-medium">{t('viewRoute') || 'Route Stops'}</p>
        <div className="space-y-0">
          {(bus?.allStops || []).map((stop, idx) => {
            const fromSeq = bus?.fromStop?.sequence ?? 0;
            const toSeq = bus?.toStop?.sequence ?? 999;
            const isPassed = stop.sequence < fromSeq;
            const isFrom = stop.sequence === fromSeq;
            const isTo = stop.sequence === toSeq;
            const isActive = stop.sequence >= fromSeq && stop.sequence <= toSeq;

            return (
              <div key={stop.id || idx} className="flex items-start gap-3 relative">
                {/* Timeline line */}
                {idx < (bus.allStops || []).length - 1 && (
                  <div className={`absolute left-[7px] top-4 w-0.5 h-full ${isActive ? 'bg-accent' : 'bg-slate-200'}`}></div>
                )}
                {/* Dot */}
                <div className={`w-[15px] h-[15px] rounded-full border-2 flex-shrink-0 mt-0.5 z-10 ${
                  isFrom || isTo ? 'bg-accent border-accent' 
                  : isPassed ? 'bg-slate-300 border-slate-300'
                  : isActive ? 'bg-white border-accent' 
                  : 'bg-white border-slate-300'
                }`}></div>
                {/* Stop info */}
                <div className={`pb-4 flex-1 ${isPassed ? 'opacity-50' : ''}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${isFrom || isTo ? 'font-bold text-slate-900' : 'text-slate-700'}`}>
                      {stop.stopName}
                    </span>
                    <span className={`text-sm font-mono ${isFrom || isTo ? 'font-bold text-accent' : 'text-slate-500'}`}>
                      {formatTimeAMPM(stop.scheduledTime)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
