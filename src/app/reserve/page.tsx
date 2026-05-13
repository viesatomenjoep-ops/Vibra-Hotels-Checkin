"use client";

import React, { useState } from 'react';
import Header from '@/components/beachbeds/Header';
import InteractiveMap from '@/components/beachbeds/InteractiveMap';
import type { Bed } from '@/components/beachbeds/AdminBedEditor';
import CheckoutDrawer from '@/components/beachbeds/CheckoutDrawer';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ReserveGuestPage() {
  const { t } = useLanguage();
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);

  return (
    <main className="min-h-screen pb-24 bg-stone-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-stone-900 mb-6 leading-tight">
            {t('tagline')}
          </h1>
          <p className="text-lg text-stone-600 leading-relaxed max-w-2xl mx-auto">
            {t('welcomeText')}
          </p>
        </div>

        <InteractiveMap onBedSelect={setSelectedBed} />
      </div>

      <CheckoutDrawer 
        bed={selectedBed} 
        onClose={() => setSelectedBed(null)} 
      />
    </main>
  );
}
