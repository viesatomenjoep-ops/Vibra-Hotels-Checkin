"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, Language } from "@/lib/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("nl");

  useEffect(() => {
    // Check if there's a saved language in localStorage
    const savedLang = localStorage.getItem("viesa_lang") as Language;
    if (savedLang && translations[savedLang]) {
      setLanguageState(savedLang);
    } else {
      // Default to browser language if supported
      const browserLang = navigator.language.split('-')[0] as Language;
      if (translations[browserLang]) {
        setLanguageState(browserLang);
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("viesa_lang", lang);
  };

  const t = (key: string): string => {
    // Fallback to Dutch if the key doesn't exist in the selected language
    if (translations[language] && translations[language][key]) {
      return translations[language][key];
    }
    if (translations["nl"] && translations["nl"][key]) {
      return translations["nl"][key];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
