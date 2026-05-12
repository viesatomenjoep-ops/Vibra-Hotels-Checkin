'use client';

import { useEffect, useState, use } from 'react';
import { getHotelBranding } from '@/actions/hotelBranding';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ScooterBookingPage({ 
  params,
}: { 
  params: Promise<{ hotel_id: string }>;
}) {
  const resolvedParams = use(params);
  const hotel_id = resolvedParams.hotel_id;
  const router = useRouter();
  
  const [dbBranding, setDbBranding] = useState<{name: string|null, color: string|null, logo: string|null, font: string|null, scooter_fleet: any[]}>({name: null, color: null, logo: null, font: null, scooter_fleet: []});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getHotelBranding(hotel_id).then((data) => {
      setDbBranding(data as any);
      setIsLoading(false);
    });
  }, [hotel_id]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 font-bold">Loading...</div>;

  const brandName = dbBranding.name || 'Ibiza Scooters';
  const brandLogo = dbBranding.logo || '';
  const brandColor = dbBranding.color || '#00d2d3';
  const font = dbBranding.font || 'Inter';
  const encodedFont = font.replace(/ /g, '+');
  
  // Default fallback if array is empty
  const fleet = dbBranding.scooter_fleet?.length > 0 ? dbBranding.scooter_fleet : [
    { id: '1', name: 'Vespa Primavera', cc: '125cc', price: '35' },
    { id: '2', name: 'Honda PCX', cc: '125cc', price: '28' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20" style={{ fontFamily: font }}>
      <link href={`https://fonts.googleapis.com/css2?family=${encodedFont}:wght@400;500;600;700;800;900&display=swap`} rel="stylesheet" />
      
      {/* Header */}
      <div className="bg-white px-6 py-6 border-b border-gray-100 sticky top-0 z-50 shadow-sm flex items-center justify-between">
        {brandLogo ? (
          <img src={brandLogo} alt="Logo" className="h-10 w-auto object-contain" />
        ) : (
          <h1 className="text-2xl font-black text-gray-900">{brandName}</h1>
        )}
        
        <div className="flex gap-2">
          <span className="font-bold text-sm bg-gray-100 px-3 py-1.5 rounded-full text-gray-600">🇬🇧 EN</span>
          <span className="font-bold text-sm bg-gray-100 px-3 py-1.5 rounded-full text-gray-600">🇪🇸 ES</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8">
        {/* Search Bar Mockup */}
        <div className="bg-white p-4 rounded-2xl shadow-lg flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Pick-up Date</label>
            <input type="date" defaultValue="2026-08-12" className="w-full font-medium text-gray-900 bg-gray-50 p-3 rounded-lg outline-none" />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Return Date</label>
            <input type="date" defaultValue="2026-08-19" className="w-full font-medium text-gray-900 bg-gray-50 p-3 rounded-lg outline-none" />
          </div>
          <button className="px-8 py-3 text-white font-bold rounded-xl shadow-lg hover:brightness-110 transition-all sm:self-end h-[48px]" style={{ backgroundColor: brandColor }}>
            Search
          </button>
        </div>

        <h2 className="text-3xl font-black text-gray-900 mb-6">Select your scooter</h2>
        
        {/* Fleet Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fleet.map((scooter: any) => (
            <div key={scooter.id} className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden flex flex-col transition-transform hover:-translate-y-1 hover:shadow-xl duration-300">
              <div className="h-48 bg-gray-100 relative flex items-center justify-center">
                <span className="text-7xl">🛵</span>
                <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">Available</div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 mb-1">{scooter.name}</h3>
                  <div className="flex gap-2 mb-4">
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">{scooter.cc}</span>
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">Automatic</span>
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">2 Helmets</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-end mt-4 pt-4 border-t border-gray-100">
                  <div>
                    <span className="text-sm text-gray-500 font-bold">From</span>
                    <div className="text-3xl font-black" style={{ color: brandColor }}>€{scooter.price} <span className="text-base text-gray-400 font-medium">/ day</span></div>
                  </div>
                  <Link 
                    href={`/scooters/${hotel_id}/options?scooter=${encodeURIComponent(scooter.name)}&price=${scooter.price}`}
                    className="px-6 py-3 text-white font-bold rounded-xl shadow-md hover:brightness-110 transition-all" 
                    style={{ backgroundColor: brandColor }}
                  >
                    Reserve Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
