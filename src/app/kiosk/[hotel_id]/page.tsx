'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState, use } from 'react';
import { translations, Language } from '@/lib/translations';
import Link from 'next/link';
import { getHotelBranding } from '@/actions/hotelBranding';

export default function KioskPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ hotel_id: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams);
  
  const hotel_id = resolvedParams.hotel_id;
  const [dbBranding, setDbBranding] = useState<{name: string|null, color: string|null, logo: string|null, font: string|null}>({name: null, color: null, logo: null, font: null});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getHotelBranding(hotel_id).then((data) => {
      setDbBranding(data);
      setIsLoading(false);
    });
  }, [hotel_id]);

  const brandName = resolvedSearchParams.name || dbBranding.name || 'Viesa Check-in Hotels';
  const brandLogo = resolvedSearchParams.logo || dbBranding.logo || '/vibra-logo.svg';
  
  let baseColor = '#00d2d3';
  if (resolvedSearchParams.color) {
    baseColor = `#${resolvedSearchParams.color}`;
  } else if (dbBranding.color) {
    baseColor = dbBranding.color;
  }
  const brandColorHex = baseColor;
  const brandHoverHex = brandColorHex;
  const brandFont = dbBranding.font || 'Inter';
  const encodedFont = brandFont.replace(/ /g, '+');

  const [url, setUrl] = useState('');
  const [language, setLanguage] = useState<Language>('en');

  const t = translations[language];

  useEffect(() => {
    // Dynamically generate the URL based on the current domain
    const host = window.location.origin;
    // Pass all branding params
    const encodedLogo = encodeURIComponent(brandLogo);
    const encodedName = encodeURIComponent(brandName);
    const hexColor = brandColorHex.replace('#', '');
    
    setUrl(`${host}/check-in/${hotel_id}?lang=${language}&color=${hexColor}&name=${encodedName}&logo=${encodedLogo}`);
  }, [hotel_id, language, brandLogo, brandName, brandColorHex]);

  const languages = [
    { code: 'en', short: 'EN' },
    { code: 'es', short: 'ES' },
    { code: 'de', short: 'DE' },
    { code: 'nl', short: 'NL' },
    { code: 'it', short: 'IT' },
    { code: 'pt', short: 'PT' }
  ] as const;

  if (isLoading) {
    return <div className="min-h-screen bg-white"></div>;
  }

  return (
    <>
      <link href={`https://fonts.googleapis.com/css2?family=${encodedFont}:wght@400;500;600;700;800;900&display=swap`} rel="stylesheet" />
      <div 
        style={{ 
          '--brand-color': brandColorHex,
          '--brand-hover': brandHoverHex,
          fontFamily: `'${brandFont}', sans-serif`
        } as React.CSSProperties}
        className="min-h-screen bg-[var(--brand-color)] flex flex-col items-center justify-center p-8 relative"
      >

      <div className="absolute top-6 left-6 z-10">
        <Link href="/pitch" className="flex items-center gap-2 text-white bg-black/20 hover:bg-black/40 px-4 py-2 rounded-lg font-medium transition-all backdrop-blur-sm border border-white/10">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Back to Editor
        </Link>
      </div>

      <div className="w-full max-w-5xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px] border-4 border-[var(--brand-hover)]/20 relative z-0">
        
        {/* Left Side: Branding & Instructions */}
        <div className="flex-1 p-12 md:p-16 flex flex-col justify-center bg-[var(--brand-color)] text-white">
          <div className="bg-white p-4 rounded-2xl inline-block mb-8 self-start shadow-md">
            <img src={brandLogo} alt={brandName} className={`h-20 w-auto object-contain ${brandLogo === '/vibra-logo.svg' ? 'brightness-0 invert' : ''}`} />
          </div>
          <h2 className="text-3xl font-bold mb-4">{t.kiosk_title}</h2>
          <p className="text-xl text-white/90 mb-10 leading-relaxed font-medium">
            {t.kiosk_subtitle}
          </p>
          <div className="space-y-6">
            <div className="flex items-center gap-5 text-white">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-xl border border-white/30">1</div>
              <p className="text-xl font-bold">{t.kiosk_step1}</p>
            </div>
            <div className="flex items-center gap-5 text-white">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-xl border border-white/30">2</div>
              <p className="text-xl font-bold">{t.kiosk_step2}</p>
            </div>
            <div className="flex items-center gap-5 text-white">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-xl border border-white/30">3</div>
              <p className="text-xl font-bold">{t.kiosk_step3}</p>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-white/20">
            <Link 
              href={`/check-in/${hotel_id}?lang=${language}`}
              className="inline-block bg-white text-[var(--brand-color)] border-2 border-white hover:bg-gray-100 hover:text-[var(--brand-color)] px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-sm"
            >
              {t.kiosk_manual_button}
            </Link>
          </div>
        </div>

        {/* Right Side: QR Code */}
        <div className="flex-1 bg-gray-50/50 p-12 md:p-16 flex flex-col items-center justify-center border-l border-[var(--brand-color)]/20 relative">
          
          {/* Language Selector Above QR */}
          <div className="flex gap-3 mb-10 bg-white p-2 rounded-full shadow-sm border border-[var(--brand-color)]/20">
            {languages.map((lang) => (
              <button 
                key={lang.code}
                onClick={() => setLanguage(lang.code as Language)}
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${language === lang.code ? 'bg-[var(--brand-color)] text-white shadow-md scale-110' : 'bg-transparent text-[var(--brand-color)]/60 hover:bg-[var(--brand-color)]/10 hover:text-[var(--brand-color)]'}`}
              >
                {lang.short}
              </button>
            ))}
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,210,211,0.2)] border border-[var(--brand-color)]/30 transform transition-transform hover:scale-105 duration-500">
            {url ? (
              <QRCodeSVG 
                value={url} 
                size={320} 
                fgColor={brandColorHex}
              />
            ) : (
              <div className="w-[320px] h-[320px] bg-[var(--brand-color)]/10 animate-pulse rounded-xl"></div>
            )}
          </div>
          <p className="mt-8 text-[var(--brand-color)] font-bold tracking-widest uppercase text-lg opacity-80 text-center">{t.kiosk_scan_here}</p>
        </div>
        
      </div>
    </div>
    </>
  );
}
