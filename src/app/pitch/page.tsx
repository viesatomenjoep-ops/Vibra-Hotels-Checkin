'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { saveHotelBranding } from '@/actions/hotelBranding';
import { getAllHotels } from '@/actions/getAllHotels';
import { translations, Language } from '@/lib/translations';

export default function PitchEditor() {
  const [hotelName, setHotelName] = useState('Jet Hotels');
  const [hotelSlug, setHotelSlug] = useState('jet-hotels');
  const [color, setColor] = useState('#ff0000');
  const [font, setFont] = useState('Inter');
  const [logoBase64, setLogoBase64] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedLink, setSavedLink] = useState('');
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

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setSavedLink('');

    try {
      const formData = new FormData();
      formData.append('name', hotelName);
      formData.append('slug', hotelSlug);
      formData.append('color', color);
      formData.append('font_family', font);
      formData.append('logoBase64', logoBase64);

      const result = await saveHotelBranding(formData);
      if (result.success) {
        const host = window.location.origin;
        setSavedLink(`${host}/kiosk/${result.slug}`);
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

          <h1 className="text-3xl font-black mb-2 text-gray-900">{t.pitch_title}</h1>
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
                  } else {
                    const selected = savedPrototypes.find(p => p.slug === val);
                    if (selected) {
                      setHotelName(selected.name || '');
                      setHotelSlug(selected.slug || '');
                      setColor(selected.primary_color || '#00d2d3');
                      setFont(selected.font_family || 'Inter');
                      setLogoBase64(selected.logo_url || '');
                      setSavedLink('');
                    }
                  }
                }}
              >
                <option value="">{t.pitch_choose_prototype || '-- Kies een prototype --'}</option>
                {savedPrototypes.map(p => (
                  <option key={p.slug} value={p.slug}>{p.name} ({p.slug})</option>
                ))}
              </select>
              
              <button 
                onClick={() => {
                  setHotelName('');
                  setHotelSlug('');
                  setColor('#00d2d3');
                  setFont('Inter');
                  setLogoBase64('');
                  setSavedLink('');
                  // Also reset the select dropdown visually if needed, but since it's uncontrolled we just rely on state.
                  // Best would be to tie select value to a state, but this works to just reset form.
                }}
                className="w-full py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition-colors"
              >
                {t.pitch_add_new}
              </button>
            </div>
          )}

          <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">{t.pitch_hotel_name}</label>
            <input 
              type="text" 
              value={hotelName} 
              onChange={(e) => setHotelName(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">{t.pitch_hotel_slug}</label>
            <input 
              type="text" 
              value={hotelSlug} 
              onChange={(e) => setHotelSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
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

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">{t.pitch_upload_logo}</label>
            <div className="flex flex-col gap-4">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleLogoUpload}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
              />
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
            <a 
              href={savedLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full text-center py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 transition-colors shadow-md"
            >
              {t.pitch_success_btn}
            </a>
            <p className="text-xs text-green-600/70 mt-4 text-center break-all">{savedLink}</p>
          </div>
        )}
      </div>

      {/* Right Side: Live Viewer Preview */}
      <div className="w-full xl:w-7/12 sticky top-8 space-y-8">
        
        {/* Kiosk Preview */}
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
                <img src={logoBase64} alt="Logo" className="h-12 w-auto mb-10 object-contain brightness-0 invert" />
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

        {/* Mobile App Preview */}
        <div className="flex justify-center">
          <div 
            className="w-[320px] h-[600px] rounded-[3rem] shadow-2xl border-[12px] border-gray-800 bg-gray-50 relative overflow-hidden flex flex-col"
            style={{ fontFamily: font }}
          >
            {/* Dynamic iPhone Notch */}
            <div className="absolute top-0 inset-x-0 h-6 bg-gray-800 rounded-b-3xl w-1/2 mx-auto z-10"></div>
            
            {/* Header */}
            <div className="p-6 pt-10 text-center text-white" style={{ backgroundColor: color }}>
              {logoBase64 ? (
                <img src={logoBase64} alt="Logo" className="h-8 w-auto mx-auto object-contain brightness-0 invert mb-2" />
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

      </div>
    </div>
    </div>
  );
}
