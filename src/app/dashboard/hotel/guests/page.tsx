import React from "react";
import DashboardShell from "@/components/DashboardShell";

export default function GuestsPage() {
  return (
    <DashboardShell title="Gasten">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-semibold mb-4">Gastenoverzicht</h2>
        <p className="text-slate-500">Hier komt de lijst met al je hotelgasten. Je kunt hier gasten zoeken, bewerken en hun check-in status inzien.</p>
      </div>
    </DashboardShell>
  );
}
