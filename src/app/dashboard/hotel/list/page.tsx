import React from "react";
import DashboardShell from "@/components/DashboardShell";

export default function CheckinsPage() {
  return (
    <DashboardShell title="Check-ins">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-semibold mb-4">Check-ins & Reserveringen</h2>
        <p className="text-slate-500">Beheer hier alle aankomende en voltooide check-ins. Je kunt ook ID-kaarten en handtekeningen raadplegen.</p>
      </div>
    </DashboardShell>
  );
}
