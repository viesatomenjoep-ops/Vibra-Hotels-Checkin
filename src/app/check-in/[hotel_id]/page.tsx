'use client';

import { useState, useRef } from 'react';
import { processCheckin } from '@/actions/submitCheckin';
import { CheckCircle, Globe, Eraser, Camera } from 'lucide-react';
import { translations, Language } from '@/lib/translations';
import dynamic from 'next/dynamic';
import PassportScanner from '@/components/PassportScanner';

// Dynamic import to prevent SSR issues with canvas
const SignatureCanvas = dynamic(() => import('react-signature-canvas'), { ssr: false });

export default function CheckInPage({ params }: { params: { hotel_id: string } }) {
  const [step, setStep] = useState(0); // 0=Lang, 1=Scan, 2=Form, 4=Success
  const [language, setLanguage] = useState<Language>('en');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannedData, setScannedData] = useState<{firstName?: string, lastName?: string, country?: string}>({});
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sigCanvas = useRef<any>(null);

  // Originele Turquoise/Lichtblauwe Kleur
  const theme = {
    primary: 'bg-[#00d2d3]', 
    primaryHover: 'hover:bg-[#00b5b6]',
    accent: 'text-[#00d2d3]', 
  };

  const t = translations[language];

  const handleAction = async (formData: FormData) => {
    setError(null);
    if (sigCanvas.current?.isEmpty()) {
      setError('Vul alstublieft uw handtekening in. / Please provide your signature.');
      return;
    }

    setIsSubmitting(true);
    formData.append('hotelId', params.hotel_id);
    
    // Get actual base64 signature
    const signatureBase64 = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
    formData.append('signature', signatureBase64);
    
    const result = await processCheckin(formData);
    if (result.success) {
      setStep(4); // Success step
    } else {
      setError(result.message);
    }
    setIsSubmitting(false);
  };

  const selectLanguage = (lang: Language) => {
    setLanguage(lang);
    setStep(1); // Go to scanner step
  };

  const clearSignature = () => {
    sigCanvas.current?.clear();
  };

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', label: 'Português', flag: '🇵🇹' }
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans text-[#00d2d3]">
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl overflow-hidden">
        
        {/* Header */}
        {step > 0 && (
          <div className={`${theme.primary} p-6 md:p-10 text-center text-white`}>
            <img src="/vibra-logo.svg" alt="Vibra Hotels Logo" className="h-12 w-auto mx-auto brightness-0 invert" />
            <p className="mt-2 text-lg opacity-90">{t.header_subtitle}</p>
          </div>
        )}

        {/* Content Area */}
        <div className={step === 0 ? "p-8 md:p-16 bg-gradient-to-br from-white via-cyan-50/30 to-white" : "p-6 md:p-10"}>
          
          {step === 0 && (
            <div className="space-y-8 text-center animate-in fade-in zoom-in-95 duration-500">
              <div className="flex flex-col items-center justify-center space-y-4 mb-8">
                <img src="/vibra-logo.svg" alt="Vibra Hotels Logo" className="h-20 w-auto mx-auto mb-2" />
                <p className="text-xl text-[#00d2d3] font-medium opacity-80">Please select your language</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {languages.map((lang) => (
                  <button 
                    key={lang.code}
                    onClick={() => selectLanguage(lang.code as Language)}
                    className="flex items-center gap-5 p-4 w-full bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,210,211,0.1)] hover:shadow-[0_8px_30px_rgb(0,210,211,0.3)] hover:-translate-y-1 transition-all duration-300 border border-[#00d2d3]/20 hover:border-[#00d2d3]/80 group"
                  >
                    <div className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center bg-cyan-50 shadow-inner group-hover:scale-110 transition-transform duration-300 flex-shrink-0 border border-[#00d2d3]/20">
                      <span className="text-4xl scale-[1.4] origin-center">{lang.flag}</span>
                    </div>
                    <span className="text-xl font-bold text-[#00d2d3]">{lang.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6 text-center animate-in fade-in slide-in-from-right-4">
              <h2 className="text-2xl font-semibold text-[#00d2d3]">{t.welcome_title}</h2>
              <p className="text-[#00d2d3]/80">{t.welcome_subtitle}</p>
              
              <PassportScanner 
                t={t}
                onScanComplete={(data) => {
                  setScannedData(data);
                  setStep(2);
                }}
                onCancel={() => setStep(2)}
              />
              
              <p className="text-sm text-[#00d2d3]/60 mt-6 border-t border-[#00d2d3]/20 pt-4">{t.privacy_note}</p>
            </div>
          )}

          {step === 2 && (
            <form action={handleAction} className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-2xl font-semibold text-[#00d2d3] border-b border-[#00d2d3]/20 pb-4">{t.personal_details}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#00d2d3]">{t.first_name}</label>
                  <input type="text" name="firstName" defaultValue={scannedData.firstName} autoComplete="given-name" required className="mt-1 block w-full rounded-lg border-[#00d2d3]/30 shadow-sm p-3 border focus:ring-[#00d2d3] focus:border-[#00d2d3] text-gray-800" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#00d2d3]">{t.last_name}</label>
                  <input type="text" name="lastName" defaultValue={scannedData.lastName} autoComplete="family-name" required className="mt-1 block w-full rounded-lg border-[#00d2d3]/30 shadow-sm p-3 border focus:ring-[#00d2d3] focus:border-[#00d2d3] text-gray-800" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#00d2d3]">{t.email}</label>
                  <input type="email" name="email" autoComplete="email" required className="mt-1 block w-full rounded-lg border-[#00d2d3]/30 shadow-sm p-3 border focus:ring-[#00d2d3] focus:border-[#00d2d3] text-gray-800" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#00d2d3]">{t.phone}</label>
                  <input type="tel" name="phone" autoComplete="tel" required className="mt-1 block w-full rounded-lg border-[#00d2d3]/30 shadow-sm p-3 border focus:ring-[#00d2d3] focus:border-[#00d2d3] text-gray-800" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#00d2d3]">{t.street_address}</label>
                  <input type="text" name="address" autoComplete="street-address" required className="mt-1 block w-full rounded-lg border-[#00d2d3]/30 shadow-sm p-3 border focus:ring-[#00d2d3] focus:border-[#00d2d3] text-gray-800" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#00d2d3]">{t.zipcode}</label>
                  <input type="text" name="zipcode" autoComplete="postal-code" required className="mt-1 block w-full rounded-lg border-[#00d2d3]/30 shadow-sm p-3 border focus:ring-[#00d2d3] focus:border-[#00d2d3] text-gray-800" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#00d2d3]">{t.city}</label>
                  <input type="text" name="city" autoComplete="address-level2" required className="mt-1 block w-full rounded-lg border-[#00d2d3]/30 shadow-sm p-3 border focus:ring-[#00d2d3] focus:border-[#00d2d3] text-gray-800" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#00d2d3]">{t.country}</label>
                  <input type="text" name="country" defaultValue={scannedData.country} autoComplete="country-name" required className="mt-1 block w-full rounded-lg border-[#00d2d3]/30 shadow-sm p-3 border focus:ring-[#00d2d3] focus:border-[#00d2d3] text-gray-800" />
                </div>
              </div>
              
              <div className="pt-4 border-t border-[#00d2d3]/20">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-[#00d2d3]">{t.digital_signature}</label>
                  <button type="button" onClick={clearSignature} className="text-xs text-[#00d2d3] flex items-center gap-1 hover:text-[#00b5b6] transition-colors">
                    <Eraser size={14} /> Wis / Clear
                  </button>
                </div>
                <div className="w-full h-48 border-2 border-dashed border-[#00d2d3]/40 rounded-lg overflow-hidden relative cursor-crosshair bg-cyan-50/20">
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                     <p className="italic text-[#00d2d3]">{t.sign_here}</p>
                   </div>
                   <SignatureCanvas 
                     ref={sigCanvas}
                     canvasProps={{ className: 'w-full h-full relative z-10' }}
                     backgroundColor="transparent"
                     penColor="#000000"
                   />
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`w-full ${theme.primary} ${theme.primaryHover} text-white py-4 rounded-xl text-xl font-medium transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''} shadow-lg shadow-[#00d2d3]/30`}
              >
                {isSubmitting ? t.processing : t.complete_checkin}
              </button>
            </form>
          )}

          {step === 4 && (
            <div className="text-center py-8 space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="mx-auto w-24 h-24 bg-cyan-50 rounded-full flex items-center justify-center border-4 border-[#00d2d3]/20">
                <CheckCircle className="text-[#00d2d3]" size={56} />
              </div>
              <h2 className="text-3xl font-bold text-[#00d2d3]">{t.checked_in_title}</h2>
              
              {/* De Upsell Module */}
              <div className="mt-8 p-6 bg-white border-2 border-[#00d2d3]/30 rounded-2xl shadow-[0_8px_30px_rgb(0,210,211,0.15)]">
                <h3 className={`text-xl font-bold ${theme.accent} mb-2`}>{t.upsell_title}</h3>
                <p className="text-[#00d2d3]/80 mb-6">{t.upsell_desc}</p>
                <button className={`w-full bg-[#00d2d3] text-white hover:bg-[#00b5b6] py-3 rounded-xl text-lg font-bold transition-all shadow-md`}>
                  {t.upsell_button}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
