'use client';

import { useEffect, useState, use } from 'react';
import { getHotelBranding } from '@/actions/hotelBranding';
import Link from 'next/link';

type Language = 'nl' | 'en' | 'es';

const content = {
  nl: {
    hero_title: 'Verken Ibiza in Stijl.',
    hero_subtitle: 'Huur de beste scooters voor jouw ultieme eilandavontuur. Snel, betrouwbaar en altijd klaar voor vertrek.',
    hero_btn: 'Nu Reserveren',
    book_title: 'Plan Jouw Rit',
    book_pickup: 'Ophaaldatum',
    book_dropoff: 'Terugbrengdatum',
    book_btn: 'Bekijk Beschikbaarheid',
    benefits_title: 'Waarom Mr. Rental Ibiza?',
    p1_title: 'Premium Scooters',
    p1_desc: 'Altijd perfect onderhouden.',
    p2_title: 'All-Inclusive',
    p2_desc: 'Inclusief verzekering en twee helmen.',
    p3_title: 'Lokale Support',
    p3_desc: 'Wij staan altijd voor je klaar op het eiland.',
    fleet_title: 'Kies je Scooter',
    fleet_btn: 'Nu Reserveren',
    price_from: 'Vanaf',
    price_day: '/ dag'
  },
  en: {
    hero_title: 'Explore Ibiza in Style.',
    hero_subtitle: 'Rent the best scooters for your ultimate island adventure. Fast, reliable, and always ready to go.',
    hero_btn: 'Book Now',
    book_title: 'Plan Your Ride',
    book_pickup: 'Pick-up Date',
    book_dropoff: 'Drop-off Date',
    book_btn: 'Check Availability',
    benefits_title: 'Why Mr. Rental Ibiza?',
    p1_title: 'Premium Scooters',
    p1_desc: 'Always perfectly maintained.',
    p2_title: 'All-Inclusive',
    p2_desc: 'Includes insurance and two helmets.',
    p3_title: 'Local Support',
    p3_desc: 'We are always here for you on the island.',
    fleet_title: 'Choose Your Scooter',
    fleet_btn: 'Reserve Now',
    price_from: 'From',
    price_day: '/ day'
  },
  es: {
    hero_title: 'Explora Ibiza con Estilo.',
    hero_subtitle: 'Alquila las mejores motos para tu máxima aventura en la isla. Rápidas, fiables y siempre listas para arrancar.',
    hero_btn: 'Reservar Ahora',
    book_title: 'Planifica tu Viaje',
    book_pickup: 'Fecha de Recogida',
    book_dropoff: 'Fecha de Devolución',
    book_btn: 'Ver Disponibilidad',
    benefits_title: '¿Por qué Mr. Rental Ibiza?',
    p1_title: 'Motos Premium',
    p1_desc: 'Siempre en perfecto estado.',
    p2_title: 'Todo Incluido',
    p2_desc: 'Incluye seguro y dos cascos.',
    p3_title: 'Soporte Local',
    p3_desc: 'Siempre estamos a tu disposición en la isla.',
    fleet_title: 'Elige tu Moto',
    fleet_btn: 'Reservar Ahora',
    price_from: 'Desde',
    price_day: '/ día'
  }
};

export default function ScooterLandingPage({ 
  params,
}: { 
  params: Promise<{ hotel_id: string }>;
}) {
  const resolvedParams = use(params);
  const hotel_id = resolvedParams.hotel_id;
  
  const [dbBranding, setDbBranding] = useState<any>({name: null, color: null, logo: null, font: null, scooter_fleet: []});
  const [isLoading, setIsLoading] = useState(true);
  const [lang, setLang] = useState<Language>('en');

  useEffect(() => {
    getHotelBranding(hotel_id).then((data) => {
      setDbBranding(data);
      setIsLoading(false);
    });
  }, [hotel_id]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 font-bold">Loading Experience...</div>;

  const t = content[lang];
  const brandName = dbBranding.name || 'Mr. Rental Ibiza';
  const brandLogo = dbBranding.logo || '';
  const brandColor = dbBranding.color || '#00d2d3';
  const font = dbBranding.font || 'Inter';
  const encodedFont = font.replace(/ /g, '+');
  
  const fleet = dbBranding.scooter_fleet?.length > 0 ? dbBranding.scooter_fleet : [
    { id: '1', name: 'Vespa Primavera', cc: '125cc', price: '35' },
    { id: '2', name: 'Honda PCX', cc: '125cc', price: '28' }
  ];

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: font }}>
      <link href={`https://fonts.googleapis.com/css2?family=${encodedFont}:wght@400;500;600;700;800;900&display=swap`} rel="stylesheet" />
      
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 px-6 py-6 flex items-center justify-between">
        {brandLogo ? (
          <img src={brandLogo} alt="Logo" className="h-12 w-auto object-contain brightness-0 invert drop-shadow-md" />
        ) : (
          <h1 className="text-2xl font-black text-white drop-shadow-md">{brandName}</h1>
        )}
        
        <div className="flex gap-2">
          {(['nl', 'en', 'es'] as Language[]).map(l => (
            <button 
              key={l}
              onClick={() => setLang(l)}
              className={`font-bold text-xs uppercase px-3 py-1.5 rounded-full transition-all backdrop-blur-md ${lang === l ? 'bg-white text-gray-900' : 'bg-black/30 text-white hover:bg-black/50'}`}
            >
              {l}
            </button>
          ))}
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative h-[80vh] min-h-[600px] flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gray-900">
          <img src="https://images.unsplash.com/photo-1498887960847-2a5e46312788?q=80&w=2000&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay" alt="Ibiza" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl animate-in slide-in-from-bottom-8 duration-1000">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 drop-shadow-xl">{t.hero_title}</h1>
          <p className="text-lg md:text-2xl text-white/90 font-medium mb-10 max-w-2xl mx-auto drop-shadow-md leading-relaxed">{t.hero_subtitle}</p>
          <button 
            onClick={() => document.getElementById('booking-widget')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-10 py-5 text-white text-lg font-black rounded-full shadow-2xl hover:scale-105 transition-all duration-300"
            style={{ backgroundColor: brandColor }}
          >
            {t.hero_btn}
          </button>
        </div>
      </header>

      {/* Booking Widget Section */}
      <section id="booking-widget" className="relative -mt-24 z-20 px-4">
        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl p-6 md:p-10 border border-gray-100">
          <h2 className="text-2xl font-black text-gray-900 mb-6">{t.book_title}</h2>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t.book_pickup}</label>
              <input type="date" defaultValue="2026-08-12" className="w-full font-bold text-gray-900 bg-gray-50 p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all" style={{ '--tw-ring-color': brandColor } as React.CSSProperties} />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t.book_dropoff}</label>
              <input type="date" defaultValue="2026-08-19" className="w-full font-bold text-gray-900 bg-gray-50 p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all" style={{ '--tw-ring-color': brandColor } as React.CSSProperties} />
            </div>
            <div className="flex items-end">
              <button 
                onClick={() => document.getElementById('fleet-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full md:w-auto px-8 py-4 text-white font-black rounded-xl shadow-lg hover:brightness-110 transition-all" 
                style={{ backgroundColor: brandColor }}
              >
                {t.book_btn}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gray-50 mt-12">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-black text-center text-gray-900 mb-16">{t.benefits_title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-inner" style={{ backgroundColor: `${brandColor}20`, color: brandColor }}>🛵</div>
              <h3 className="text-xl font-black text-gray-900 mb-3">{t.p1_title}</h3>
              <p className="text-gray-500 font-medium">{t.p1_desc}</p>
            </div>
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-inner" style={{ backgroundColor: `${brandColor}20`, color: brandColor }}>🛡️</div>
              <h3 className="text-xl font-black text-gray-900 mb-3">{t.p2_title}</h3>
              <p className="text-gray-500 font-medium">{t.p2_desc}</p>
            </div>
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-inner" style={{ backgroundColor: `${brandColor}20`, color: brandColor }}>📍</div>
              <h3 className="text-xl font-black text-gray-900 mb-3">{t.p3_title}</h3>
              <p className="text-gray-500 font-medium">{t.p3_desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Fleet Section */}
      <section id="fleet-section" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-black text-gray-900 mb-12">{t.fleet_title}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {fleet.map((scooter: any) => (
              <div key={scooter.id} className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden flex flex-col group hover:shadow-2xl transition-all duration-300">
                <div className="h-64 bg-gray-100 relative flex items-center justify-center overflow-hidden">
                  {scooter.image ? (
                    <img src={scooter.image} alt={scooter.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <span className="text-8xl group-hover:scale-110 transition-transform duration-700">🛵</span>
                  )}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider text-green-600 shadow-sm z-10">Available</div>
                </div>
                
                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 mb-3">{scooter.name}</h3>
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-md text-xs font-bold">{scooter.cc}</span>
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-md text-xs font-bold">Automatic</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-end pt-6 border-t border-gray-100">
                    <div>
                      <span className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">{t.price_from}</span>
                      <div className="text-3xl font-black" style={{ color: brandColor }}>€{scooter.price}<span className="text-sm text-gray-400 font-bold ml-1">{t.price_day}</span></div>
                    </div>
                    <Link 
                      href={`/scooters/${hotel_id}/checkout?scooter=${encodeURIComponent(scooter.name)}&price=${scooter.price}`}
                      className="px-6 py-3 text-white font-black text-sm rounded-xl shadow-md hover:brightness-110 transition-all hover:-translate-y-1" 
                      style={{ backgroundColor: brandColor }}
                    >
                      {t.fleet_btn}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 text-center">
        {brandLogo ? (
          <img src={brandLogo} alt="Logo" className="h-10 w-auto mx-auto object-contain brightness-0 invert opacity-50 mb-6" />
        ) : (
          <h2 className="text-xl font-black opacity-50 mb-6">{brandName}</h2>
        )}
        <p className="text-gray-500 text-sm font-medium">© 2026 {brandName}. Powered by Viesa Platform.</p>
      </footer>
    </div>
  );
}
