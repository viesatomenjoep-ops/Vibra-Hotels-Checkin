'use client';

import { useState, useRef, useEffect, use } from 'react';
import { processCheckin } from '@/actions/submitCheckin';
import { getHotelBranding } from '@/actions/hotelBranding';
import { CheckCircle, Globe, Eraser, Camera, ChevronLeft } from 'lucide-react';
import { translations, Language } from '@/lib/translations';
import dynamic from 'next/dynamic';
import PassportScanner from '@/components/PassportScanner';

// Dynamic import to prevent SSR issues with canvas
const SignatureCanvas = dynamic(() => import('react-signature-canvas'), { ssr: false });
const SigCanvas = SignatureCanvas as any;

export default function CheckInPage({ 
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

  const brandName = resolvedSearchParams.name || dbBranding.name || 'Vibra Hotels';
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

  const [step, setStep] = useState(0); // 0=Lang, 1=Scan, 2=Form, 4=Success
  const [language, setLanguage] = useState<Language>('en');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannedData, setScannedData] = useState<any>({ firstName: '', lastName: '', country: '', idPhotoBase64: '' });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sigCanvas = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const langParam = params.get('lang');
      if (langParam && ['en', 'nl', 'es', 'de', 'it', 'pt'].includes(langParam)) {
        setLanguage(langParam as Language);
        setStep(1); // Skip Language Selection
      }
    }
  }, []);

  // Originele Turquoise/Lichtblauwe Kleur
  const theme = {
    primary: 'bg-[var(--brand-color)]',
    primaryHover: 'hover:bg-[var(--brand-hover)]',
    accent: 'text-[var(--brand-color)]',
  };

  const t = translations[language];

  const handleAction = async (formData: FormData) => {
    setError(null);
    if (sigCanvas.current?.isEmpty()) {
      setError('Vul alstublieft uw handtekening in. / Please provide your signature.');
      return;
    }

    setIsSubmitting(true);
    formData.append('hotelId', hotel_id);

    // Get actual base64 signature
    const signatureBase64 = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
    formData.append('signature', signatureBase64);
    
    if (scannedData.idPhotoBase64) {
      formData.append('idPhoto', scannedData.idPhotoBase64);
    }

    try {
      const result = await processCheckin(formData);
      if (result.success) {
        setStep(4); // Success step
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      console.error("Client Error during check-in:", err);
      setError("Netwerkfout of Server Timeout. Controleer uw verbinding en probeer het opnieuw.");
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
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'es', label: 'Español', short: 'ES' },
    { code: 'de', label: 'Deutsch', short: 'DE' },
    { code: 'nl', label: 'Nederlands', short: 'NL' },
    { code: 'it', label: 'Italiano', short: 'IT' },
    { code: 'pt', label: 'Português', short: 'PT' }
  ] as const;

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50"></div>;
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
        className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-[var(--brand-color)]"
      >
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl overflow-hidden">

        {/* Header */}
        {step > 0 && (
          <div className={`${theme.primary} p-6 md:p-10 text-center text-white relative`}>
            {step < 4 && (
              <button 
                type="button"
                onClick={() => setStep(step - 1)}
                className="absolute left-4 top-4 md:left-8 md:top-8 p-2 rounded-full hover:bg-white/20 transition-colors flex items-center justify-center"
              >
                <ChevronLeft size={28} className="text-white" />
              </button>
            )}
            {brandLogo.endsWith('.svg') || brandLogo.includes('vibra') ? (
              <img src={brandLogo} alt={brandName} className="h-12 w-auto mx-auto brightness-0 invert object-contain" />
            ) : (
              <img src={brandLogo} alt={brandName} className="h-12 w-auto mx-auto object-contain rounded" />
            )}
            <p className="mt-2 text-lg opacity-90">{t.header_subtitle}</p>
          </div>
        )}

        {/* Content Area */}
        <div className={step === 0 ? "p-8 md:p-16 bg-gradient-to-br from-white to-gray-50" : "p-6 md:p-10"}>

          {step === 0 && (
            <div className="space-y-8 text-center animate-in fade-in zoom-in-95 duration-500">
              <div className="flex flex-col items-center justify-center space-y-4 mb-8">
                <img src={brandLogo} alt={brandName} className="h-20 w-auto mx-auto mb-2 object-contain" />
                <p className="text-xl text-[var(--brand-color)] font-medium opacity-80">Please select your language</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => selectLanguage(lang.code as Language)}
                    className="flex items-center gap-5 p-4 w-full bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,210,211,0.1)] hover:shadow-[0_8px_30px_rgb(0,210,211,0.3)] hover:-translate-y-1 transition-all duration-300 border border-[var(--brand-color)]/20 hover:border-[var(--brand-color)]/80 group"
                  >
                    <div className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center bg-cyan-50 shadow-inner group-hover:bg-[var(--brand-color)] group-hover:text-white transition-all duration-300 flex-shrink-0 border border-[var(--brand-color)]/20">
                      <span className="text-xl font-black">{lang.short}</span>
                    </div>
                    <span className="text-xl font-bold text-[var(--brand-color)]">{lang.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6 text-center animate-in fade-in slide-in-from-right-4">
              <h2 className="text-2xl font-semibold text-[var(--brand-color)]">{t.welcome_title}</h2>
              <p className="text-[var(--brand-color)]/80">{t.welcome_subtitle}</p>

              <PassportScanner
                t={t}
                onScanComplete={(data) => {
                  setScannedData(data);
                  setStep(2);
                }}
                onCancel={() => setStep(2)}
              />

              <p className="text-sm text-[var(--brand-color)]/60 mt-6 border-t border-[var(--brand-color)]/20 pt-4">{t.privacy_note}</p>
            </div>
          )}

          {step === 2 && (
            <form action={handleAction} className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-2xl font-semibold text-[var(--brand-color)] border-b border-[var(--brand-color)]/20 pb-4">{t.personal_details}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--brand-color)]">{t.first_name}</label>
                  <input type="text" name="firstName" defaultValue={scannedData.firstName} autoComplete="given-name" required className="mt-1 block w-full rounded-lg border-[var(--brand-color)]/30 shadow-sm p-3 border focus:ring-[var(--brand-color)] focus:border-[var(--brand-color)] text-gray-800" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--brand-color)]">{t.last_name}</label>
                  <input type="text" name="lastName" defaultValue={scannedData.lastName} autoComplete="family-name" required className="mt-1 block w-full rounded-lg border-[var(--brand-color)]/30 shadow-sm p-3 border focus:ring-[var(--brand-color)] focus:border-[var(--brand-color)] text-gray-800" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--brand-color)]">{t.email}</label>
                  <input type="email" name="email" autoComplete="email" required className="mt-1 block w-full rounded-lg border-[var(--brand-color)]/30 shadow-sm p-3 border focus:ring-[var(--brand-color)] focus:border-[var(--brand-color)] text-gray-800" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--brand-color)]">{t.phone}</label>
                  <div className="mt-1 flex rounded-lg shadow-sm">
                    <select name="phoneCountryCode" className="rounded-l-lg border-[var(--brand-color)]/30 p-3 border-y border-l bg-gray-50 focus:ring-[var(--brand-color)] focus:border-[var(--brand-color)] text-gray-700 w-1/3 max-w-[130px] text-sm">
                      <option value="+31">🇳🇱 +31</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+34">🇪🇸 +34</option>
                      <option value="+49">🇩🇪 +49</option>
                      <option value="+39">🇮🇹 +39</option>
                      <option value="+351">🇵🇹 +351</option>
                      <option value="+33">🇫🇷 +33</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+32">🇧🇪 +32</option>
                      <option value="+41">🇨🇭 +41</option>
                      <option value="+43">🇦🇹 +43</option>
                    </select>
                    <input type="tel" name="phoneNumber" autoComplete="tel-national" required className="block w-full rounded-r-lg border-[var(--brand-color)]/30 p-3 border focus:ring-[var(--brand-color)] focus:border-[var(--brand-color)] text-gray-800" />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[var(--brand-color)]">{t.street_address}</label>
                  <input type="text" name="address" autoComplete="street-address" required className="mt-1 block w-full rounded-lg border-[var(--brand-color)]/30 shadow-sm p-3 border focus:ring-[var(--brand-color)] focus:border-[var(--brand-color)] text-gray-800" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--brand-color)]">{t.zipcode}</label>
                  <input type="text" name="zipcode" autoComplete="postal-code" required className="mt-1 block w-full rounded-lg border-[var(--brand-color)]/30 shadow-sm p-3 border focus:ring-[var(--brand-color)] focus:border-[var(--brand-color)] text-gray-800" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--brand-color)]">{t.city}</label>
                  <input type="text" name="city" autoComplete="address-level2" required className="mt-1 block w-full rounded-lg border-[var(--brand-color)]/30 shadow-sm p-3 border focus:ring-[var(--brand-color)] focus:border-[var(--brand-color)] text-gray-800" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[var(--brand-color)]">{t.country}</label>
                  <input type="text" name="country" defaultValue={scannedData.country} autoComplete="country-name" required className="mt-1 block w-full rounded-lg border-[var(--brand-color)]/30 shadow-sm p-3 border focus:ring-[var(--brand-color)] focus:border-[var(--brand-color)] text-gray-800" />
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--brand-color)]/20">
                <h3 className="text-lg font-semibold text-[var(--brand-color)] mb-2">{t.upload_id_title}</h3>
                <p className="text-sm text-[var(--brand-color)]/80 mb-4">{t.upload_id_desc}</p>
                
                {scannedData.idPhotoBase64 ? (
                  <div className="relative w-full h-40 bg-cyan-50 rounded-lg overflow-hidden border-2 border-[var(--brand-color)]/40 flex items-center justify-center">
                    <img src={scannedData.idPhotoBase64} alt="ID Document" className="h-full object-contain" />
                    <button 
                      type="button" 
                      onClick={() => setScannedData({ ...scannedData, idPhotoBase64: '' })}
                      className="absolute top-2 right-2 bg-white/80 p-2 rounded-full text-red-500 hover:bg-white shadow-sm"
                    >
                      <Eraser size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[var(--brand-color)]/40 rounded-lg cursor-pointer bg-cyan-50/20 hover:bg-cyan-50/50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Camera className="w-8 h-8 mb-2 text-[var(--brand-color)]/60" />
                      <p className="text-sm text-[var(--brand-color)]/80 font-medium">Klik of Tik om een foto toe te voegen</p>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      capture="environment" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const img = new Image();
                            img.onload = () => {
                              const canvas = document.createElement('canvas');
                              let width = img.width;
                              let height = img.height;
                              
                              // Max breedte/hoogte (downscale voor Vercel payload limit)
                              const MAX_SIZE = 1200;
                              if (width > height && width > MAX_SIZE) {
                                height *= MAX_SIZE / width;
                                width = MAX_SIZE;
                              } else if (height > MAX_SIZE) {
                                width *= MAX_SIZE / height;
                                height = MAX_SIZE;
                              }
                              
                              canvas.width = width;
                              canvas.height = height;
                              const ctx = canvas.getContext('2d');
                              ctx?.drawImage(img, 0, 0, width, height);
                              
                              // Compress to JPEG with 0.7 quality
                              const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                              setScannedData({ ...scannedData, idPhotoBase64: compressedBase64 });
                            };
                            img.src = reader.result as string;
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                )}
              </div>

              <div className="pt-4 border-t border-[var(--brand-color)]/20">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-[var(--brand-color)]">{t.digital_signature}</label>
                  <button type="button" onClick={clearSignature} className="text-xs text-[var(--brand-color)] flex items-center gap-1 hover:text-[var(--brand-hover)] transition-colors">
                    <Eraser size={14} /> Wis / Clear
                  </button>
                </div>
                <div className="w-full h-48 border-2 border-dashed border-[var(--brand-color)]/40 rounded-lg overflow-hidden relative cursor-crosshair bg-cyan-50/20">
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                    <p className="italic text-[var(--brand-color)]">{t.sign_here}</p>
                  </div>
                  <SigCanvas
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
                className={`w-full ${theme.primary} ${theme.primaryHover} text-white py-4 rounded-xl text-xl font-medium transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''} shadow-lg shadow-[var(--brand-color)]/30`}
              >
                {isSubmitting ? t.processing : t.complete_checkin}
              </button>
            </form>
          )}

          {step === 4 && (
            <div className="text-center py-8 space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="mx-auto w-24 h-24 bg-cyan-50 rounded-full flex items-center justify-center border-4 border-[var(--brand-color)]/20">
                <CheckCircle className="text-[var(--brand-color)]" size={56} />
              </div>
              <h2 className="text-3xl font-bold text-[var(--brand-color)]">{t.checked_in_title}</h2>

              {/* De Upsell Module */}
              <div className="mt-8 p-6 bg-white border-2 border-[var(--brand-color)]/30 rounded-2xl shadow-[0_8px_30px_rgb(0,210,211,0.15)]">
                <h3 className={`text-xl font-bold ${theme.accent} mb-2`}>{t.upsell_title}</h3>
                <p className="text-[var(--brand-color)]/80 mb-6">{t.upsell_desc}</p>
                <button className={`w-full bg-[var(--brand-color)] text-white hover:bg-[var(--brand-hover)] py-3 rounded-xl text-lg font-bold transition-all shadow-md`}>
                  {t.upsell_button}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
    </>
  );
}
