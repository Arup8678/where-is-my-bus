"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n';
import { StopCombobox } from './StopCombobox';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Search } from 'lucide-react';

export function SearchCard() {
  const { t } = useLanguage();
  const router = useRouter();
  
  const [fromName, setFromName] = useState('Silda');
  const [toName, setToName] = useState('Bankura');

  const handleSwap = () => {
    const prevFrom = fromName;
    setFromName(toName);
    setToName(prevFrom);
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!fromName.trim() || !toName.trim()) return;
    
    const params = new URLSearchParams({
      from: fromName.trim(),
      to: toName.trim()
    });
    
    router.push(`/search?${params.toString()}`);
  };

  const isButtonEnabled = Boolean(fromName.trim() && toName.trim());

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl w-full max-w-lg mx-auto">
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="relative">
          <label className="text-xs font-semibold text-blue-200 uppercase tracking-wider mb-1 block">
            {t('from')}
          </label>
          <StopCombobox 
            value={fromName} 
            onChange={(_id, name) => setFromName(name)} 
            placeholder={t('from')} 
          />
          
          <div className="absolute right-3 top-8 z-10">
            <Button 
              variant="secondary" 
              size="icon" 
              className="h-8 w-8 rounded-full shadow-md bg-white hover:bg-slate-100 text-slate-700"
              onClick={handleSwap}
              type="button"
              title="Swap From and To"
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div>
          <label className="text-xs font-semibold text-blue-200 uppercase tracking-wider mb-1 block">
            {t('to')}
          </label>
          <StopCombobox 
            value={toName} 
            onChange={(_id, name) => setToName(name)} 
            placeholder={t('to')} 
          />
        </div>

        <Button 
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-6 text-lg rounded-xl mt-3 shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!isButtonEnabled}
        >
          <Search className="h-5 w-5" />
          {t('findBus')}
        </Button>
      </form>
    </div>
  );
}
