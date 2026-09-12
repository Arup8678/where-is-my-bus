"use client";

import { useState, useEffect, useRef } from 'react';
import { getStops, StopInfo } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { Input } from '@/components/ui/input';
import { Search, MapPin } from 'lucide-react';

interface StopComboboxProps {
  value: string;
  onChange: (stopId: string, stopName: string) => void;
  placeholder?: string;
}

const FALLBACK_STOPS: StopInfo[] = [
  { id: '1', name: 'Raipur', nameBn: 'রায়পুর', lat: 22.6833, lng: 86.8167 },
  { id: '2', name: 'Motgoda', nameBn: 'মোদগোদা', lat: 22.5400, lng: 86.9300 },
  { id: '3', name: 'Phulkusma', nameBn: 'ফুলকুসমা', lat: 22.5000, lng: 86.9000 },
  { id: '4', name: 'Silda', nameBn: 'শিলদা', lat: 22.5833, lng: 86.9667 },
  { id: '5', name: 'Bankura', nameBn: 'বাঁকুড়া', lat: 23.2333, lng: 87.0667 },
  { id: '6', name: 'Howrah', nameBn: 'হাওড়া', lat: 22.5958, lng: 88.2636 },
  { id: '7', name: 'Kolkata', nameBn: 'কলকাতা', lat: 22.5726, lng: 88.3639 },
  { id: '8', name: 'Kharagpur', nameBn: 'খড়্গপুর', lat: 22.3460, lng: 87.3237 },
  { id: '9', name: 'Midnapore', nameBn: 'মেদিনীপুর', lat: 22.4236, lng: 87.3199 },
  { id: '10', name: 'Jhargram', nameBn: 'ঝাড়গ্রাম', lat: 22.4536, lng: 86.9840 },
  { id: '11', name: 'Purulia', nameBn: 'পুরুলিয়া', lat: 23.3300, lng: 86.3600 },
  { id: '12', name: 'Burdwan', nameBn: 'বর্ধমান', lat: 23.2324, lng: 87.8615 },
  { id: '13', name: 'Durgapur', nameBn: 'দুর্গাপুর', lat: 23.5204, lng: 87.3119 },
  { id: '14', name: 'Asansol', nameBn: 'আসানসোল', lat: 23.6889, lng: 86.9661 },
  { id: '15', name: 'Bishnupur', nameBn: 'বিষ্ণুপুর', lat: 23.0787, lng: 87.3161 },
];

export function StopCombobox({ value, onChange, placeholder }: StopComboboxProps) {
  const { language } = useLanguage();
  const [query, setQuery] = useState(value || '');
  const [stops, setStops] = useState<StopInfo[]>(FALLBACK_STOPS);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync value if parent changes
  useEffect(() => {
    if (value && !isOpen) {
      setQuery(value);
    }
  }, [value, isOpen]);

  // Click outside listener to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchStops = async () => {
      try {
        const data = await getStops(query);
        if (isMounted && data && data.length > 0) {
          setStops(data);
        }
      } catch {
        // Fallback to local filtering
        if (isMounted) {
          const filtered = FALLBACK_STOPS.filter(s =>
            s.name.toLowerCase().includes(query.toLowerCase()) ||
            (s.nameBn && s.nameBn.includes(query))
          );
          setStops(filtered.length > 0 ? filtered : FALLBACK_STOPS);
        }
      }
    };
    
    const timeoutId = setTimeout(fetchStops, 200);
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [query]);

  const handleInputChange = (text: string) => {
    setQuery(text);
    setIsOpen(true);
    // Directly notify parent with typed text
    onChange(text, text);
  };

  const handleSelect = (stop: StopInfo) => {
    const displayName = language === 'bn' && stop.nameBn ? stop.nameBn : stop.name;
    setQuery(displayName);
    onChange(stop.id, stop.name); // Pass canonical English stop name
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="pl-9 bg-white text-slate-900 border-slate-200 shadow-sm"
        />
      </div>
      
      {isOpen && stops.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-base shadow-xl ring-1 ring-black/10 focus:outline-none sm:text-sm">
          {stops.map((stop) => (
            <li
              key={stop.id}
              className="flex items-center gap-2 px-3 py-2.5 hover:bg-blue-50 cursor-pointer text-slate-800 transition-colors border-b border-slate-100 last:border-0"
              onMouseDown={() => handleSelect(stop)}
            >
              <MapPin className="h-4 w-4 text-blue-600 shrink-0" />
              <span className="font-medium">{stop.name}</span>
              {stop.nameBn && (
                <span className="text-xs text-slate-500 font-normal">({stop.nameBn})</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
