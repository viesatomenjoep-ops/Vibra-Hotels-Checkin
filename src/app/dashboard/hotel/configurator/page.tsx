"use client";

import React, { useState, useEffect } from "react";
import DashboardShell from "@/components/DashboardShell";
import { supabase } from "@/lib/supabase";
import { saveTenantBranding } from "@/actions/saveTenantBranding";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ConfiguratorPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companyId, setCompanyId] = useState<string>("");
  const [companySlug, setCompanySlug] = useState<string>("");
  
  const [color, setColor] = useState("#4A90E2");
  const [font, setFont] = useState("Inter");
  const [logoBase64, setLogoBase64] = useState("");
  const [logoFileName, setLogoFileName] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  useEffect(() => {
    const fetchCompanyData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("company_id")
        .eq("id", session.user.id)
        .single();

      if (profile && profile.company_id) {
        setCompanyId(profile.company_id);
        const { data: comp } = await supabase
          .from("companies")
          .select("*")
          .eq("id", profile.company_id)
          .single();
          
        if (comp) {
          setCompanySlug(comp.slug);
          if (comp.primary_color) setColor(comp.primary_color);
          if (comp.font_family) setFont(comp.font_family);
          if (comp.logo_url) setLogoBase64(comp.logo_url);
        }
      }
      setLoading(false);
    };
    fetchCompanyData();
  }, []);

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
          setLogoBase64(canvas.toDataURL('image/png', 0.8));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg("");
    
    const formData = new FormData();
    formData.append("companyId", companyId);
    formData.append("slug", companySlug);
    formData.append("color", color);
    formData.append("font_family", font);
    formData.append("logoBase64", logoBase64);

    const result = await saveTenantBranding(formData);

    setSaving(false);
    if (result.success) {
      setSuccessMsg("Gepersonaliseerde Check-in succesvol opgeslagen!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } else {
      alert("Fout bij opslaan: " + result.message);
    }
  };

  const encodedFont = font.replace(/ /g, "+");

  if (loading) return <DashboardShell title="Check-in App"><p>Laden...</p></DashboardShell>;

  return (
    <DashboardShell title="Check-in App">
      <link href={`https://fonts.googleapis.com/css2?family=${encodedFont}:wght@400;500;600;700;800;900&display=swap`} rel="stylesheet" />
      
      <div className="flex flex-col xl:flex-row gap-8 items-start w-full">
        {/* Editor Form */}
        <div className="w-full xl:w-5/12 bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex-shrink-0">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Personaliseer Check-in</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Huisstijl Kleur</label>
              <div className="flex gap-4 items-center">
                <input 
                  type="color" 
                  value={color} 
                  onChange={(e) => setColor(e.target.value)}
                  className="w-14 h-14 rounded cursor-pointer border-0 p-0"
                />
                <input 
                  type="text" 
                  value={color} 
                  onChange={(e) => setColor(e.target.value)}
                  className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4A90E2] outline-none uppercase font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Typografie / Lettertype</label>
              <select 
                value={font} 
                onChange={(e) => setFont(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4A90E2] outline-none"
                style={{ fontFamily: font }}
              >
                <option value="Inter">Inter (Modern & Clean)</option>
                <option value="Playfair Display">Playfair Display (Luxe & Klassiek)</option>
                <option value="Montserrat">Montserrat (Geometrisch & Strak)</option>
                <option value="Outfit">Outfit (Tech & Fris)</option>
                <option value="Cormorant Garamond">Cormorant Garamond (Boutique & Elegant)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Upload Logo (Automatische Cloudinary Sync)</label>
              <div className="flex flex-col gap-4">
                <label className="w-full flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                  <div className="text-white px-4 py-2 rounded-lg font-medium text-sm" style={{ backgroundColor: color }}>
                    Kies Bestand
                  </div>
                  <span className="text-slate-500 text-sm truncate flex-1">
                    {logoFileName || 'Geen bestand gekozen'}
                  </span>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
                {logoBase64 && (
                  <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center bg-slate-50 h-32">
                    <img src={logoBase64} alt="Preview" className="max-h-full object-contain" />
                  </div>
                )}
              </div>
            </div>

            <button 
              onClick={handleSave}
              disabled={saving}
              className="w-full py-4 text-white rounded-xl font-bold text-lg transition-colors shadow-md"
              style={{ backgroundColor: color }}
            >
              {saving ? "Bezig met opslaan..." : "Wijzigingen Opslaan"}
            </button>
            
            {successMsg && (
              <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 text-sm font-medium">
                {successMsg}
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-slate-100">
              <p className="text-sm text-slate-500 mb-3">Live Check-in Link voor gasten:</p>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-xs overflow-hidden text-ellipsis whitespace-nowrap">
                {typeof window !== 'undefined' ? `${window.location.origin}/kiosk/${companySlug}` : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Exact Match of Pitch Preview */}
        <div className="w-full xl:w-7/12 sticky top-8 space-y-8">
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
                <p className="mt-2 text-lg text-white opacity-90">Start Digital Check-in</p>
                <div className="w-full h-1 bg-white/20 rounded-full my-6"></div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-white opacity-90"><div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">1</div> Scan your ID Document</div>
                  <div className="flex items-center gap-4 text-white opacity-90"><div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">2</div> Confirm Personal Details</div>
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
                <p className="mt-6 font-bold tracking-widest uppercase text-sm opacity-80" style={{ color: color }}>SCAN HERE TO START</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
