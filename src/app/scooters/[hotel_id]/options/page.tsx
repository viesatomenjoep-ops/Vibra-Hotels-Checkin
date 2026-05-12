'use client';

import { useEffect, useState, use } from 'react';
import { getHotelBranding } from '@/actions/hotelBranding';
import Link from 'next/link';

export default function ScooterOptionsPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ hotel_id: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams);
  const hotel_id = resolvedParams.hotel_id;
  
  const scooterName = resolvedSearchParams.scooter || 'Vespa Primavera';
  const scooterPrice = parseInt(resolvedSearchParams.price || '35');
  const days = 7; // Mocked for demo
  const baseTotal = scooterPrice * days;
  
  const [dbBranding, setDbBranding] = useState<{name: string|null, color: string|null, logo: string|null, font: string|null}>({name: null, color: null, logo: null, font: null});
  const [isLoading, setIsLoading] = useState(true);

  const [insurance, setInsurance] = useState('basic');
  const [extraHelmet, setExtraHelmet] = useState(false);

  useEffect(() => {
    getHotelBranding(hotel_id).then((data) => {
      setDbBranding(data);
      setIsLoading(false);
    });
  }, [hotel_id]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 font-bold">Loading...</div>;

  const brandName = dbBranding.name || 'Ibiza Scooters';
  const brandLogo = dbBranding.logo || '';
  const brandColor = dbBranding.color || '#00d2d3';
  const font = dbBranding.font || 'Inter';
  const encodedFont = font.replace(/ /g, '+');

  const insuranceCost = insurance === 'premium' ? 15 * days : 0;
  const helmetCost = extraHelmet ? 5 * days : 0;
  const finalTotal = baseTotal + insuranceCost + helmetCost;

  return (
    <div className="min-h-screen bg-gray-50 pb-32" style={{ fontFamily: font }}>
      <link href={`https://fonts.googleapis.com/css2?family=${encodedFont}:wght@400;500;600;700;800;900&display=swap`} rel="stylesheet" />
      
      {/* Header */}
      <div className="bg-white px-6 py-6 border-b border-gray-100 sticky top-0 z-50 shadow-sm flex items-center gap-4">
        <Link href={`/scooters/${hotel_id}`} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold hover:bg-gray-200 transition-colors">
          ←
        </Link>
        {brandLogo ? (
          <img src={brandLogo} alt="Logo" className="h-8 w-auto object-contain" />
        ) : (
          <h1 className="text-xl font-black text-gray-900">{brandName}</h1>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8">
        
        {/* Progress Bar */}
        <div className="flex justify-between items-center mb-10 px-4">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: brandColor }}>1</div>
            <span className="text-xs font-bold text-gray-900">Vehicle</span>
          </div>
          <div className="flex-1 h-1 mx-4 bg-gray-200 rounded"><div className="h-full rounded" style={{ backgroundColor: brandColor, width: '100%' }}></div></div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: brandColor }}>2</div>
            <span className="text-xs font-bold text-gray-900">Options</span>
          </div>
          <div className="flex-1 h-1 mx-4 bg-gray-200 rounded"></div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 text-gray-500 font-bold">3</div>
            <span className="text-xs font-bold text-gray-400">Checkout</span>
          </div>
        </div>

        <h2 className="text-3xl font-black text-gray-900 mb-6">Customize your ride</h2>
        
        <div className="flex flex-col md:flex-row gap-8">
          
          <div className="flex-1 space-y-6">
            {/* Insurance Options */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Insurance Coverage</h3>
              
              <div 
                onClick={() => setInsurance('basic')}
                className={`p-4 rounded-2xl border-2 mb-4 cursor-pointer transition-all ${insurance === 'basic' ? 'border-gray-900 bg-gray-50' : 'border-gray-100 hover:border-gray-300'}`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-gray-900">Basic Insurance</span>
                  <span className="font-bold text-gray-500">Included</span>
                </div>
                <p className="text-sm text-gray-500">Third-party liability. Deductible: €500.</p>
              </div>

              <div 
                onClick={() => setInsurance('premium')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${insurance === 'premium' ? 'shadow-md' : 'border-gray-100 hover:border-gray-300'}`}
                style={insurance === 'premium' ? { borderColor: brandColor, backgroundColor: `${brandColor}10` } : {}}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-gray-900">Premium Full Cover</span>
                  <span className="font-bold" style={{ color: brandColor }}>+€15 / day</span>
                </div>
                <p className="text-sm text-gray-500">Zero deductible. Covers theft, scratches, and tires.</p>
              </div>
            </div>

            {/* Extras */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Add-ons</h3>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">🪖</span>
                  <div>
                    <p className="font-bold text-gray-900">Extra Helmet (Passenger)</p>
                    <p className="text-sm text-gray-500">€5 / day</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={extraHelmet} onChange={(e) => setExtraHelmet(e.target.checked)} />
                  <div className={`w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all`} style={extraHelmet ? { backgroundColor: brandColor } : {}}></div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full md:w-80">
            <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 sticky top-32">
              <h3 className="text-lg font-black text-gray-900 mb-4">Summary</h3>
              
              <div className="flex gap-4 mb-6">
                <div className="h-16 w-16 bg-gray-100 rounded-xl flex items-center justify-center text-3xl">🛵</div>
                <div>
                  <p className="font-bold text-gray-900">{scooterName}</p>
                  <p className="text-xs text-gray-500">12 - 19 Aug 2026 ({days} days)</p>
                </div>
              </div>

              <div className="space-y-3 mb-6 pb-6 border-b border-gray-100 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Rental ({days} days)</span>
                  <span className="font-bold text-gray-900">€{baseTotal}</span>
                </div>
                {insuranceCost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Premium Insurance</span>
                    <span className="font-bold text-gray-900">€{insuranceCost}</span>
                  </div>
                )}
                {helmetCost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Extra Helmet</span>
                    <span className="font-bold text-gray-900">€{helmetCost}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-gray-500 uppercase text-xs tracking-wider">Total</span>
                <span className="text-2xl font-black text-gray-900">€{finalTotal}</span>
              </div>

              <Link 
                href={`/scooters/${hotel_id}/checkout?scooter=${encodeURIComponent(scooterName)}&total=${finalTotal}`}
                className="block w-full py-4 text-center text-white font-bold rounded-xl shadow-lg hover:brightness-110 transition-all" 
                style={{ backgroundColor: brandColor }}
              >
                Continue to Checkout
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
