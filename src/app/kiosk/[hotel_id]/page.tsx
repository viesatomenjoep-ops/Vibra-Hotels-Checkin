'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState, use } from 'react';
import { translations, Language } from '@/lib/translations';
import Link from 'next/link';

export default function KioskPage({ params }: { params: Promise<{ hotel_id: string }> }) {
  const resolvedParams = use(params);
  const hotel_id = resolvedParams.hotel_id;
  const [url, setUrl] = useState('');
  const [language, setLanguage] = useState<Language>('en');

  const t = translations[language];

  useEffect(() => {
    // Dynamically generate the URL based on the current domain
    const host = window.location.origin;
    // Pass the language query param so the phone opens in the selected language
    setUrl(`${host}/check-in/${hotel_id}?lang=${language}`);
  }, [hotel_id, language]);

  const languages = [
    { code: 'en', short: 'EN' },
    { code: 'es', short: 'ES' },
    { code: 'de', short: 'DE' },
    { code: 'nl', short: 'NL' },
    { code: 'it', short: 'IT' },
    { code: 'pt', short: 'PT' }
  ] as const;

  return (
    <div className="min-h-screen bg-[#00d2d3] flex flex-col items-center justify-center p-8 font-sans relative">

      <div className="w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px] border-4 border-[#00b5b6]/20 relative">
        
        {/* Left Side: Branding & Instructions */}
        <div className="flex-1 p-12 md:p-16 flex flex-col justify-center bg-gradient-to-br from-white to-cyan-50">
          <img src="/vibra-logo.svg" alt="Vibra Hotels Logo" className="h-24 w-auto mb-8 origin-left" />
          <h2 className="text-3xl font-bold text-[#00d2d3] mb-4">{t.kiosk_title}</h2>
          <p className="text-xl text-[#00d2d3]/80 mb-10 leading-relaxed font-medium">
            {t.kiosk_subtitle}
          </p>
          <div className="space-y-6">
            <div className="flex items-center gap-5 text-[#00d2d3]">
              <div className="w-10 h-10 rounded-full bg-[#00d2d3]/20 flex items-center justify-center text-[#00d2d3] font-bold text-xl border border-[#00d2d3]/30">1</div>
              <p className="text-xl font-bold">{t.kiosk_step1}</p>
            </div>
            <div className="flex items-center gap-5 text-[#00d2d3]">
              <div className="w-10 h-10 rounded-full bg-[#00d2d3]/20 flex items-center justify-center text-[#00d2d3] font-bold text-xl border border-[#00d2d3]/30">2</div>
              <p className="text-xl font-bold">{t.kiosk_step2}</p>
            </div>
            <div className="flex items-center gap-5 text-[#00d2d3]">
              <div className="w-10 h-10 rounded-full bg-[#00d2d3]/20 flex items-center justify-center text-[#00d2d3] font-bold text-xl border border-[#00d2d3]/30">3</div>
              <p className="text-xl font-bold">{t.kiosk_step3}</p>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-[#00d2d3]/10">
            <Link 
              href={`/check-in/${hotel_id}?lang=${language}`}
              className="inline-block bg-white text-[#00d2d3] border-2 border-[#00d2d3] hover:bg-[#00d2d3] hover:text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-sm"
            >
              {t.kiosk_manual_button}
            </Link>
          </div>
        </div>

        {/* Right Side: QR Code */}
        <div className="flex-1 bg-cyan-50/30 p-12 md:p-16 flex flex-col items-center justify-center border-l border-[#00d2d3]/20 relative">
          
          {/* Language Selector Above QR */}
          <div className="flex gap-3 mb-10 bg-white p-2 rounded-full shadow-sm border border-[#00d2d3]/20">
            {languages.map((lang) => (
              <button 
                key={lang.code}
                onClick={() => setLanguage(lang.code as Language)}
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${language === lang.code ? 'bg-[#00d2d3] text-white shadow-md scale-110' : 'bg-transparent text-[#00d2d3]/60 hover:bg-[#00d2d3]/10 hover:text-[#00d2d3]'}`}
              >
                {lang.short}
              </button>
            ))}
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,210,211,0.2)] border border-[#00d2d3]/30 transform transition-transform hover:scale-105 duration-500">
            {url ? (
              <QRCodeSVG 
                value={url} 
                size={320} 
                fgColor="#00d2d3"
              />
            ) : (
              <div className="w-[320px] h-[320px] bg-[#00d2d3]/10 animate-pulse rounded-xl"></div>
            )}
          </div>
          <p className="mt-8 text-[#00d2d3] font-bold tracking-widest uppercase text-lg opacity-80 text-center">{t.kiosk_scan_here}</p>
        </div>
        
      </div>
    </div>
  );
}
