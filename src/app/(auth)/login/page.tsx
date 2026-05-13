"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LoginPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    // Check user's company to route them
    const { data: userResp } = await supabase.auth.getUser();
    if (userResp.user) {
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("company_id")
        .eq("id", userResp.user.id)
        .single();

      if (profile && profile.company_id) {
        const { data: company } = await supabase
          .from("companies")
          .select("branch_category")
          .eq("id", profile.company_id)
          .single();

        if (company?.branch_category === "hotel") {
          router.push("/dashboard/hotel");
        } else if (company?.branch_category === "rental") {
          router.push("/dashboard/rental");
        } else if (company?.branch_category === "beachbeds") {
          // Temporarily routing back to home or a specific URL
          router.push("/dashboard/beachbeds");
        } else {
          router.push("/onboarding");
        }
      } else {
        router.push("/onboarding");
      }
    }
    
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold text-slate-800 tracking-tight">{t("login_title")}</h1>
        <p className="text-slate-500 mt-2 text-sm">{t("login_subtitle")}</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
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
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#4A90E2] hover:bg-[#3A7BC8] text-white font-medium py-3 rounded-xl transition-colors mt-2 disabled:opacity-70"
        >
          {loading ? t("login_loading") : t("login_button")}
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-slate-500">
        {t("no_account")}{" "}
        <Link href="/register" className="text-[#4A90E2] font-medium hover:underline">
          {t("create_account")}
        </Link>
      </div>
    </div>
  );
}
