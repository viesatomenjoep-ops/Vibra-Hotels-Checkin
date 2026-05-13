"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Building2, Bike, Umbrella } from "lucide-react";

export default function OnboardingPage() {
  const [companyName, setCompanyName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"hotel" | "rental" | "beachbeds" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      }
    };
    checkAuth();
  }, [router]);

  const handleComplete = async () => {
    if (!companyName || !selectedCategory) {
      setError("Vul een bedrijfsnaam in en kies een categorie.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Niet ingelogd");

      const promoCode = localStorage.getItem("viesa_promo_code") || null;
      
      // In a real production scenario, this should be an API route to securely create tenant records.
      // We will simulate the API call here.
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          category: selectedCategory,
          promoCode,
          userId: userData.user.id,
          userFullName: userData.user.user_metadata?.full_name || "Gebruiker",
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Fout bij opslaan");
      }

      localStorage.removeItem("viesa_promo_code");

      // Redirect based on category
      if (selectedCategory === "hotel") router.push("/dashboard/hotel");
      if (selectedCategory === "rental") router.push("/dashboard/rental");
      if (selectedCategory === "beachbeds") router.push("/dashboard/beachbeds");

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-semibold text-slate-800 tracking-tight">Welkom bij Viesa</h1>
        <p className="text-slate-500 mt-2">Laten we je account instellen. Welke branche ben je actief in?</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-6 text-center">
          {error}
        </div>
      )}

      <div className="mb-8">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Naam van je bedrijf
        </label>
        <input
          type="text"
          required
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent transition-all bg-[#FDFCF9] text-lg"
          placeholder="Bijv. Ibiza Sunset Hotel"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {/* Hotel Option */}
        <button
          onClick={() => setSelectedCategory("hotel")}
          className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${
            selectedCategory === "hotel"
              ? "border-[#4A90E2] bg-blue-50 text-[#4A90E2]"
              : "border-slate-100 hover:border-[#EADBB6] text-slate-500"
          }`}
        >
          <Building2 size={36} className="mb-3" />
          <span className="font-medium">Hotel Check-in</span>
        </button>

        {/* Rental Option */}
        <button
          onClick={() => setSelectedCategory("rental")}
          className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${
            selectedCategory === "rental"
              ? "border-[#4A90E2] bg-blue-50 text-[#4A90E2]"
              : "border-slate-100 hover:border-[#EADBB6] text-slate-500"
          }`}
        >
          <Bike size={36} className="mb-3" />
          <span className="font-medium">Verhuurbedrijf</span>
        </button>

        {/* Beachbeds Option */}
        <button
          onClick={() => setSelectedCategory("beachbeds")}
          className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${
            selectedCategory === "beachbeds"
              ? "border-[#4A90E2] bg-blue-50 text-[#4A90E2]"
              : "border-slate-100 hover:border-[#EADBB6] text-slate-500"
          }`}
        >
          <Umbrella size={36} className="mb-3" />
          <span className="font-medium">Strandbedden</span>
        </button>
      </div>

      <button
        onClick={handleComplete}
        disabled={loading || !selectedCategory || !companyName}
        className="w-full bg-[#4A90E2] hover:bg-[#3A7BC8] text-white font-medium py-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Bezig met instellen..." : "Afronden en naar Dashboard"}
      </button>
    </div>
  );
}
