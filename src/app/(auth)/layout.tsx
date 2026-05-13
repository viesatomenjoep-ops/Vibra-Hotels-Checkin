import React from "react";
import LanguageSelector from "@/components/LanguageSelector";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FDFCF9] flex flex-col justify-center items-center p-4 relative">
      <div className="absolute top-4 right-4 z-50">
        <LanguageSelector />
      </div>
      {children}
    </div>
  );
}
