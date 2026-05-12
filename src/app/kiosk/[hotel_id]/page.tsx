'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';

export default function KioskPage({ params }: { params: { hotel_id: string } }) {
  const [url, setUrl] = useState('');

  useEffect(() => {
    // Dynamically generate the URL based on the current domain
    const host = window.location.origin;
    setUrl(`${host}/check-in/${params.hotel_id}`);
  }, [params.hotel_id]);

  return (
    <div className="min-h-screen bg-[#00d2d3] flex flex-col items-center justify-center p-8 font-sans">
      <div className="w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px] border-4 border-[#00b5b6]/20">
        
        {/* Left Side: Branding & Instructions */}
        <div className="flex-1 p-12 md:p-16 flex flex-col justify-center bg-gradient-to-br from-white to-cyan-50">
          <img src="/vibra-logo.svg" alt="Vibra Hotels Logo" className="h-24 w-auto mb-8" />
          <h2 className="text-3xl font-bold text-[#00d2d3] mb-4">Fast & Digital Check-in</h2>
          <p className="text-xl text-[#00d2d3]/80 mb-10 leading-relaxed font-medium">
            Scan de QR code met de camera van uw smartphone om in te checken. Uw telefoon vult automatisch uw gegevens in!
          </p>
          <div className="space-y-6">
            <div className="flex items-center gap-5 text-[#00d2d3]">
              <div className="w-10 h-10 rounded-full bg-[#00d2d3]/20 flex items-center justify-center text-[#00d2d3] font-bold text-xl border border-[#00d2d3]/30">1</div>
              <p className="text-xl font-bold">Open uw camera</p>
            </div>
            <div className="flex items-center gap-5 text-[#00d2d3]">
              <div className="w-10 h-10 rounded-full bg-[#00d2d3]/20 flex items-center justify-center text-[#00d2d3] font-bold text-xl border border-[#00d2d3]/30">2</div>
              <p className="text-xl font-bold">Scan de code</p>
            </div>
            <div className="flex items-center gap-5 text-[#00d2d3]">
              <div className="w-10 h-10 rounded-full bg-[#00d2d3]/20 flex items-center justify-center text-[#00d2d3] font-bold text-xl border border-[#00d2d3]/30">3</div>
              <p className="text-xl font-bold">Onderteken & Geniet</p>
            </div>
          </div>
        </div>

        {/* Right Side: QR Code */}
        <div className="flex-1 bg-cyan-50/30 p-12 md:p-16 flex flex-col items-center justify-center border-l border-[#00d2d3]/20">
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
          <p className="mt-8 text-[#00d2d3] font-bold tracking-widest uppercase text-lg opacity-80">Point camera here</p>
        </div>
        
      </div>
    </div>
  );
}
