'use client';

import { useState } from 'react';
import CloudinaryUpload from '@/components/CloudinaryUpload';
import { Camera, AlertTriangle, Send } from 'lucide-react';

// Setup supabase client
// import { createClient } from '@supabase/supabase-js';
// const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function CleanerPortal() {
  const [selectedProperty, setSelectedProperty] = useState('');
  const [checklist, setChecklist] = useState({
    bedrooms: false,
    bathrooms: false,
    kitchen: false,
    outdoor: false,
  });
  const [photos, setPhotos] = useState<string[]>([]);
  const [damageReported, setDamageReported] = useState(false);
  const [damageDesc, setDamageDesc] = useState('');
  const [damagePhoto, setDamagePhoto] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const toggleCheck = (category: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const handlePhotoUpload = (url: string) => {
    setPhotos(prev => [...prev, url]);
  };

  const handleSubmit = async () => {
    if (!selectedProperty) return alert('Select a property first.');
    setIsSubmitting(true);
    
    try {
      // 1. Save to Supabase (Cleaning Log)
      // await supabase.from('cleaning_logs').insert([{
      //   property_id: selectedProperty,
      //   cleaner_id: '...', // from auth context
      //   bedrooms_clean: checklist.bedrooms,
      //   bathrooms_clean: checklist.bathrooms,
      //   kitchen_clean: checklist.kitchen,
      //   outdoor_clean: checklist.outdoor,
      //   photos: photos,
      // }]);

      // 2. Save to Supabase (Damage Report if any)
      // if (damageReported && damageDesc) {
      //   await supabase.from('damages').insert([{
      //     property_id: selectedProperty,
      //     description: damageDesc,
      //     photo_url: damagePhoto
      //   }]);
      // }

      // 3. Trigger WhatsApp webhook to Manager
      await fetch('/api/webhook/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'cleaning_done',
          propertyId: selectedProperty,
          photosCount: photos.length,
          damages: damageReported ? 1 : 0
        })
      });

      setSuccess(true);
    } catch (error) {
      console.error('Submission failed', error);
      alert('Error submitting report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm text-center space-y-4 max-w-sm w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
            <Send className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-semibold">Report Sent!</h2>
          <p className="text-sm text-gray-500">The manager has been notified via WhatsApp.</p>
          <button onClick={() => window.location.reload()} className="mt-4 text-[#00d2d3] font-medium">Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] pb-24 text-gray-800">
      {/* Header */}
      <div className="bg-white px-6 py-8 rounded-b-[2rem] shadow-sm mb-6">
        <h1 className="text-2xl font-semibold">Cleaner Portal</h1>
        <p className="text-gray-500 text-sm mt-1">Quality Control & Reporting</p>
      </div>

      <div className="max-w-md mx-auto px-4 space-y-6">
        {/* Property Selector */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <label className="block text-sm font-medium mb-2 text-gray-700">Select Property</label>
          <select 
            className="w-full bg-gray-50 px-4 py-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#00d2d3]"
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
          >
            <option value="">-- Choose Location --</option>
            <option value="villa-sol">Villa Sol</option>
            <option value="casa-blanca">Casa Blanca Ibiza</option>
            <option value="finca-mar">Finca del Mar</option>
          </select>
        </div>

        {/* Checklist */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <h2 className="font-medium text-gray-800">Cleaning Checklist</h2>
          
          {[
            { id: 'bedrooms', label: 'Slaapkamers (Bedden opgemaakt)' },
            { id: 'bathrooms', label: 'Badkamers (Handdoeken & schoon)' },
            { id: 'kitchen', label: 'Keuken (Koelkast leeg & aanrecht)' },
            { id: 'outdoor', label: 'Buiten (Zwembad & terras)' },
          ].map((item) => (
            <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-600">{item.label}</span>
              <button 
                onClick={() => toggleCheck(item.id as keyof typeof checklist)}
                className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${
                  checklist[item.id as keyof typeof checklist] ? 'bg-[#00d2d3]' : 'bg-gray-200'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm absolute transform transition-transform ${
                  checklist[item.id as keyof typeof checklist] ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          ))}
        </div>

        {/* Required Photos */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#00d2d3]" />
            <h2 className="font-medium text-gray-800">Photo Proof</h2>
          </div>
          <p className="text-xs text-gray-500 mb-2">Please upload at least 1 photo as proof.</p>
          <CloudinaryUpload onUploadSuccess={handlePhotoUpload} categoryName="General Check" />
        </div>

        {/* Damage Report */}
        <div className={`bg-white p-5 rounded-2xl shadow-sm border transition-colors ${damageReported ? 'border-red-200' : 'border-gray-100'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`w-5 h-5 ${damageReported ? 'text-red-500' : 'text-gray-400'}`} />
              <h2 className="font-medium text-gray-800">Schade Melden</h2>
            </div>
            <button 
              onClick={() => setDamageReported(!damageReported)}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${
                damageReported ? 'bg-red-500' : 'bg-gray-200'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm absolute transform transition-transform ${
                damageReported ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {damageReported && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
              <textarea 
                placeholder="Describe the broken item..."
                value={damageDesc}
                onChange={e => setDamageDesc(e.target.value)}
                className="w-full bg-red-50 px-4 py-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-red-400 text-sm h-24 resize-none"
              />
              <CloudinaryUpload onUploadSuccess={(url) => setDamagePhoto(url)} categoryName="Damage" />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting || !selectedProperty}
          className="w-full bg-[#202020] text-white py-4 rounded-full font-medium shadow-lg hover:bg-black transition-all disabled:opacity-50 mt-8 flex justify-center items-center"
        >
          {isSubmitting ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            'Verzenden (Submit)'
          )}
        </button>
      </div>
    </div>
  );
}
