"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  Building2, Bike, Umbrella, LogOut, Menu, X, Home, Settings, Users 
} from "lucide-react";

type Company = {
  id: string;
  name: string;
  branch_category: "hotel" | "rental" | "beachbeds";
  primary_color: string;
  accent_color: string;
};

export default function DashboardShell({
  children,
  title
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchContext = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("company_id")
        .eq("id", session.user.id)
        .single();

      if (profile && profile.company_id) {
        const { data: comp } = await supabase
          .from("companies")
          .select("*")
          .eq("id", profile.company_id)
          .single();
        
        if (comp) {
          setCompany(comp);
        } else {
          router.push("/onboarding");
        }
      } else {
        router.push("/onboarding");
      }
      setLoading(false);
    };

    fetchContext();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFCF9] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-slate-200 rounded-full mb-4"></div>
          <div className="text-slate-400">Laden...</div>
        </div>
      </div>
    );
  }

  if (!company) return null;

  const getNavItems = () => {
    if (company.branch_category === "hotel") {
      return [
        { label: "Dashboard", href: "/dashboard/hotel", icon: <Home size={20} /> },
        { label: "Gasten", href: "/dashboard/hotel/guests", icon: <Users size={20} /> },
        { label: "Check-ins", href: "/dashboard/hotel/list", icon: <Building2 size={20} /> },
      ];
    }
    if (company.branch_category === "rental") {
      return [
        { label: "Dashboard", href: "/dashboard/rental", icon: <Home size={20} /> },
        { label: "Vloot", href: "/dashboard/rental/fleet", icon: <Bike size={20} /> },
        { label: "Reserveringen", href: "/dashboard/rental/bookings", icon: <Users size={20} /> },
      ];
    }
    if (company.branch_category === "beachbeds") {
      return [
        { label: "Dashboard", href: "/dashboard/beachbeds", icon: <Home size={20} /> },
        { label: "Strandbedden", href: "/dashboard/beachbeds/map", icon: <Umbrella size={20} /> },
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-[#FDFCF9] flex font-sans text-slate-800">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-100 shadow-[2px_0_20px_rgb(0,0,0,0.02)]
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="p-6 flex items-center justify-between border-b border-slate-50">
          <div>
            <h2 className="text-xl font-bold tracking-tight" style={{ color: company.accent_color }}>Viesa</h2>
            <p className="text-xs text-slate-400 font-medium truncate w-40">{company.name}</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? `bg-[#FDFCF9] font-medium shadow-sm border border-slate-100` 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
                style={isActive ? { color: company.accent_color } : {}}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-50">
          <Link 
            href="/settings"
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors mb-2"
          >
            <Settings size={20} />
            <span>Instellingen</span>
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            <span>Uitloggen</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-6 lg:px-10 z-30 shrink-0">
          <div className="flex items-center">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="mr-4 text-slate-500 hover:text-slate-800 lg:hidden"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-2xl font-semibold tracking-tight">{title || "Dashboard"}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 rounded-full bg-[#EADBB6] flex items-center justify-center text-white font-bold text-lg shadow-sm">
              {company.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6 lg:p-10 bg-[#FDFCF9]">
          {children}
        </div>
      </main>
    </div>
  );
}
