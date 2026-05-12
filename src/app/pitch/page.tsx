'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PitchEditor() {
  const [hotelName, setHotelName] = useState('Jet Hotels');
  const [hotelSlug, setHotelSlug] = useState('jet-hotels');
  const [color, setColor] = useState('#ff0000');
  const [logo, setLogo] = useState('https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/1200px-Logo_NIKE.svg.png');

  const encodedLogo = encodeURIComponent(logo);
  const encodedName = encodeURIComponent(hotelName);
  const hexColor = color.replace('#', '');
  
  const magicLink = `/kiosk/${hotelSlug}?name=${encodedName}&color=${hexColor}&logo=${encodedLogo}`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 font-sans text-gray-800">
      <div className="w-full max-w-2xl bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
        <h1 className="text-3xl font-black mb-2 text-gray-900">Viesa Pitch Editor</h1>
        <p className="text-gray-500 mb-8">Maak razendsnel een whitelabel prototype Kiosk link aan voor je pitch.</p>

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
            <label className="block text-sm font-bold text-gray-700 mb-2">Hotel ID (Slug in database)</label>
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
            <label className="block text-sm font-bold text-gray-700 mb-2">Logo URL (Zorg dat de link eindigt op .png of .svg)</label>
            <input 
              type="text" 
              value={logo} 
              onChange={(e) => setLogo(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none"
            />
          </div>
        </div>

        <div className="mt-10 p-6 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
          <p className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">Jouw Magic Link</p>
          <a 
            href={magicLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block w-full text-center py-4 bg-black text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors shadow-lg"
          >
            Open Live Prototype
          </a>
          <p className="text-xs text-gray-400 mt-4 text-center break-all">{magicLink}</p>
        </div>
      </div>
    </div>
  );
}
