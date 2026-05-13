"use client";

import React, { useEffect, useState } from "react";
import DashboardShell from "@/components/DashboardShell";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { FileSignature, ShieldCheck, Mail, Phone, Calendar } from "lucide-react";

export default function CheckinsPage() {
  const [checkins, setCheckins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCheckins = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("company_id")
        .eq("user_id", session.user.id)
        .single();
        
      if (profile?.company_id) {
        const { data } = await supabase
          .from("hotel_checkins")
          .select(`
            id,
            status,
            signature_url,
            checkin_date,
            customers (
              id,
              first_name,
              last_name,
              email,
              phone,
              country,
              id_photo_url
            )
          `)
          .eq("company_id", profile.company_id)
          .order("checkin_date", { ascending: false });
          
        if (data) {
          setCheckins(data);
        }
      }
      setLoading(false);
    };

    fetchCheckins();
  }, []);

  if (loading) {
    return (
      <DashboardShell title="Check-ins">
        <div className="flex items-center justify-center p-12">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 bg-slate-200 rounded-full mb-4"></div>
            <div className="text-slate-400">Check-ins laden...</div>
          </div>
        </div>
      </DashboardShell>
    );
  }



  return (
    <DashboardShell title="Check-ins">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex-1">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Check-ins & Reserveringen</h2>
            <p className="text-slate-500 mt-1">Beheer hier alle aankomende en voltooide check-ins.</p>
          </div>
          <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
            <span className="text-slate-600 font-bold">{checkins.length}</span> <span className="text-slate-400">Totaal</span>
          </div>
        </div>

        {checkins.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
            <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-700">Nog geen check-ins</h3>
            <p className="text-slate-500 mt-1">Gasten die de check-in voltooien, verschijnen hier automatisch.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-100 text-slate-500 text-sm">
                  <th className="pb-3 font-bold">Gast</th>
                  <th className="pb-3 font-bold">Contact</th>
                  <th className="pb-3 font-bold">Datum & Tijd</th>
                  <th className="pb-3 font-bold">Status</th>
                  <th className="pb-3 font-bold text-right">Documenten</th>
                </tr>
              </thead>
              <tbody>
                {checkins.map((checkin: any) => {
                  const customer = checkin.customers;
                  return (
                    <tr key={checkin.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                            {customer.first_name[0]}{customer.last_name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{customer.first_name} {customer.last_name}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-1 uppercase">
                              <span className="w-4 h-3 bg-slate-200 rounded-sm inline-block overflow-hidden relative">
                                {/* Simplified flag mapping could go here */}
                                {customer.country}
                              </span>
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="text-sm text-slate-600 space-y-1">
                          <div className="flex items-center gap-2"><Mail size={14} className="text-slate-400"/> {customer.email || '-'}</div>
                          <div className="flex items-center gap-2"><Phone size={14} className="text-slate-400"/> {customer.phone || '-'}</div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="text-sm text-slate-600">
                          <div className="flex items-center gap-2 font-medium">
                            <Calendar size={14} className="text-slate-400"/> 
                            {format(new Date(checkin.checkin_date), 'dd MMM yyyy')}
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            {format(new Date(checkin.checkin_date), 'HH:mm')}
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${checkin.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                          {checkin.status === 'completed' ? 'Voltooid' : 'In Behandeling'}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center justify-end gap-2">
                          {customer.id_photo_url && (
                            <a href={customer.id_photo_url} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-500 hover:text-blue-600 bg-white border border-slate-200 hover:border-blue-200 rounded-lg shadow-sm transition-colors" title="Bekijk ID Document">
                              <ShieldCheck size={18} />
                            </a>
                          )}
                          {checkin.signature_url && (
                            <a href={checkin.signature_url} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-500 hover:text-blue-600 bg-white border border-slate-200 hover:border-blue-200 rounded-lg shadow-sm transition-colors" title="Bekijk Handtekening">
                              <FileSignature size={18} />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
