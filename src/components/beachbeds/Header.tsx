"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';
import { Language } from '@/lib/translations';

export default function Header() {
  const { language, setLanguage } = useLanguage();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <span className="font-serif text-2xl tracking-widest text-stone-900">VIESA</span>
            <span className="ml-2 font-sans text-sm tracking-widest text-stone-500 uppercase mt-1">Reserve</span>
          </div>

          {/* Navigation Links & Language Selector */}
          <div className="flex items-center space-x-6">
            {pathname === '/admin' ? (
              <Link href="/" className="text-sm font-bold text-stone-500 hover:text-emerald-600 transition-colors">
                View as Customer &rarr;
              </Link>
            ) : (
              <Link href="/admin" className="text-sm font-bold text-stone-500 hover:text-blue-600 transition-colors">
                Admin Dashboard &rarr;
              </Link>
            )}

            <div className="flex items-center space-x-2 border-l border-stone-200 pl-6">
              <Globe className="w-4 h-4 text-stone-500" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-transparent text-sm font-medium text-stone-700 focus:outline-none cursor-pointer uppercase"
              >
                <option value="en">EN</option>
                <option value="es">ES</option>
                <option value="nl">NL</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
