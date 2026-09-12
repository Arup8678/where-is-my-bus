"use client";

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TimelineStop {
  id: string;
  name: string;
  time: string;
  status: 'passed' | 'current' | 'upcoming' | 'destination';
}

interface StopTimelineProps {
  stops: TimelineStop[];
}

export function StopTimeline({ stops }: StopTimelineProps) {
  if (!stops || stops.length === 0) {
    return (
      <div className="py-8 text-center text-slate-400 text-sm">
        No stop schedule details available.
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="relative pl-6 sm:pl-8">
        {/* Vertical line */}
        <div className="absolute top-2 bottom-2 left-[11px] sm:left-[15px] w-[2px] bg-slate-200"></div>
        
        <div className="space-y-6">
          {stops.map((stop, index) => {
            const isPassed = stop.status === 'passed';
            const isCurrent = stop.status === 'current';
            const isDestination = stop.status === 'destination';
            
            return (
              <div key={stop.id ? `${stop.id}-${index}` : `timeline-stop-${index}`} className="relative">
                {/* Node */}
                <div 
                  className={cn(
                    "absolute -left-6 sm:-left-8 top-0 flex items-center justify-center rounded-full border-2 bg-white z-10",
                    isPassed ? "h-4 w-4 border-slate-300" : 
                    isCurrent ? "h-6 w-6 -left-[27px] sm:-left-[35px] border-blue-600 bg-blue-50" : 
                    isDestination ? "h-5 w-5 -left-[25px] sm:-left-[33px] border-emerald-600 bg-emerald-50" : 
                    "h-4 w-4 border-slate-400"
                  )}
                >
                  {isPassed && <Check className="h-2.5 w-2.5 text-slate-400" />}
                  {isCurrent && <div className="h-3 w-3 bg-blue-600 rounded-full animate-pulse"></div>}
                  {isDestination && <div className="h-2 w-2 bg-emerald-600 rounded-full"></div>}
                </div>
                
                {/* Content */}
                <div className="flex justify-between items-start pl-2">
                  <div className={cn(
                    "font-medium text-sm sm:text-base",
                    isPassed ? "text-slate-400" :
                    isCurrent ? "text-blue-600 font-bold" :
                    isDestination ? "text-slate-900 font-bold" :
                    "text-slate-700"
                  )}>
                    {stop.name}
                  </div>
                  <div className={cn(
                    "text-xs sm:text-sm font-mono font-medium ml-2 text-right shrink-0",
                    isPassed ? "text-slate-400" :
                    isCurrent ? "text-blue-600 font-bold" :
                    "text-slate-500"
                  )}>
                    {stop.time}
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
