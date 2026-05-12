'use client';

import { useEffect, useState, use } from 'react';
import { getHotelBranding } from '@/actions/hotelBranding';
import Link from 'next/link';

type Language = 'nl' | 'en' | 'es';

const content = {
  nl: {
    nav_book: 'BOEK NU',
    nav_fleet: 'ONZE VLOOT',
    nav_location: 'LOCATIE',
    nav_contact: 'CONTACT',
    hero_title: 'Jouw Rit op Ibiza.',
    hero_subtitle: 'De grootste selectie scooters en quads op het eiland. Veilig, betrouwbaar en direct klaar voor vertrek.',
    hero_btn: 'Bekijk Onze Vloot',
    book_title: 'PLANNEN JOUW IBIZA RIT',
    book_pickup: 'Ophalen',
    book_dropoff: 'Terugbrengen',
    book_btn: 'Zoek Beschikbaarheid',
    fleet_title: 'Kies Jouw Categorie',
    fleet_subtitle: 'Van wendbare 50cc scooters tot krachtige quads',
    fleet_btn: 'Reserveer',
    price_from: 'Vanaf',
    price_day: '/ dag',
    footer_title: 'Verlies de Tijd.',
    footer_desc: 'Mr. Rental Ibiza - Waar jouw eilandavontuur begint.'
  },
  en: {
    nav_book: 'BOOK NOW',
    nav_fleet: 'OUR FLEET',
    nav_location: 'LOCATION',
    nav_contact: 'CONTACT',
    hero_title: 'Your Ride in Ibiza.',
    hero_subtitle: 'The largest selection of scooters and quads on the island. Safe, reliable, and ready to go.',
    hero_btn: 'View Our Fleet',
    book_title: 'PLAN YOUR IBIZA RIDE',
    book_pickup: 'Pick-up',
    book_dropoff: 'Drop-off',
    book_btn: 'Check Availability',
    fleet_title: 'Choose Your Category',
    fleet_subtitle: 'From agile 50cc scooters to powerful quads',
    fleet_btn: 'Reserve',
    price_from: 'From',
    price_day: '/ day',
    footer_title: 'Lose Track of Time.',
    footer_desc: 'Mr. Rental Ibiza - Where your island adventure begins.'
  },
  es: {
    nav_book: 'RESERVAR',
    nav_fleet: 'NUESTRA FLOTA',
    nav_location: 'UBICACIÓN',
    nav_contact: 'CONTACTO',
    hero_title: 'Tu Viaje en Ibiza.',
    hero_subtitle: 'La mayor selección de motos y quads de la isla. Seguros, fiables y listos para arrancar.',
    hero_btn: 'Ver Nuestra Flota',
    book_title: 'PLANIFICA TU VIAJE EN IBIZA',
    book_pickup: 'Recogida',
    book_dropoff: 'Devolución',
    book_btn: 'Ver Disponibilidad',
    fleet_title: 'Elige tu Categoría',
    fleet_subtitle: 'Desde ágiles motos de 50cc hasta potentes quads',
    fleet_btn: 'Reservar',
    price_from: 'Desde',
    price_day: '/ día',
    footer_title: 'Pierde la Noción del Tiempo.',
    footer_desc: 'Mr. Rental Ibiza - Donde comienza tu aventura.'
  }
};

// 100% Scooter Rental Specific Images
const HERO_IMG = "/fleet/hero_scooter.png"; // AI Generated beautiful scooter riding near coast
const FOOTER_IMG = "https://images.unsplash.com/photo-1620882319200-a548c40b8a10?q=80&w=2000&auto=format&fit=crop"; // Scooter near the beach

// Full categorized fleet for Mr Rental Ibiza Prototype
const FLEET_CATEGORIES = [
  {
    category: "Motos 50cc",
    desc: "Perfect for short trips around Ibiza town.",
    vehicles: [
      { id: '1', name: 'Piaggio Typhoon', cc: '50cc', price: '25', customImg: '/fleet/piaggio_typhoon.png' },
      { id: '2', name: 'Sym Symphony', cc: '50cc', price: '25', customImg: '/fleet/piaggio_typhoon.png' }
    ]
  },
  {
    category: "Motos 125cc",
    desc: "The most popular choice for exploring all beaches.",
    vehicles: [
      { id: '3', name: 'Vespa Primavera', cc: '125cc', price: '45', customImg: '/fleet/vespa_primavera.png' },
      { id: '4', name: 'Yamaha NMAX', cc: '125cc', price: '40', customImg: '/fleet/vespa_primavera.png' },
      { id: '5', name: 'Honda PCX', cc: '125cc', price: '40', customImg: '/fleet/honda_pcx.png' }
    ]
  },
  {
    category: "Maxi Scooters (300cc+)",
    desc: "Maximum comfort for two passengers and longer rides.",
    vehicles: [
      { id: '6', name: 'Vespa GTS 300', cc: '300cc', price: '65', customImg: '/fleet/vespa_primavera.png' },
      { id: '7', name: 'Yamaha XMAX', cc: '300cc', price: '70', customImg: '/fleet/honda_pcx.png' }
    ]
  },
  {
    category: "Quads & Buggies",
    desc: "For the adventurous off-road island experience.",
    vehicles: [
      { id: '8', name: 'Kymco MXU 250', cc: '250cc', price: '85', customImg: 'https://images.unsplash.com/photo-1596489370960-03b0c95333f8?q=80&w=800&auto=format&fit=crop' },
      { id: '9', name: 'Polaris RZR', cc: '1000cc', price: '250', customImg: 'https://images.unsplash.com/photo-1558237956-fce11172a561?q=80&w=800&auto=format&fit=crop' }
    ]
  }
];

export default function MisterRentalLandingPage() {
  const hotel_id = 'misterrentalibiza';
  const [dbBranding, setDbBranding] = useState<any>({name: null, color: null, logo: null, font: null, scooter_fleet: []});
  const [isLoading, setIsLoading] = useState(true);
  const [lang, setLang] = useState<Language>('es');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    getHotelBranding(hotel_id).then((data) => {
      setDbBranding(data);
      setIsLoading(false);
    });
    
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] font-serif text-[#C4A484] text-2xl tracking-widest uppercase">Loading Magic...</div>;

  const t = content[lang];
  const brandColor = dbBranding.color || '#D4B895'; 
  const font = dbBranding.font || 'Playfair Display'; 
  const encodedFont = font.replace(/ /g, '+');

  // Dynamic Fleet Grouping
  let rawFleet = dbBranding.scooter_fleet?.length > 0 ? dbBranding.scooter_fleet : [
    // --- SCOOTERS ---
    { id: 's1', name: 'Vespa Primavera', cc: '125cc', price: '45', category: 'scooter', customImg: '/fleet/vespa_primavera.png' },
    { id: 's2', name: 'Honda PCX', cc: '125cc', price: '40', category: 'scooter', customImg: '/fleet/honda_pcx.png' },
    { id: 's3', name: 'Piaggio Typhoon', cc: '50cc', price: '25', category: 'scooter', customImg: '/fleet/piaggio_typhoon.png' },
    // --- CARS ---
    { id: 'c1', name: 'Fiat 500 Cabrio', cc: 'Auto', price: '75', category: 'car', customImg: '/fleet/fiat_500_cabrio.png' },
    { id: 'c2', name: 'Jeep Wrangler', cc: '4x4 Manual', price: '150', category: 'car', customImg: '/fleet/jeep_wrangler.png' },
    { id: 'c3', name: 'Chrysler Grand Voyager', cc: '7 Seater Auto', price: '180', category: 'car', customImg: '/fleet/chrysler_grand_voyager.png' },
    { id: 'c4', name: 'Fiat Panda 169', cc: 'Manual', price: '50', category: 'car', customImg: '/fleet/fiat_panda_169.png' },
    { id: 'c5', name: 'Smart Forfour 453', cc: 'Auto', price: '65', category: 'car', customImg: '/fleet/smart_forfour_453.png' },
    { id: 'c6', name: 'Smart ForTwo 451', cc: 'Auto', price: '55', category: 'car', customImg: '/fleet/smart_fortwo_451.png' }
  ];

  // Group by category ('scooter' vs 'car')
  const grouped = rawFleet.reduce((acc: any, vehicle: any) => {
    const cat = vehicle.category || 'scooter';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(vehicle);
    return acc;
  }, {});

  const dynamicCategories = [];
  if (grouped['scooter']) {
    dynamicCategories.push({
      categoryTitle: lang === 'nl' ? 'Scooters & Motoren' : (lang === 'en' ? 'Scooters & Motorcycles' : 'Scooters y Motos'),
      vehicles: grouped['scooter']
    });
  }
  if (grouped['car']) {
    dynamicCategories.push({
      categoryTitle: lang === 'nl' ? 'Auto\'s' : (lang === 'en' ? 'Cars' : 'Coches'),
      vehicles: grouped['car']
    });
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]" style={{ fontFamily: font }}>
      <link href={`https://fonts.googleapis.com/css2?family=${encodedFont}:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600&display=swap`} rel="stylesheet" />
      
      {/* Elegant Boho Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 px-8 py-6 flex items-center justify-between transition-all duration-500 ${scrolled ? 'bg-[#FDFBF7]/90 backdrop-blur-lg shadow-sm py-4' : 'bg-transparent'}`}>
        <h1 className={`text-2xl font-bold tracking-widest uppercase transition-colors duration-500 ${scrolled ? 'text-gray-900' : 'text-white drop-shadow-md'}`}>
          Mr. Rental <span className="font-light italic">Ibiza</span>
        </h1>
        
        <div className={`hidden md:flex gap-10 text-xs tracking-[0.2em] font-['Montserrat'] font-semibold transition-colors duration-500 ${scrolled ? 'text-gray-800' : 'text-white drop-shadow-md'}`}>
          <a href="#book" className="hover:opacity-60 transition-opacity">{t.nav_book}</a>
          <a href="#fleet" className="hover:opacity-60 transition-opacity">{t.nav_fleet}</a>
          <a href="#location" className="hover:opacity-60 transition-opacity">{t.nav_location}</a>
          <a href="#contact" className="hover:opacity-60 transition-opacity">{t.nav_contact}</a>
        </div>
        
        <div className="flex gap-4 font-['Montserrat'] text-xs font-semibold tracking-widest">
          {(['nl', 'en', 'es'] as Language[]).map(l => (
            <button 
              key={l}
              onClick={() => setLang(l)}
              className={`uppercase transition-all ${lang === l ? (scrolled ? 'text-black border-b border-black' : 'text-white border-b border-white') : (scrolled ? 'text-gray-400' : 'text-white/60')}`}
            >
              {l}
            </button>
          ))}
        </div>
      </nav>

      {/* Anti-Gravity Hero Slideshow */}
      <header className="relative h-screen min-h-[700px] flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gray-900">
          <img src={HERO_IMG} className="absolute inset-0 w-full h-full object-cover opacity-70 animate-[kenburns_20s_ease-in-out_infinite_alternate]" alt="Ibiza Scooter Rental" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-[#FDFBF7]"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl animate-in fade-in slide-in-from-bottom-12 duration-1000 mt-20">
          <h2 className="text-6xl md:text-8xl font-bold text-white mb-6 drop-shadow-xl italic">{t.hero_title}</h2>
          <p className="text-lg md:text-xl text-white/90 font-['Montserrat'] font-light mb-12 max-w-2xl mx-auto drop-shadow-md leading-relaxed tracking-wide">
            {t.hero_subtitle}
          </p>
          <a 
            href="#book"
            className="inline-block px-12 py-5 text-white text-sm tracking-[0.2em] font-['Montserrat'] uppercase border border-white/50 rounded-full hover:bg-white hover:text-gray-900 transition-all duration-500 backdrop-blur-sm"
          >
            {t.hero_btn}
          </a>
        </div>
      </header>

      {/* Elegant Booking Widget */}
      <section id="book" className="relative z-20 px-6 -mt-32">
        <div className="max-w-5xl mx-auto bg-white/90 backdrop-blur-xl rounded-t-[3rem] rounded-b-[1rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-10 md:p-14 border border-white/40">
          <h3 className="text-center text-xs font-['Montserrat'] tracking-[0.3em] text-gray-400 uppercase mb-8">{t.book_title}</h3>
          
          <div className="flex flex-col md:flex-row gap-8 items-end">
            <div className="flex-1 w-full border-b border-gray-200 pb-2">
              <label className="block text-[10px] font-['Montserrat'] font-bold text-gray-400 uppercase tracking-widest mb-3">{t.book_pickup}</label>
              <input type="date" defaultValue="2026-08-12" className="w-full bg-transparent text-gray-800 text-lg font-medium focus:outline-none" />
            </div>
            
            <div className="flex-1 w-full border-b border-gray-200 pb-2">
              <label className="block text-[10px] font-['Montserrat'] font-bold text-gray-400 uppercase tracking-widest mb-3">{t.book_dropoff}</label>
              <input type="date" defaultValue="2026-08-19" className="w-full bg-transparent text-gray-800 text-lg font-medium focus:outline-none" />
            </div>
            
            <button 
              onClick={() => document.getElementById('fleet')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full md:w-auto px-10 py-5 text-white text-xs tracking-widest font-['Montserrat'] font-bold uppercase rounded-none hover:opacity-90 transition-opacity" 
              style={{ backgroundColor: brandColor }}
            >
              {t.book_btn}
            </button>
          </div>
        </div>
      </section>

      {/* Categorized Fleet Section */}
      <section id="fleet" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 italic">{t.fleet_title}</h2>
            <p className="text-gray-500 font-['Montserrat'] text-sm tracking-widest uppercase">{t.fleet_subtitle}</p>
          </div>
          
          <div className="space-y-32">
            {dynamicCategories.map((cat, catIdx) => (
              <div key={catIdx} className="border-t border-gray-200 pt-16">
                <div className="mb-12">
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">{cat.categoryTitle}</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                  {cat.vehicles.map((scooter: any, idx: number) => (
                    <div key={scooter.id} className="group cursor-pointer">
                      <div className="relative h-[300px] md:h-[400px] mb-8 overflow-hidden rounded-[2rem] shadow-lg">
                        <img 
                          src={scooter.customImg || scooter.image || 'https://images.unsplash.com/photo-1590487988256-9ed24133863e?q=80&w=800&auto=format&fit=crop'} 
                          alt={scooter.name} 
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out" 
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>
                      </div>
                      
                      <div className="text-center">
                        <h4 className="text-2xl font-bold text-gray-900 mb-2">{scooter.name}</h4>
                        <p className="text-xs font-['Montserrat'] text-gray-400 tracking-widest uppercase mb-4">{scooter.cc} • Auto</p>
                        
                        <div className="flex items-center justify-center gap-4">
                          <span className="text-gray-500 text-sm italic">{t.price_from}</span>
                          <span className="text-2xl font-bold" style={{ color: brandColor }}>€{scooter.price}</span>
                          <span className="text-gray-500 text-sm italic">{t.price_day}</span>
                        </div>
                        
                        <Link 
                          href={`/scooters/${hotel_id}/checkout?scooter=${encodeURIComponent(scooter.name)}&price=${scooter.price}`}
                          className="inline-block mt-6 px-8 py-3 border border-gray-900 text-gray-900 text-xs font-['Montserrat'] tracking-widest uppercase hover:bg-gray-900 hover:text-white transition-all duration-300"
                        >
                          {t.fleet_btn}
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cinematic Scooter Rental Footer */}
      <footer id="contact" className="relative h-[80vh] flex flex-col items-center justify-end overflow-hidden py-20">
        <div className="absolute inset-0 bg-gray-900">
          <img src={FOOTER_IMG} className="absolute inset-0 w-full h-full object-cover opacity-80" alt="Scooter Rental Ibiza" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 w-full max-w-4xl">
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 italic drop-shadow-lg">{t.footer_title}</h2>
          <p className="text-white/70 font-['Montserrat'] tracking-[0.2em] uppercase text-xs mb-16">{t.footer_desc}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 border-t border-white/20 pt-16 text-white/80 font-['Montserrat'] text-xs tracking-widest">
            <div>
              <p className="font-bold text-white mb-4">IBIZA TOWN HQ</p>
              <p>Av. Pere Matutes Noguera</p>
              <p>07800 Ibiza, Illes Balears</p>
            </div>
            <div>
              <p className="font-bold text-white mb-4">RESERVACIONES Y WHATSAPP</p>
              <a href="https://wa.me/34602605866" target="_blank" rel="noreferrer" className="block hover:text-white transition-colors mb-1">+34 602 605 866</a>
              <a href="mailto:hola@mrrentalibiza.com" className="block hover:text-white transition-colors">hola@mrrentalibiza.com</a>
            </div>
            <div>
              <p className="font-bold text-white mb-4">FOLLOW THE SUN</p>
              <div className="flex gap-4 justify-center">
                <span>INSTAGRAM</span>
                <span>FACEBOOK</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/34602605866" 
        target="_blank" 
        rel="noreferrer"
        className="fixed bottom-8 right-8 z-50 bg-[#25D366] text-white w-16 h-16 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(37,211,102,0.4)] hover:scale-110 hover:shadow-[0_15px_40px_rgba(37,211,102,0.6)] transition-all duration-300"
        aria-label="Contact us on WhatsApp"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
          <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c-.003 1.396.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
        </svg>
      </a>
      
      {/* Inline Animation Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes kenburns {
          0% { transform: scale(1) translate(0, 0); }
          100% { transform: scale(1.1) translate(-2%, -1%); }
        }
      `}} />
    </div>
  );
}
