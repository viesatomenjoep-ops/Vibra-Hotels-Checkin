"use client";

import React from "react";
import DashboardShell from "@/components/DashboardShell";

export default function BeachbedsPage() {
  return (
    <DashboardShell title="Strandbedden Reserveringen">
      <div className="w-full h-full bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-slate-100 flex flex-col">
        {/* Placeholder banner until exact URL is provided */}
        <div className="bg-[#EADBB6]/20 p-4 border-b border-[#EADBB6]/40 flex justify-between items-center">
          <div>
            <h3 className="font-medium text-slate-800">Externe Strandbedden Module</h3>
            <p className="text-sm text-slate-500">De externe link wordt hier ge-embed.</p>
          </div>
          <a 
            href="https://viesa-reserve.com" // Placeholder
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm font-medium text-[#4A90E2] bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
          >
            Open in nieuw venster
          </a>
        </div>
        
        <div className="flex-1 w-full bg-slate-50 relative">
          <iframe 
            src="https://example.com" // Placeholder - de gebruiker kan hier de echte URL plaatsen
            className="absolute inset-0 w-full h-full border-0"
            title="Strandbedden Verhuur Systeem"
            allow="fullscreen"
          />
        </div>
      </div>
    </DashboardShell>
  );
}
