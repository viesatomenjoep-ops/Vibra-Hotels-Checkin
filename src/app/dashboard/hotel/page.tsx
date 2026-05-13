"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Building2, Users, CheckCircle } from "lucide-react";

export default function HotelDashboardPage() {
  const [checkins, setCheckins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("company_id")
        .eq("id", session.user.id)
        .single();

      if (profile?.company_id) {
        // Fetch recent checkins
        const { data: cData } = await supabase
          .from("hotel_checkins") // Using the new multi-tenant structure
          .select("*, customers(*)")
          .eq("company_id", profile.company_id)
          .order("created_at", { ascending: false })
          .limit(5);

        if (cData) {
          setCheckins(cData);
        }
      }
      setLoading(false);
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="animate-pulse">Statistieken laden...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center space-x-4">
          <div className="p-4 bg-blue-50 text-[#4A90E2] rounded-xl">
            <Building2 size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Aankomsten Vandaag</p>
            <h3 className="text-3xl font-bold text-slate-800">{checkins.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center space-x-4">
          <div className="p-4 bg-green-50 text-green-500 rounded-xl">
            <CheckCircle size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Ingecheckt</p>
            <h3 className="text-3xl font-bold text-slate-800">
              {checkins.filter(c => c.status === "completed").length}
            </h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center space-x-4">
          <div className="p-4 bg-orange-50 text-orange-500 rounded-xl">
            <Users size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Wachtend</p>
            <h3 className="text-3xl font-bold text-slate-800">
              {checkins.filter(c => c.status === "pending").length}
            </h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800">Recente Check-ins</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#FDFCF9] text-xs uppercase text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">Gast</th>
                <th className="px-6 py-4">Datum</th>
                <th className="px-6 py-4">Kamer</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {checkins.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                    Nog geen check-ins gevonden.
                  </td>
                </tr>
              ) : (
                checkins.map((checkin) => (
                  <tr key={checkin.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">
                        {checkin.customers?.first_name} {checkin.customers?.last_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(checkin.checkin_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">
                      {checkin.room_number || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
                        checkin.status === "completed" ? "bg-green-50 text-green-600" :
                        checkin.status === "pending" ? "bg-orange-50 text-orange-600" :
                        "bg-slate-100 text-slate-600"
                      }`}>
                        {checkin.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
