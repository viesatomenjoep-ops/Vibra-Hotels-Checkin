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
const HERO_IMG = "https://images.unsplash.com/photo-1590487988256-9ed24133863e?q=80&w=2000&auto=format&fit=crop"; // Classic Vespa parked
const FOOTER_IMG = "https://images.unsplash.com/photo-1620882319200-a548c40b8a10?q=80&w=2000&auto=format&fit=crop"; // Scooter near the beach

// Full categorized fleet for Mr Rental Ibiza Prototype
const FLEET_CATEGORIES = [
  {
    category: "Motos 50cc",
    desc: "Perfect for short trips around Ibiza town.",
    vehicles: [
      { id: '1', name: 'Piaggio Typhoon', cc: '50cc', price: '25', customImg: 'https://images.unsplash.com/photo-1569429538356-8c4d29be59ce?q=80&w=800&auto=format&fit=crop' },
      { id: '2', name: 'Sym Symphony', cc: '50cc', price: '25', customImg: 'https://images.unsplash.com/photo-1517721868356-02e0b57e0996?q=80&w=800&auto=format&fit=crop' }
    ]
  },
  {
    category: "Motos 125cc",
    desc: "The most popular choice for exploring all beaches.",
    vehicles: [
      { id: '3', name: 'Vespa Primavera', cc: '125cc', price: '45', customImg: 'https://images.unsplash.com/photo-1590487988256-9ed24133863e?q=80&w=800&auto=format&fit=crop' },
      { id: '4', name: 'Yamaha NMAX', cc: '125cc', price: '40', customImg: 'https://images.unsplash.com/photo-1620601323381-1979b1836c2f?q=80&w=800&auto=format&fit=crop' },
      { id: '5', name: 'Honda PCX', cc: '125cc', price: '40', customImg: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=800&auto=format&fit=crop' }
    ]
  },
  {
    category: "Maxi Scooters (300cc+)",
    desc: "Maximum comfort for two passengers and longer rides.",
    vehicles: [
      { id: '6', name: 'Vespa GTS 300', cc: '300cc', price: '65', customImg: 'https://images.unsplash.com/photo-1525048924045-31a89c31fa75?q=80&w=800&auto=format&fit=crop' },
      { id: '7', name: 'Yamaha XMAX', cc: '300cc', price: '70', customImg: 'https://images.unsplash.com/photo-1582838706240-a36ff694c979?q=80&w=800&auto=format&fit=crop' }
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
            {FLEET_CATEGORIES.map((cat, catIdx) => (
              <div key={catIdx} className="border-t border-gray-200 pt-16">
                <div className="mb-12">
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">{cat.category}</h3>
                  <p className="text-gray-500 font-['Montserrat']">{cat.desc}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                  {cat.vehicles.map((scooter: any) => (
                    <div key={scooter.id} className="group cursor-pointer">
                      <div className="relative h-[300px] md:h-[400px] mb-8 overflow-hidden rounded-[2rem] shadow-lg">
                        <img 
                          src={scooter.customImg} 
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
              <p className="font-bold text-white mb-4">RESERVATIONS</p>
              <p>+34 971 123 456</p>
              <p>hola@mrrentalibiza.com</p>
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
