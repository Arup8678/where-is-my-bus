"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'bn';

const translations = {
  en: {
    appName: 'Where Is My Bus?',
    from: 'From',
    to: 'To',
    findBus: 'Find Bus',
    track: 'Track Bus',
    viewRoute: 'View Route',
    running: 'Running',
    estimated: 'Estimated',
    delayed: 'Delayed',
    completed: 'Completed',
    nextBus: 'Next Bus',
    dashboard: 'Dashboard',
    buses: 'Buses',
    routes: 'Routes',
    stops: 'Stops',
    timetable: 'Timetable',
    importExcel: 'Import Excel',
    liveTrips: 'Live Trips',
    delays: 'Delays',
    settings: 'Settings',
    modifySearch: 'Modify Search',
  },
  bn: {
    appName: 'আমার বাস কোথায়?',
    from: 'থেকে',
    to: 'পর্যন্ত',
    findBus: 'বাস খুঁজুন',
    track: 'বাস ট্র্যাক করুন',
    viewRoute: 'রুট দেখুন',
    running: 'চলছে',
    estimated: 'আনুমানিক',
    delayed: 'বিলম্বিত',
    completed: 'সম্পন্ন',
    nextBus: 'পরবর্তী বাস',
    dashboard: 'ড্যাশবোর্ড',
    buses: 'বাস',
    routes: 'রুট',
    stops: 'স্টপ',
    timetable: 'সময়সূচী',
    importExcel: 'এক্সেল ইমপোর্ট',
    liveTrips: 'লাইভ ট্রিপ',
    delays: 'বিলম্ব',
    settings: 'সেটিংস',
    modifySearch: 'অনুসন্ধান পরিবর্তন করুন',
  }
};

type Translations = typeof translations.en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof Translations) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: keyof Translations) => {
    return translations[language][key] || translations.en[key];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    return {
      language: 'en' as Language,
      setLanguage: () => {},
      t: (key: keyof Translations) => translations.en[key] || String(key)
    };
  }
  return context;
}
