'use client';

import { useState } from 'react';
import Link from 'next/link';
import { saveHotelBranding } from '@/actions/hotelBranding';

export default function PitchEditor() {
  const [hotelName, setHotelName] = useState('Jet Hotels');
  const [hotelSlug, setHotelSlug] = useState('jet-hotels');
  const [color, setColor] = useState('#ff0000');
  const [font, setFont] = useState('Inter');
  const [logoBase64, setLogoBase64] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedLink, setSavedLink] = useState('');
  const [error, setError] = useState('');

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoBase64(reader.result as string);
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
      setError(err.message || 'Er is een onbekende fout opgetreden.');
    }
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 font-sans text-gray-800">
      <div className="w-full max-w-2xl bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
        <h1 className="text-3xl font-black mb-2 text-gray-900">Viesa Pitch Editor</h1>
        <p className="text-gray-500 mb-8">Maak razendsnel een whitelabel prototype aan. Alles wordt écht opgeslagen in de database, inclusief eigen logo!</p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Hotel Naam</label>
            <input 
              type="text" 
              value={hotelName} 
              onChange={(e) => setHotelName(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Hotel ID (Unieke URL naam)</label>
            <input 
              type="text" 
              value={hotelSlug} 
              onChange={(e) => setHotelSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Brand Color (Hoofdkleur)</label>
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
            <label className="block text-sm font-bold text-gray-700 mb-2">Typografie / Font (Google Fonts)</label>
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
            <label className="block text-sm font-bold text-gray-700 mb-2">Upload Logo (Bestand)</label>
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
          {isSaving ? 'Bezig met opslaan en uploaden...' : 'Sla Prototype Op'}
        </button>

        {savedLink && (
          <div className="mt-8 p-6 bg-green-50 rounded-2xl border-2 border-green-200 animate-in fade-in slide-in-from-bottom-4">
            <p className="text-sm font-bold text-green-700 mb-4 uppercase tracking-wider">Succesvol opgeslagen!</p>
            <a 
              href={savedLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full text-center py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 transition-colors shadow-md"
            >
              Open het Prototype nu!
            </a>
            <p className="text-xs text-green-600/70 mt-4 text-center break-all">{savedLink}</p>
          </div>
        )}
      </div>
    </div>
  );
}
