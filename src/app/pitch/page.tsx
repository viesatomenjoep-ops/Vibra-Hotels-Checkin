'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { saveHotelBranding } from '@/actions/hotelBranding';
import { getAllHotels } from '@/actions/getAllHotels';
import { deleteHotel } from '@/actions/deleteHotel';
import { translations, Language } from '@/lib/translations';

export default function PitchEditor() {
  const [hotelName, setHotelName] = useState('');
  const [hotelSlug, setHotelSlug] = useState('');
  const [businessType, setBusinessType] = useState<'hotel' | 'scooter'>('hotel');
  const [scooterFleet, setScooterFleet] = useState<Array<{id: string, name: string, price: string, cc: string, image: string}>>([
    { id: '1', name: 'Vespa Primavera', cc: '125cc', price: '35', image: '' },
    { id: '2', name: 'Honda PCX', cc: '125cc', price: '28', image: '' }
  ]);
  const [color, setColor] = useState('#00d2d3');
  const [font, setFont] = useState('Inter');
  const [logoBase64, setLogoBase64] = useState('');
  const [logoFileName, setLogoFileName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedLink, setSavedLink] = useState('');
  const [savedSlug, setSavedSlug] = useState('');
  const [error, setError] = useState('');
  const [language, setLanguage] = useState<Language>('nl');
  const [savedPrototypes, setSavedPrototypes] = useState<any[]>([]);
  const t = translations[language];

  useEffect(() => {
    getAllHotels().then(res => {
      if (res.success && res.hotels) {
        setSavedPrototypes(res.hotels);
      }
    });
  }, []);

  const languages = [
    { code: 'en', short: 'EN' },
    { code: 'nl', short: 'NL' },
    { code: 'es', short: 'ES' }
  ] as const;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max breedte/hoogte voor logo (downscale voor Vercel payload limit)
          const MAX_SIZE = 800;
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
          
          // Compress to PNG to preserve transparency
          const compressedBase64 = canvas.toDataURL('image/png', 0.8);
          setLogoBase64(compressedBase64);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScooterImageUpload = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const MAX_SIZE = 600;
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
          
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
          const newFleet = [...scooterFleet];
          newFleet[idx].image = compressedBase64;
          setScooterFleet(newFleet);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setSavedLink('');

    if (!hotelName.trim() || !hotelSlug.trim()) {
      setError('Hotel Name and Hotel ID (slug) are required.');
      setIsSaving(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', hotelName);
      formData.append('slug', hotelSlug);
      formData.append('business_type', businessType);
      if (businessType === 'scooter') {
        formData.append('scooter_fleet', JSON.stringify(scooterFleet));
      }
      formData.append('color', color);
      formData.append('font_family', font);
      formData.append('logoBase64', logoBase64);

      const result = await saveHotelBranding(formData);
      if (result.success) {
        const host = window.location.origin;
        setSavedLink(`${host}/kiosk/${result.slug}`);
        setSavedSlug(result.slug || '');
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || 'Error saving hotel branding.');
    }
    setIsSaving(false);
  };

  const encodedFont = font.replace(/ /g, '+');

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-gray-800">
      <link href={`https://fonts.googleapis.com/css2?family=${encodedFont}:wght@400;500;600;700;800;900&display=swap`} rel="stylesheet" />
      
      <div className="max-w-7xl mx-auto flex flex-col xl:flex-row gap-8 items-start">
        {/* Left Side: Editor Form */}
        <div className="w-full xl:w-5/12 bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100 flex-shrink-0">
          
          {/* Language Selector */}
          <div className="flex gap-2 mb-6 justify-end">
            {languages.map((lang) => (
              <button 
                key={lang.code}
                onClick={() => setLanguage(lang.code as Language)}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${language === lang.code ? 'bg-gray-900 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
              >
                {lang.short}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 mb-2">
            <img src="/viesa-logo.png" alt="Viesa Logo" className="w-12 h-12 object-contain" />
            <h1 className="text-3xl font-black text-gray-900">{t.pitch_title}</h1>
          </div>
          <p className="text-gray-500 mb-8">{t.pitch_subtitle}</p>

          {/* Prototype Selector */}
          {savedPrototypes.length > 0 && (
            <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <label className="block text-sm font-bold text-gray-700 mb-2">{t.pitch_select_prototype}</label>
              <select 
                className="w-full p-3 bg-white border border-gray-300 rounded-lg outline-none font-medium mb-4"
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'new') {
                    setHotelName('');
                    setHotelSlug('');
                    setColor('#00d2d3');
                    setFont('Inter');
                    setLogoBase64('');
                    setSavedLink('');
                    setSavedSlug('');
                  } else {
                    const selected = savedPrototypes.find(p => p.slug === val);
                    if (selected) {
                      setHotelName(selected.name || '');
                      setHotelSlug(selected.slug || '');
                      setBusinessType(selected.business_type || 'hotel');
                      if (selected.business_type === 'scooter' && selected.scooter_fleet) {
                        setScooterFleet(selected.scooter_fleet);
                      }
                      setColor(selected.primary_color || '#00d2d3');
                      setFont(selected.font_family || 'Inter');
                      setLogoBase64(selected.logo_url || '');
                      setSavedSlug(selected.slug || '');
                      setSavedLink(`${window.location.origin}/kiosk/${selected.slug}`);
                    }
                  }
                }}
              >
                <option value="">{t.pitch_choose_prototype || '-- Kies een prototype --'}</option>
                {savedPrototypes.map(p => (
                  <option key={p.slug} value={p.slug}>{p.name} ({p.slug})</option>
                ))}
              </select>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setHotelName('');
                    setHotelSlug('');
                    setColor('#00d2d3');
                    setFont('Inter');
                    setLogoBase64('');
                    setSavedLink('');
                    setSavedSlug('');
                  }}
                  className="w-full py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition-colors"
                >
                  {t.pitch_add_new}
                </button>

                {savedSlug && (
                  <button 
                    onClick={async () => {
                      if (confirm('Weet je zeker dat je dit prototype wilt verwijderen?')) {
                        const res = await deleteHotel(savedSlug);
                        if (res.success) {
                          setSavedPrototypes(prev => prev.filter(p => p.slug !== savedSlug));
                          setHotelName('');
                          setHotelSlug('');
                          setBusinessType('hotel');
                          setColor('#00d2d3');
                          setFont('Inter');
                          setLogoBase64('');
                          setSavedLink('');
                          setSavedSlug('');
                        } else {
                          alert('Error: ' + res.message);
                        }
                      }
                    }}
                    className="w-full py-3 bg-red-100 text-red-600 border border-red-200 font-bold rounded-lg hover:bg-red-200 transition-colors"
                  >
                    {t.pitch_delete_prototype}
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="space-y-6">
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Type Bedrijf / Platform</label>
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setBusinessType('hotel')}
                className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all ${businessType === 'hotel' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                🏨 Hotel Check-in
              </button>
              <button
                type="button"
                onClick={() => setBusinessType('scooter')}
                className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all ${businessType === 'scooter' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                🛵 Scooter Rental
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              {businessType === 'scooter' ? t.pitch_scooter_name : t.pitch_hotel_name}
            </label>
            <input 
              type="text" 
              value={hotelName} 
              onChange={(e) => setHotelName(e.target.value)}
              placeholder={businessType === 'scooter' ? t.pitch_scooter_placeholder : t.pitch_hotel_placeholder}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              {businessType === 'scooter' ? t.pitch_scooter_slug : t.pitch_hotel_slug}
            </label>
            <input 
              type="text" 
              value={hotelSlug} 
              onChange={(e) => {
                let val = e.target.value.toLowerCase();
                val = val.replace(/^https?:\/\/[^\/]*\/hoteles\//, '');
                val = val.replace(/^https?:\/\//, '').replace(/^www\./, '');
                val = val.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                setHotelSlug(val);
              }}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">{t.pitch_brand_color}</label>
            <div className="flex gap-4 items-center">
              <input 
                type="color" 
                value={color} 
                onChange={(e) => setColor(e.target.value)}
                className="w-14 h-14 rounded cursor-pointer"
              />
              <input 
                type="text" 
                value={color} 
                onChange={(e) => setColor(e.target.value)}
                className="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">{t.pitch_typography}</label>
            <select 
              value={font} 
              onChange={(e) => setFont(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none mb-6"
              style={{ fontFamily: font }}
            >
              <option value="Inter">Inter (Modern & Clean)</option>
              <option value="Playfair Display">Playfair Display (Luxe & Klassiek)</option>
              <option value="Montserrat">Montserrat (Geometrisch & Strak)</option>
              <option value="Outfit">Outfit (Tech & Fris)</option>
              <option value="Cormorant Garamond">Cormorant Garamond (Boutique & Elegant)</option>
              <option value="DM Sans">DM Sans (Minimalistisch & Leesbaar)</option>
            </select>
          </div>

          {businessType === 'scooter' && (
            <div className="pt-4 border-t border-gray-100 mt-4">
              <label className="block text-sm font-bold text-gray-700 mb-4">{t.pitch_scooter_fleet_title}</label>
              <div className="space-y-4 mb-4">
                {scooterFleet.map((scooter, idx) => (
                  <div key={scooter.id} className="flex flex-col gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex gap-2 items-center">
                      <input 
                        type="text" 
                        value={scooter.name} 
                        onChange={(e) => {
                          const newFleet = [...scooterFleet];
                          newFleet[idx].name = e.target.value;
                          setScooterFleet(newFleet);
                        }}
                        className="flex-1 p-2 text-sm bg-white border border-gray-200 rounded focus:outline-none"
                        placeholder={t.pitch_scooter_name_label}
                      />
                      <button 
                        onClick={() => {
                          setScooterFleet(scooterFleet.filter(s => s.id !== scooter.id));
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded"
                      >
                        ❌
                      </button>
                    </div>
                    <div className="flex gap-2 items-center">
                      <input 
                        type="text" 
                        value={scooter.cc} 
                        onChange={(e) => {
                          const newFleet = [...scooterFleet];
                          newFleet[idx].cc = e.target.value;
                          setScooterFleet(newFleet);
                        }}
                        className="w-1/3 p-2 text-sm bg-white border border-gray-200 rounded focus:outline-none"
                        placeholder={t.pitch_scooter_cc_label}
                      />
                      <input 
                        type="text" 
                        value={scooter.price} 
                        onChange={(e) => {
                          const newFleet = [...scooterFleet];
                          newFleet[idx].price = e.target.value;
                          setScooterFleet(newFleet);
                        }}
                        className="w-1/3 p-2 text-sm bg-white border border-gray-200 rounded focus:outline-none"
                        placeholder={t.pitch_scooter_price_label}
                      />
                      <div className="w-1/3 relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleScooterImageUpload(e, idx)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className={`p-2 text-sm border rounded text-center truncate ${scooter.image ? 'bg-green-100 text-green-700 border-green-200 font-bold' : 'bg-white border-gray-200 text-gray-500'}`}>
                          {scooter.image ? '✅ Uploaded' : t.pitch_scooter_upload_img}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => {
                  setScooterFleet([...scooterFleet, { id: Math.random().toString(), name: '', cc: '', price: '', image: '' }]);
                }}
                className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 font-bold rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t.pitch_scooter_add_btn}
              </button>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">{t.pitch_upload_logo}</label>
            <div className="flex flex-col gap-4">
              <label className="w-full flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <div className="bg-[var(--brand-color)] text-white px-4 py-2 rounded-lg font-medium text-sm">
                  {t.pitch_choose_file || 'Kies bestand'}
                </div>
                <span className="text-gray-500 text-sm truncate flex-1">
                  {logoFileName || t.pitch_no_file_chosen || 'Geen bestand gekozen'}
                </span>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
              {logoBase64 && (
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50 h-32">
                  <img src={logoBase64} alt="Preview" className="max-h-full object-contain" />
                </div>
              )}
            </div>
          </div>
        </div>

        {error && <p className="text-red-500 font-bold mt-6">{error}</p>}

        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={`mt-8 w-full py-4 text-white rounded-xl font-bold text-lg transition-colors shadow-lg ${isSaving ? 'bg-gray-400' : 'bg-[#00d2d3] hover:bg-[#00b5b6]'}`}
        >
          {isSaving ? t.pitch_btn_saving : t.pitch_btn_save}
        </button>

        {savedLink && (
          <div className="mt-8 p-6 bg-green-50 rounded-2xl border-2 border-green-200 animate-in fade-in slide-in-from-bottom-4">
            <p className="text-sm font-bold text-green-700 mb-4 uppercase tracking-wider">{t.pitch_success_title}</p>
            <Link 
              href={businessType === 'scooter' ? `/scooters/${savedSlug}` : `/kiosk/${savedSlug}`}
              className="block w-full text-center py-4 mb-3 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 transition-colors shadow-md"
            >
              {t.pitch_success_btn}
            </Link>
            
            <button 
              onClick={() => {
                const apiUrl = `${window.location.origin}/api/v1/branding/${savedSlug}`;
                navigator.clipboard.writeText(apiUrl);
                alert(`API Blueprint URL copied to clipboard!\n\n${apiUrl}`);
              }}
              className="block w-full text-center py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-900 transition-colors shadow-md"
            >
              {t.pitch_export_api}
            </button>

            <p className="text-xs text-green-600/70 mt-4 text-center break-all">App Link: {savedLink}</p>
          </div>
        )}
      </div>

      {/* Right Side: Live Viewer Preview */}
      <div className="w-full xl:w-7/12 sticky top-8 space-y-8">
        
        {businessType === 'hotel' ? (
          /* Kiosk Preview */
          <div 
            className="w-full rounded-[2.5rem] shadow-2xl overflow-hidden border-8 border-gray-800 bg-white relative transition-all duration-300"
            style={{ fontFamily: font }}
          >
            {/* Mock iPad Status bar */}
            <div className="bg-black text-white text-[10px] font-bold px-6 py-1 flex justify-between items-center opacity-80">
              <span>9:41 AM</span>
              <div className="flex gap-2"><span>100%</span><span>🔋</span></div>
            </div>
            
            <div className="flex flex-col md:flex-row min-h-[400px]">
              {/* Kiosk Left */}
              <div className="w-full md:w-1/2 p-10 flex flex-col justify-center" style={{ backgroundColor: color }}>
                {logoBase64 ? (
                  <img src={logoBase64} alt="Logo" className={`h-12 w-auto mb-10 object-contain ${(logoBase64.endsWith('.svg') || logoBase64.includes('vibra')) ? 'brightness-0 invert' : ''}`} />
                ) : (
                  <div className="h-12 w-32 bg-white/20 rounded-lg mb-10"></div>
                )}
                <p className="mt-2 text-lg text-white opacity-90">{t.kiosk_title}</p>
                <div className="w-full h-1 bg-white/20 rounded-full my-6"></div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-white opacity-90"><div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">1</div> {t.kiosk_step1}</div>
                  <div className="flex items-center gap-4 text-white opacity-90"><div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">2</div> {t.kiosk_step2}</div>
                </div>
              </div>
              {/* Kiosk Right (QR Code mockup) */}
              <div className="w-full md:w-1/2 bg-gray-50 p-10 flex flex-col items-center justify-center">
                <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 transform transition-transform hover:scale-105 duration-300">
                  {/* Fake QR using CSS grid */}
                  <div className="w-40 h-40 grid grid-cols-4 grid-rows-4 gap-1 p-2" style={{ backgroundColor: color }}>
                    {Array.from({length: 16}).map((_, i) => (
                      <div key={i} className={`bg-white ${i%2===0 || i%3===0 ? 'opacity-100' : 'opacity-0'}`}></div>
                    ))}
                  </div>
                </div>
                <p className="mt-6 font-bold tracking-widest uppercase text-sm opacity-80" style={{ color: color }}>{t.kiosk_scan_here}</p>
              </div>
            </div>
          </div>
        ) : (
          /* Scooter Desktop Preview */
          <div 
            className="w-full rounded-2xl shadow-2xl overflow-hidden border border-gray-200 bg-white relative transition-all duration-300"
            style={{ fontFamily: font }}
          >
            {/* Fake Browser Bar */}
            <div className="bg-gray-100 px-4 py-3 flex items-center gap-2 border-b border-gray-200">
              <div className="flex gap-1.5"><span className="w-3 h-3 rounded-full bg-red-400"></span><span className="w-3 h-3 rounded-full bg-yellow-400"></span><span className="w-3 h-3 rounded-full bg-green-400"></span></div>
              <div className="ml-4 flex-1 bg-white rounded-md px-3 py-1 text-xs text-gray-400 text-center font-mono">viesa-scooters.vercel.app/{hotelSlug || 'ibiza-scooters'}</div>
            </div>
            
            {/* Hero Section */}
            <div className="h-64 relative flex items-center justify-center bg-gray-900 overflow-hidden">
              <div className="absolute inset-0 bg-black/40 z-10"></div>
              <img src="https://images.unsplash.com/photo-1498887960847-2a5e46312788?q=80&w=1000&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-60" alt="Scooter hero" />
              
              <div className="z-20 text-center px-6">
                {logoBase64 ? (
                  <img src={logoBase64} alt="Logo" className="h-16 w-auto mx-auto object-contain mb-6 drop-shadow-lg" />
                ) : (
                  <h1 className="text-4xl font-black text-white mb-6 drop-shadow-md">{hotelName || 'Ibiza Scooters'}</h1>
                )}
                <div className="bg-white p-4 rounded-2xl shadow-2xl flex gap-4 max-w-2xl mx-auto items-end">
                  <div className="flex-1 text-left">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Pick-up Date</label>
                    <div className="font-medium text-gray-900 border-b-2 border-gray-100 pb-1">12 Aug 2026</div>
                  </div>
                  <div className="flex-1 text-left">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Return Date</label>
                    <div className="font-medium text-gray-900 border-b-2 border-gray-100 pb-1">19 Aug 2026</div>
                  </div>
                  <button className="px-6 py-3 text-white font-bold rounded-xl shadow-lg hover:brightness-110 transition-all" style={{ backgroundColor: color }}>
                    Search
                  </button>
                </div>
              </div>
            </div>
            
            {/* Fleet Section */}
            <div className="p-8 bg-gray-50">
              <h2 className="text-xl font-black text-gray-900 mb-6 text-center">Select your scooter</h2>
              <div className="grid grid-cols-2 gap-6">
                {scooterFleet.map((scooter) => (
                  <div key={scooter.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                      {scooter.image ? (
                        <div className="h-32 bg-gray-100 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                          <img src={scooter.image} alt={scooter.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-32 bg-gray-100 rounded-xl mb-4 flex items-center justify-center text-4xl">🛵</div>
                      )}
                      <h3 className="font-bold text-gray-900">{scooter.name || 'Scooter Name'}</h3>
                      <p className="text-sm text-gray-500 mb-4">{scooter.cc || '125cc'} • 2 helmets</p>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-black text-lg" style={{ color: color }}>€{scooter.price || '35'}/day</span>
                      <button className="px-4 py-2 text-white text-sm font-bold rounded-lg" style={{ backgroundColor: color }}>Reserve</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {businessType === 'hotel' ? (
          /* Mobile App Preview (Hotel) */
          <div className="flex justify-center mt-12">
            <div 
              className="w-[320px] h-[600px] rounded-[3rem] shadow-2xl border-[12px] border-gray-800 bg-gray-50 relative overflow-hidden flex flex-col"
              style={{ fontFamily: font }}
            >
              {/* Dynamic iPhone Notch */}
              <div className="absolute top-0 inset-x-0 h-6 bg-gray-800 rounded-b-3xl w-1/2 mx-auto z-10"></div>
              
              {/* Header */}
              <div className="p-6 pt-10 text-center text-white" style={{ backgroundColor: color }}>
                {logoBase64 ? (
                  <img src={logoBase64} alt="Logo" className={`h-8 w-auto mx-auto object-contain mb-2 ${(logoBase64.endsWith('.svg') || logoBase64.includes('vibra')) ? 'brightness-0 invert' : 'rounded'}`} />
                ) : (
                  <div className="h-8 w-20 bg-white/20 mx-auto rounded-md mb-2"></div>
                )}
                <p className="text-xs opacity-90">{t.header_subtitle}</p>
              </div>

              {/* Content */}
              <div className="flex-1 p-6 space-y-6 overflow-hidden">
                <h3 className="text-xl font-bold" style={{ color: color }}>{t.personal_details}</h3>
                <div className="space-y-4">
                  <div className="h-12 bg-white rounded-xl border border-gray-200 w-full flex items-center px-4"><span className="w-4 h-4 rounded-full bg-gray-200"></span><div className="ml-3 h-2 w-1/2 bg-gray-200 rounded"></div></div>
                  <div className="h-12 bg-white rounded-xl border border-gray-200 w-full flex items-center px-4"><span className="w-4 h-4 rounded-full bg-gray-200"></span><div className="ml-3 h-2 w-2/3 bg-gray-200 rounded"></div></div>
                  <div className="h-24 bg-white rounded-xl border-2 border-dashed border-gray-300 w-full flex items-center justify-center flex-col text-gray-400">
                    <span className="text-2xl mb-1">📷</span>
                    <span className="text-xs font-bold uppercase tracking-wider">{t.upload_id_title}</span>
                  </div>
                </div>
              </div>

              {/* Button */}
              <div className="p-6 bg-white border-t border-gray-100">
                <button className="w-full py-4 text-white font-bold rounded-xl shadow-lg" style={{ backgroundColor: color }}>
                  {t.complete_checkin}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Mobile App Preview (Scooter) */
          <div className="flex justify-center mt-12">
            <div 
              className="w-[320px] h-[600px] rounded-[3rem] shadow-2xl border-[12px] border-gray-800 bg-gray-50 relative overflow-hidden flex flex-col"
              style={{ fontFamily: font }}
            >
              {/* Dynamic iPhone Notch */}
              <div className="absolute top-0 inset-x-0 h-6 bg-gray-800 rounded-b-3xl w-1/2 mx-auto z-10"></div>
              
              {/* Header */}
              <div className="p-6 pt-10 text-center bg-white border-b border-gray-100">
                {logoBase64 ? (
                  <img src={logoBase64} alt="Logo" className="h-8 w-auto mx-auto object-contain mb-1" />
                ) : (
                  <h3 className="text-lg font-black text-gray-900">{hotelName || 'Ibiza Scooters'}</h3>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 p-5 overflow-y-auto bg-gray-50">
                <h3 className="text-lg font-bold mb-4 text-gray-900">Your Booking</h3>
                
                <div className="bg-white p-4 rounded-2xl shadow-sm mb-4 border border-gray-100">
                  <div className="flex gap-4 mb-4">
                    <div className="h-16 w-16 bg-gray-100 rounded-xl flex items-center justify-center text-3xl">🛵</div>
                    <div>
                      <p className="font-bold text-gray-900">Vespa Primavera</p>
                      <p className="text-xs text-gray-500">12 - 19 Aug 2026 (7 days)</p>
                      <p className="text-sm font-black mt-1" style={{ color: color }}>€245.00</p>
                    </div>
                  </div>
                  <div className="h-[1px] w-full bg-gray-100 mb-4"></div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Driver Details</p>
                  <div className="space-y-2">
                    <div className="h-10 bg-gray-50 rounded-lg w-full flex items-center px-3"><div className="h-2 w-1/2 bg-gray-200 rounded"></div></div>
                    <div className="h-10 bg-gray-50 rounded-lg w-full flex items-center px-3"><div className="h-2 w-2/3 bg-gray-200 rounded"></div></div>
                  </div>
                </div>
              </div>

              {/* Button */}
              <div className="p-5 bg-white border-t border-gray-100 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-500 font-medium">Total</span>
                  <span className="text-xl font-black text-gray-900">€245.00</span>
                </div>
                <button className="w-full py-4 text-white font-bold rounded-xl shadow-lg flex justify-center items-center gap-2" style={{ backgroundColor: color }}>
                  <span>Pay & Reserve</span>
                  <span>🔒</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
    </div>
  );
}
