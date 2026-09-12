"use client";

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { Button } from './ui/button';
import { Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <nav className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold flex items-center gap-2">
          🚌 {t('appName')}
        </Link>
        
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
            className="hidden sm:flex"
          >
            {language === 'en' ? 'বাংলা' : 'English'}
          </Button>

          <Link href="/admin" className="hidden sm:flex">
            <Button variant="secondary" size="sm">Admin</Button>
          </Link>

          <div className="sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}>
                  {language === 'en' ? 'Switch to বাংলা' : 'Switch to English'}
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin">Admin Panel</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
