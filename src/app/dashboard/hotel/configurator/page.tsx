"use client";

import React, { useState, useEffect } from "react";
import DashboardShell from "@/components/DashboardShell";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ConfiguratorPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companyId, setCompanyId] = useState<string>("");
  const [companySlug, setCompanySlug] = useState<string>("");
  
  const [color, setColor] = useState("#4A90E2");
  const [font, setFont] = useState("Inter");
  const [logoUrl, setLogoUrl] = useState("");
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
          if (comp.logo_url) setLogoUrl(comp.logo_url);
        }
      }
      setLoading(false);
    };
    fetchCompanyData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg("");
    
    // In a real app we'd also upload base64 to storage, but here we just accept a URL or assume it was done.
    const { error } = await supabase
      .from("companies")
      .update({
        primary_color: color,
        font_family: font,
        logo_url: logoUrl
      })
      .eq("id", companyId);

    setSaving(false);
    if (!error) {
      setSuccessMsg("Gepersonaliseerde Check-in succesvol opgeslagen!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } else {
      alert("Fout bij opslaan: " + error.message);
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
              <label className="block text-sm font-bold text-slate-700 mb-2">Logo URL</label>
              <input 
                type="text" 
                value={logoUrl} 
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#4A90E2] outline-none"
                placeholder="https://jouw-website.nl/logo.png"
              />
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

        {/* Live Preview (Mobile App Simulation) */}
        <div className="w-full xl:w-7/12 flex justify-center sticky top-8">
          <div 
            className="w-[320px] h-[640px] rounded-[3rem] shadow-2xl border-[12px] border-slate-800 bg-[#FDFCF9] relative overflow-hidden flex flex-col"
            style={{ fontFamily: font }}
          >
            {/* Dynamic iPhone Notch */}
            <div className="absolute top-0 inset-x-0 h-6 bg-slate-800 rounded-b-3xl w-1/2 mx-auto z-10"></div>
            
            {/* Header */}
            <div className="p-6 pt-12 text-center text-white" style={{ backgroundColor: color }}>
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-10 w-auto mx-auto object-contain mb-2 bg-white/20 p-2 rounded-lg" />
              ) : (
                <div className="h-10 w-24 bg-white/20 mx-auto rounded-lg mb-2 flex items-center justify-center font-bold">Jouw Logo</div>
              )}
              <p className="text-sm opacity-90 mt-2">Viesa Check-in</p>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 space-y-6 overflow-hidden">
              <h3 className="text-xl font-bold" style={{ color: color }}>Persoonlijke Gegevens</h3>
              <div className="space-y-4">
                <div className="h-14 bg-white rounded-xl border border-slate-200 w-full flex items-center px-4 shadow-sm">
                  <span className="w-5 h-5 rounded-full bg-slate-200"></span>
                  <div className="ml-3 h-2 w-1/2 bg-slate-200 rounded"></div>
                </div>
                <div className="h-14 bg-white rounded-xl border border-slate-200 w-full flex items-center px-4 shadow-sm">
                  <span className="w-5 h-5 rounded-full bg-slate-200"></span>
                  <div className="ml-3 h-2 w-2/3 bg-slate-200 rounded"></div>
                </div>
                <div className="h-28 bg-white rounded-xl border-2 border-dashed border-slate-300 w-full flex items-center justify-center flex-col text-slate-400 hover:bg-slate-50 transition-colors cursor-pointer">
                  <span className="text-3xl mb-2">📷</span>
                  <span className="text-xs font-bold uppercase tracking-wider">Upload Paspoort</span>
                </div>
              </div>
            </div>

            {/* Button */}
            <div className="p-6 bg-white border-t border-slate-100">
              <button className="w-full py-4 text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-[1.02]" style={{ backgroundColor: color }}>
                Voltooi Check-in
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
