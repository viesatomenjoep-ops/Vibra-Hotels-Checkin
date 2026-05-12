'use client';

import { useEffect, useState, use } from 'react';
import { getHotelBranding } from '@/actions/hotelBranding';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

export default function ScooterAdminDashboard({ 
  params,
}: { 
  params: Promise<{ hotel_id: string }>;
}) {
  const resolvedParams = use(params);
  const hotel_id = resolvedParams.hotel_id;
  
  const [dbBranding, setDbBranding] = useState<{name: string|null, color: string|null, logo: string|null, font: string|null}>({name: null, color: null, logo: null, font: null});
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
          .select('id')
          .eq('slug', hotel_id)
          .single();

        if (companyData) {
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

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: font }}>
      <link href={`https://fonts.googleapis.com/css2?family=${encodedFont}:wght@400;500;600;700;800;900&display=swap`} rel="stylesheet" />
      
      {/* Admin Sidebar & Header Structure */}
      <div className="flex flex-col md:flex-row h-screen overflow-hidden">
        
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
            <a href="#" className="flex items-center gap-3 px-4 py-3 bg-gray-800 rounded-xl font-bold text-sm text-green-400">
              <span>📅</span> Reserveringen
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
              <span>🛵</span> Mijn Vloot
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
              <span>⚙️</span> Instellingen
            </a>
          </nav>
          
          <Link href="/pitch" className="px-4 py-3 border border-gray-700 rounded-xl text-center font-bold text-xs text-gray-400 hover:bg-gray-800 transition-colors">
            ← Terug naar Viesa
          </Link>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <header className="mb-10 flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-black text-gray-900 mb-1">Overzicht Reserveringen</h2>
              <p className="text-gray-500 font-medium">Beheer al je actieve scooter verhuren</p>
            </div>
            <div className="flex gap-4">
              <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-sm font-bold text-gray-700">Live Connectie</span>
              </div>
            </div>
          </header>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xl mb-4">📅</div>
              <p className="text-gray-500 font-bold text-sm uppercase tracking-wider mb-1">Totaal Boekingen</p>
              <h3 className="text-4xl font-black text-gray-900">{bookings.length}</h3>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl mb-4">🛵</div>
              <p className="text-gray-500 font-bold text-sm uppercase tracking-wider mb-1">Actief op weg</p>
              <h3 className="text-4xl font-black text-gray-900">{bookings.filter(b => b.status === 'active').length}</h3>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xl mb-4">⏱️</div>
              <p className="text-gray-500 font-bold text-sm uppercase tracking-wider mb-1">In afwachting</p>
              <h3 className="text-4xl font-black text-gray-900">{bookings.filter(b => b.status === 'reserved').length}</h3>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Recente Boekingen</h3>
              <button className="text-sm font-bold text-green-600 bg-green-50 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors">Exporteren (CSV)</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Klant</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Contact</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Scooter</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Datum (Van - Tot)</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-10 text-center text-gray-400 font-medium">
                        Geen reserveringen gevonden in de database.
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
      </div>
    </div>
  );
}
