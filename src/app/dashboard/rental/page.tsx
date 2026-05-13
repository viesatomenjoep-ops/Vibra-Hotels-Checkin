"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Bike, Calendar, Clock } from "lucide-react";

export default function RentalDashboardPage() {
  const [bookings, setBookings] = useState<any[]>([]);
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
        // Fetch recent bookings
        const { data: bData } = await supabase
          .from("rental_bookings") // Using the new multi-tenant structure
          .select("*, customers(*)")
          .eq("company_id", profile.company_id)
          .order("created_at", { ascending: false })
          .limit(5);

        if (bData) {
          setBookings(bData);
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
            <Calendar size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Totaal Reserveringen</p>
            <h3 className="text-3xl font-bold text-slate-800">{bookings.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center space-x-4">
          <div className="p-4 bg-green-50 text-green-500 rounded-xl">
            <Bike size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Actief op Weg</p>
            <h3 className="text-3xl font-bold text-slate-800">
              {bookings.filter(b => b.status === "active").length}
            </h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center space-x-4">
          <div className="p-4 bg-orange-50 text-orange-500 rounded-xl">
            <Clock size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">In Afwachting</p>
            <h3 className="text-3xl font-bold text-slate-800">
              {bookings.filter(b => b.status === "reserved").length}
            </h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800">Recente Reserveringen</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#FDFCF9] text-xs uppercase text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">Klant</th>
                <th className="px-6 py-4">Periode</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-slate-400">
                    Nog geen reserveringen gevonden.
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">
                        {booking.customers?.first_name} {booking.customers?.last_name}
                      </div>
                      <div className="text-sm text-slate-500">{booking.customers?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-800">
                        {new Date(booking.start_date).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-slate-500">
                        tot {new Date(booking.end_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
                        booking.status === "reserved" ? "bg-orange-50 text-orange-600" :
                        booking.status === "active" ? "bg-green-50 text-green-600" :
                        "bg-slate-100 text-slate-600"
                      }`}>
                        {booking.status}
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
