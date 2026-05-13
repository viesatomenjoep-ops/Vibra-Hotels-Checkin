import React from "react";
import DashboardShell from "@/components/DashboardShell";
import { Calendar } from "lucide-react";

export default function BeachbedsReservationsPage() {
  return (
    <DashboardShell title="Reserveringen">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex-1">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Strandbedden Reserveringen</h2>
        <p className="text-slate-500 mb-8">Bekijk hier alle reserveringen voor je bedden en cabana's.</p>
        
        <div className="text-center py-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700">Geen actieve reserveringen</h3>
          <p className="text-slate-500 mt-1">Reserveringen via het gastenportaal verschijnen hier.</p>
        </div>
      </div>
    </DashboardShell>
  );
}
