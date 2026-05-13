'use client';

import { useEffect, useState, use } from 'react';
import { getHotelBranding } from '@/actions/hotelBranding';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

export default function ScooterCheckoutPage({ 
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
  const totalAmount = parseInt(resolvedSearchParams.total || '245');
  
  const [dbBranding, setDbBranding] = useState<{name: string|null, color: string|null, logo: string|null, font: string|null}>({name: null, color: null, logo: null, font: null});
  const [isLoading, setIsLoading] = useState(true);
  
  const [guestName, setGuestName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

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

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Get actual company uuid from slug
      const { data: companyData } = await supabase
        .from('scooter_companies')
        .select('id')
        .eq('slug', hotel_id)
        .single();

      if (companyData) {
        await supabase
          .from('scooter_bookings')
          .insert({
            company_id: companyData.id,
            guest_name: guestName,
            guest_email: email,
            phone: phone,
            scooter_model: scooterName,
            start_date: '2026-08-12',
            end_date: '2026-08-19',
            pickup_time: '10:00 AM',
            status: 'reserved'
          });
      }
      
      // Create a checkout session using the central payment module
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: companyData?.id,
          customerEmail: email,
          items: [{
            name: scooterName,
            description: `Huurperiode: 2026-08-12 t/m 2026-08-19`,
            price: totalAmount,
            quantity: 1
          }],
          successUrl: `${window.location.origin}/public/scooters/${hotel_id}/checkout?success=true`,
          cancelUrl: `${window.location.origin}/public/scooters/${hotel_id}/checkout?canceled=true`
        })
      });
      
      const session = await res.json();
      if (session.url) {
        window.location.href = session.url; // Redirect to Stripe
      } else {
        throw new Error(session.error || 'Betaalfout');
      }
      
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  // Listen to URL for success
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success')) {
      setSuccess(true);
    }
  }, []);

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" style={{ fontFamily: font }}>
        <link href={`https://fonts.googleapis.com/css2?family=${encodedFont}:wght@400;500;600;700;800;900&display=swap`} rel="stylesheet" />
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl text-center max-w-md w-full border border-gray-100">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl bg-green-50">✅</div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-500 mb-8">Your {scooterName} is reserved for August 12. We sent the confirmation to {email}.</p>
          
          <div className="bg-gray-50 p-4 rounded-2xl mb-8">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Booking ID</p>
            <p className="font-mono text-lg font-bold tracking-widest text-gray-900">IBZ-{Math.floor(Math.random()*10000)}</p>
          </div>

          <Link href={`/pitch`} className="font-bold text-gray-500 hover:text-gray-900 transition-colors">
            Return to Editor
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32" style={{ fontFamily: font }}>
      <link href={`https://fonts.googleapis.com/css2?family=${encodedFont}:wght@400;500;600;700;800;900&display=swap`} rel="stylesheet" />
      
      {/* Header */}
      <div className="bg-white px-6 py-6 border-b border-gray-100 sticky top-0 z-50 shadow-sm flex items-center gap-4">
        <button onClick={() => window.history.back()} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold hover:bg-gray-200 transition-colors">
          ←
        </button>
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
          <div className="flex-1 h-1 mx-4 bg-gray-200 rounded"><div className="h-full rounded" style={{ backgroundColor: brandColor, width: '100%' }}></div></div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: brandColor }}>3</div>
            <span className="text-xs font-bold text-gray-900">Checkout</span>
          </div>
        </div>

        <h2 className="text-3xl font-black text-gray-900 mb-6">Complete Reservation</h2>
        
        <div className="flex flex-col md:flex-row gap-8">
          
          <form onSubmit={handleCheckout} className="flex-1 space-y-6">
            
            {/* Driver Details */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Driver Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                  <input required type="text" value={guestName} onChange={e=>setGuestName(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none" placeholder="John Doe" />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                    <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none" placeholder="john@example.com" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                    <input required type="tel" value={phone} onChange={e=>setPhone(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none" placeholder="+31 6 12345678" />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method (Stripe Mockup) */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Payment Method</h3>
                <div className="flex gap-2 text-2xl">💳</div>
              </div>
              
              <div className="space-y-4">
                {/* Credit Card Mockup */}
                <div className="p-4 rounded-2xl border-2 border-gray-900 bg-gray-50 relative overflow-hidden">
                  <div className="absolute right-[-20px] top-[-20px] text-8xl opacity-5">💳</div>
                  <div className="flex items-center gap-3 mb-4">
                    <input type="radio" checked readOnly className="w-5 h-5 accent-gray-900" />
                    <span className="font-bold text-gray-900">Credit Card</span>
                  </div>
                  <div className="space-y-3">
                    <input type="text" placeholder="Card Number" className="w-full p-3 bg-white border border-gray-200 rounded-lg text-sm" />
                    <div className="flex gap-3">
                      <input type="text" placeholder="MM/YY" className="w-full p-3 bg-white border border-gray-200 rounded-lg text-sm" />
                      <input type="text" placeholder="CVC" className="w-full p-3 bg-white border border-gray-200 rounded-lg text-sm" />
                    </div>
                  </div>
                </div>

                {/* iDEAL Mockup */}
                <div className="p-4 rounded-2xl border-2 border-gray-100 hover:border-gray-300 transition-colors flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input type="radio" disabled className="w-5 h-5" />
                    <span className="font-bold text-gray-500">iDEAL (Dutch Banks)</span>
                  </div>
                </div>
                
                {/* Apple Pay Mockup */}
                <div className="p-4 rounded-2xl border-2 border-gray-100 hover:border-gray-300 transition-colors flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input type="radio" disabled className="w-5 h-5" />
                    <span className="font-bold text-gray-500">Apple Pay</span>
                  </div>
                  <span className="text-xl"></span>
                </div>

              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 text-white font-black rounded-2xl shadow-xl hover:brightness-110 transition-all text-xl disabled:opacity-50" 
              style={{ backgroundColor: brandColor }}
            >
              {isSubmitting ? 'Doorverwijzen naar betaling...' : `Betaal €${totalAmount} via Stripe`}
            </button>
            <p className="text-center text-xs text-gray-400 mt-4 font-bold flex items-center justify-center gap-2">
              <span>🔒</span> Secured by Stripe
            </p>
          </form>

          {/* Order Summary Sidebar */}
          <div className="w-full md:w-80">
            <div className="bg-gray-900 p-6 rounded-3xl shadow-xl sticky top-32 text-white">
              <h3 className="text-lg font-black mb-6">Booking Overview</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Vehicle</p>
                  <p className="font-bold">{scooterName}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Pick-up</p>
                  <p className="font-bold">Aug 12, 2026 - 10:00 AM</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Return</p>
                  <p className="font-bold">Aug 19, 2026 - 10:00 AM</p>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-800 flex justify-between items-center">
                <span className="text-gray-400">Total to pay</span>
                <span className="text-3xl font-black" style={{ color: brandColor }}>€{totalAmount}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
