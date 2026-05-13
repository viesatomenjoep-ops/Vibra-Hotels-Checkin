"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function RegisterPage() {
  const { t } = useLanguage();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // 1. Sign up user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (signUpData.user) {
      // 2. We store the promo code in local storage or pass via URL so onboarding can pick it up when creating the company.
      if (promoCode) {
        localStorage.setItem("viesa_promo_code", promoCode);
      }
      
      router.push("/onboarding");
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold text-slate-800 tracking-tight">{t("register_title")}</h1>
        <p className="text-slate-500 mt-2 text-sm">{t("register_subtitle")}</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {t("full_name_label")}
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent transition-all bg-[#FDFCF9]"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {t("email_label")}
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent transition-all bg-[#FDFCF9]"
            placeholder="naam@bedrijf.nl"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {t("password_label")}
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent transition-all bg-[#FDFCF9]"
            placeholder="Minimaal 8 tekens"
            minLength={8}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {t("promo_code_label")}
          </label>
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#EADBB6] focus:border-transparent transition-all bg-[#FDFCF9]"
            placeholder={t("promo_code_placeholder")}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#4A90E2] hover:bg-[#3A7BC8] text-white font-medium py-3 rounded-xl transition-colors mt-4 disabled:opacity-70"
        >
          {loading ? t("register_loading") : t("register_button")}
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-slate-500">
        {t("already_account")}{" "}
        <Link href="/login" className="text-[#4A90E2] font-medium hover:underline">
          {t("login_link")}
        </Link>
      </div>
    </div>
  );
}
