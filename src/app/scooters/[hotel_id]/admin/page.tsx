'use client';

import { useEffect, useState, use } from 'react';
import { getHotelBranding } from '@/actions/hotelBranding';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

type Language = 'nl' | 'en' | 'es';

const translations = {
  nl: {
    sidebar_reservations: 'Reserveringen',
    sidebar_fleet: 'Mijn Vloot',
    sidebar_settings: 'Instellingen',
    back_to_pitch: '← Terug naar Viesa',
    title_reservations: 'Overzicht Reserveringen',
    subtitle_reservations: 'Beheer al je actieve scooter verhuren',
    title_fleet: 'Mijn Scooter Vloot',
    subtitle_fleet: 'Overzicht van al je beschikbare voertuigen',
    title_settings: 'Bedrijfsinstellingen',
    subtitle_settings: 'Beheer je merk en bedrijfsgegevens',
    live_connection: 'Live Connectie',
    total_bookings: 'Totaal Boekingen',
    active_road: 'Actief op weg',
    pending: 'In afwachting',
    recent_bookings: 'Recente Boekingen',
    export_csv: 'Exporteren (CSV)',
    col_customer: 'Klant',
    col_contact: 'Contact',
    col_scooter: 'Scooter',
    col_date: 'Datum (Van - Tot)',
    col_status: 'Status',
    no_reservations: 'Geen reserveringen gevonden in de database.',
    price: 'Prijs',
    engine: 'Motor',
    brand_color: 'Huisstijl Kleur',
    font: 'Lettertype',
  },
  en: {
    sidebar_reservations: 'Reservations',
    sidebar_fleet: 'My Fleet',
    sidebar_settings: 'Settings',
    back_to_pitch: '← Back to Viesa',
    title_reservations: 'Reservations Overview',
    subtitle_reservations: 'Manage all your active scooter rentals',
    title_fleet: 'My Scooter Fleet',
    subtitle_fleet: 'Overview of all your available vehicles',
    title_settings: 'Company Settings',
    subtitle_settings: 'Manage your brand and company details',
    live_connection: 'Live Connection',
    total_bookings: 'Total Bookings',
    active_road: 'On the road',
    pending: 'Pending',
    recent_bookings: 'Recent Bookings',
    export_csv: 'Export (CSV)',
    col_customer: 'Customer',
    col_contact: 'Contact',
    col_scooter: 'Scooter',
    col_date: 'Date (From - To)',
    col_status: 'Status',
    no_reservations: 'No reservations found in the database.',
    price: 'Price',
    engine: 'Engine',
    brand_color: 'Brand Color',
    font: 'Font Family',
  },
  es: {
    sidebar_reservations: 'Reservas',
    sidebar_fleet: 'Mi Flota',
    sidebar_settings: 'Ajustes',
    back_to_pitch: '← Volver a Viesa',
    title_reservations: 'Resumen de Reservas',
    subtitle_reservations: 'Gestiona todos tus alquileres de scooters activos',
    title_fleet: 'Mi Flota de Scooters',
    subtitle_fleet: 'Resumen de todos tus vehículos disponibles',
    title_settings: 'Ajustes de Empresa',
    subtitle_settings: 'Gestiona tu marca y detalles de la empresa',
    live_connection: 'Conexión en Vivo',
    total_bookings: 'Total de Reservas',
    active_road: 'En ruta',
    pending: 'Pendiente',
    recent_bookings: 'Reservas Recientes',
    export_csv: 'Exportar (CSV)',
    col_customer: 'Cliente',
    col_contact: 'Contacto',
    col_scooter: 'Scooter',
    col_date: 'Fecha (Desde - Hasta)',
    col_status: 'Estado',
    no_reservations: 'No se encontraron reservas en la base de datos.',
    price: 'Precio',
    engine: 'Motor',
    brand_color: 'Color de Marca',
    font: 'Fuente',
  }
};

export default function ScooterAdminDashboard({ 
  params,
}: { 
  params: Promise<{ hotel_id: string }>;
}) {
  const resolvedParams = use(params);
  const hotel_id = resolvedParams.hotel_id;
  
  const [dbBranding, setDbBranding] = useState<any>({name: null, color: null, logo: null, font: null, scooter_fleet: []});
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'reservations' | 'fleet' | 'settings'>('reservations');
  const [lang, setLang] = useState<Language>('nl');

  const t = translations[lang];

  useEffect(() => {
    getHotelBranding(hotel_id).then((data) => {
      setDbBranding(data);
    });

    const fetchBookings = async () => {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data: companyData } = await supabase
          .from('scooter_companies')
          .select('id, scooter_fleet')
          .eq('slug', hotel_id)
          .single();

        if (companyData) {
          if (companyData.scooter_fleet) {
            setDbBranding((prev: any) => ({ ...prev, scooter_fleet: companyData.scooter_fleet }));
          }
          
          const { data: bookingsData } = await supabase
            .from('scooter_bookings')
            .select('*')
            .eq('company_id', companyData.id)
            .order('created_at', { ascending: false });

          if (bookingsData) {
            setBookings(bookingsData);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [hotel_id]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 font-bold">Loading Dashboard...</div>;

  const brandName = dbBranding.name || 'Scooter Rentals';
  const brandLogo = dbBranding.logo || '';
  const font = dbBranding.font || 'Inter';
  const encodedFont = font.replace(/ /g, '+');
  const fleet = dbBranding.scooter_fleet || [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row h-screen overflow-hidden" style={{ fontFamily: font }}>
      <link href={`https://fonts.googleapis.com/css2?family=${encodedFont}:wght@400;500;600;700;800;900&display=swap`} rel="stylesheet" />
      
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-gray-900 text-white p-6 flex flex-col">
        <div className="mb-10 flex items-center gap-3">
          {brandLogo ? (
            <img src={brandLogo} alt="Logo" className="h-8 w-auto bg-white p-1 rounded" />
          ) : (
            <div className="w-8 h-8 rounded bg-gradient-to-tr from-green-400 to-green-600 flex items-center justify-center font-black">S</div>
          )}
          <h1 className="font-black tracking-wider text-sm uppercase opacity-90 truncate">{brandName}</h1>
        </div>
        
        <nav className="flex-1 space-y-2">
          <button onClick={() => setActiveTab('reservations')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-colors ${activeTab === 'reservations' ? 'bg-gray-800 text-green-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
            <span>📅</span> {t.sidebar_reservations}
          </button>
          <button onClick={() => setActiveTab('fleet')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-colors ${activeTab === 'fleet' ? 'bg-gray-800 text-green-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
            <span>🛵</span> {t.sidebar_fleet}
          </button>
          <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-colors ${activeTab === 'settings' ? 'bg-gray-800 text-green-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
            <span>⚙️</span> {t.sidebar_settings}
          </button>
        </nav>
        
        <Link href="/pitch" className="px-4 py-3 border border-gray-700 rounded-xl text-center font-bold text-xs text-gray-400 hover:bg-gray-800 transition-colors mt-8">
          {t.back_to_pitch}
        </Link>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 relative">
        
        {/* Language Selector */}
        <div className="absolute top-6 right-6 flex gap-2">
          {(['nl', 'en', 'es'] as Language[]).map((l) => (
            <button 
              key={l}
              onClick={() => setLang(l)}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs uppercase transition-all duration-300 ${lang === l ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'}`}
            >
              {l}
            </button>
          ))}
        </div>

        {activeTab === 'reservations' && (
          <div className="animate-in fade-in">
            <header className="mb-10 pr-40">
              <h2 className="text-3xl font-black text-gray-900 mb-1">{t.title_reservations}</h2>
              <p className="text-gray-500 font-medium">{t.subtitle_reservations}</p>
            </header>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xl mb-4">📅</div>
                <p className="text-gray-500 font-bold text-sm uppercase tracking-wider mb-1">{t.total_bookings}</p>
                <h3 className="text-4xl font-black text-gray-900">{bookings.length}</h3>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl mb-4">🛵</div>
                <p className="text-gray-500 font-bold text-sm uppercase tracking-wider mb-1">{t.active_road}</p>
                <h3 className="text-4xl font-black text-gray-900">{bookings.filter(b => b.status === 'active').length}</h3>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xl mb-4">⏱️</div>
                <p className="text-gray-500 font-bold text-sm uppercase tracking-wider mb-1">{t.pending}</p>
                <h3 className="text-4xl font-black text-gray-900">{bookings.filter(b => b.status === 'reserved').length}</h3>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">{t.recent_bookings}</h3>
                <button className="text-sm font-bold text-green-600 bg-green-50 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors">{t.export_csv}</button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">{t.col_customer}</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">{t.col_contact}</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">{t.col_scooter}</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">{t.col_date}</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">{t.col_status}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bookings.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-10 text-center text-gray-400 font-medium">
                          {t.no_reservations}
                        </td>
                      </tr>
                    ) : (
                      bookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-gray-900">{booking.guest_name}</div>
                            <div className="text-xs text-gray-500 font-mono mt-1">ID: {booking.id.split('-')[0]}</div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm font-medium text-gray-900">{booking.phone}</div>
                            <div className="text-xs text-gray-500">{booking.guest_email}</div>
                          </td>
                          <td className="p-4">
                            <div className="inline-block bg-gray-100 px-3 py-1 rounded-lg text-sm font-bold text-gray-700">
                              {booking.scooter_model}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm font-bold text-gray-900">{new Date(booking.start_date).toLocaleDateString()}</div>
                            <div className="text-xs text-gray-500">tot {new Date(booking.end_date).toLocaleDateString()}</div>
                          </td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                              booking.status === 'reserved' ? 'bg-orange-100 text-orange-700' :
                              booking.status === 'active' ? 'bg-blue-100 text-blue-700' :
                              booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'fleet' && (
          <div className="animate-in fade-in">
            <header className="mb-10 pr-40">
              <h2 className="text-3xl font-black text-gray-900 mb-1">{t.title_fleet}</h2>
              <p className="text-gray-500 font-medium">{t.subtitle_fleet}</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fleet.map((scooter: any, idx: number) => (
                <div key={idx} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="h-48 bg-gray-100 relative">
                    {scooter.image ? (
                      <img src={scooter.image} alt={scooter.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl">🛵</div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{scooter.name || 'Onbekende Scooter'}</h3>
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{t.engine}</p>
                        <p className="font-medium text-gray-900">{scooter.cc || '50cc'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{t.price}</p>
                        <p className="font-bold text-green-600">€{scooter.price || '0'}/dag</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {fleet.length === 0 && (
                <div className="col-span-full p-10 bg-white rounded-3xl border border-gray-100 text-center text-gray-500 font-medium">
                  Je hebt nog geen scooters toegevoegd aan je vloot. Gebruik de Pitch Editor om voertuigen toe te voegen!
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="animate-in fade-in">
            <header className="mb-10 pr-40">
              <h2 className="text-3xl font-black text-gray-900 mb-1">{t.title_settings}</h2>
              <p className="text-gray-500 font-medium">{t.subtitle_settings}</p>
            </header>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 max-w-2xl">
              <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100">
                <div className="w-24 h-24 bg-gray-50 rounded-2xl flex items-center justify-center p-2 border border-gray-200">
                  {brandLogo ? (
                    <img src={brandLogo} alt="Logo" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <span className="text-gray-400">Geen Logo</span>
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900">{brandName}</h3>
                  <p className="text-gray-500">viesa-scooters.vercel.app/{hotel_id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">{t.brand_color}</label>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full shadow-inner border border-gray-200" style={{ backgroundColor: dbBranding.color || '#00d2d3' }}></div>
                    <span className="font-mono text-gray-900 font-medium">{dbBranding.color || '#00d2d3'}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">{t.font}</label>
                  <span className="inline-block px-4 py-2 bg-gray-100 rounded-lg font-bold text-gray-900">{font}</span>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-gray-100">
                <p className="text-sm text-gray-500 italic">Opmerking: Om je instellingen, logo of vloot te wijzigen, gebruik je de Viesa Pitch Editor.</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
