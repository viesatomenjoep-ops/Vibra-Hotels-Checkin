"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import { clsx } from 'clsx';
import { Info, Map as MapIcon, List, ArrowLeft, ChevronRight, Palmtree, UtensilsCrossed, BedDouble, MapPin } from 'lucide-react';
import { Bed } from './AdminBedEditor';

export interface Location {
  id: string;
  name: string;
  pos_x: number;
  pos_y: number;
}

export interface Area {
  id: string;
  location_id: string;
  name: string;
  type: string;
  pos_x: number;
  pos_y: number;
}

interface InteractiveMapProps {
  onBedSelect: (bed: Bed) => void;
}

export default function InteractiveMap({ onBedSelect }: InteractiveMapProps) {
  const { t } = useLanguage();
  const [locations, setLocations] = useState<Location[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [activeArea, setActiveArea] = useState<Area | null>(null);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [venue, setVenue] = useState({ name: 'VIESA', map_image_url: '/calabassa-map.jpg' });
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);
  
  // Mobile-first: Default to LIST view. User can toggle to MAP.
  const [viewMode, setViewMode] = useState<'LIST' | 'MAP'>('LIST');

  useEffect(() => {
    fetchData();

    // Set up realtime subscriptions
    const channel = supabase.channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'beds' }, (payload) => {
        setBeds(current => {
          if (payload.eventType === 'UPDATE') return current.map(b => b.id === payload.new.id ? payload.new as Bed : b);
          if (payload.eventType === 'INSERT') return [...current, payload.new as Bed];
          if (payload.eventType === 'DELETE') return current.filter(b => b.id !== payload.old.id);
          return current;
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchData = async () => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
      setLocations([
        { id: '1', name: 'Zone 1', pos_x: 15, pos_y: 50 },
        { id: '2', name: 'Zone 2', pos_x: 30, pos_y: 25 },
        { id: '3', name: 'Zone 3', pos_x: 65, pos_y: 25 },
        { id: '4', name: 'Zone 4', pos_x: 85, pos_y: 45 },
        { id: '5', name: 'Zone 5', pos_x: 90, pos_y: 75 },
      ]);
      setAreas([
        { id: 'a1', location_id: '1', name: 'Restaurante Chiringo', type: 'RESTAURANT', pos_x: 5, pos_y: 40 },
        { id: 'a2', location_id: '1', name: 'Camas Chiringo', type: 'BEDS', pos_x: 18, pos_y: 38 },
        { id: 'a3', location_id: '1', name: 'Hamacas Chiringo', type: 'HAMMOCKS', pos_x: 15, pos_y: 60 },
        { id: 'a4', location_id: '2', name: 'Hamacas Mumm', type: 'HAMMOCKS', pos_x: 35, pos_y: 20 },
        { id: 'a5', location_id: '2', name: 'Camas Mumm', type: 'BEDS', pos_x: 38, pos_y: 35 },
      ]);
      return;
    }
    
    const { data: venueData } = await supabase.from('venues').select('name, map_image_url').limit(1).single();
    if (venueData) setVenue(venueData);

    const { data: locData } = await supabase.from('locations').select('*');
    const { data: areaData } = await supabase.from('areas').select('*');
    if (locData) setLocations(locData);
    if (areaData) setAreas(areaData);
  };

  const fetchBedsData = async (areaId: string) => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
      setBeds([
        { id: 'b1', area_id: areaId, name: 'Row 1 - A', price: 50, min_spend: 100, status: 'AVAILABLE', pos_x: 20, pos_y: 20 },
        { id: 'b2', area_id: areaId, name: 'Row 1 - B', price: 50, min_spend: 100, status: 'AVAILABLE', pos_x: 50, pos_y: 20 },
        { id: 'b3', area_id: areaId, name: 'Row 1 - C', price: 50, min_spend: 100, status: 'PARTIAL', pos_x: 80, pos_y: 20 },
        { id: 'b4', area_id: areaId, name: 'Row 2 - A', price: 40, min_spend: 80, status: 'AVAILABLE', pos_x: 20, pos_y: 50 },
        { id: 'b5', area_id: areaId, name: 'Row 2 - B', price: 40, min_spend: 80, status: 'BOOKED', pos_x: 50, pos_y: 50 },
        { id: 'b6', area_id: areaId, name: 'Row 2 - C', price: 40, min_spend: 80, status: 'AVAILABLE', pos_x: 80, pos_y: 50 },
      ]);
      return;
    }
    const { data } = await supabase.from('beds').select('*').eq('area_id', areaId);
    if (data) setBeds(data as Bed[]);

    const channel = supabase.channel('schema-db-changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'beds' }, (payload) => {
        setBeds(current => current.map(b => b.id === payload.new.id ? { ...b, ...payload.new } : b));
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-emerald-50 hover:bg-emerald-100 border-emerald-500 text-emerald-900 shadow-emerald-500/20';
      case 'PARTIAL': return 'bg-orange-50 hover:bg-orange-100 border-orange-400 text-orange-900 shadow-orange-400/20';
      case 'BOOKED': return 'bg-stone-200 border-red-400 text-red-900 opacity-60 cursor-not-allowed';
      default: return 'bg-stone-100 border-stone-300';
    }
  };

  const getAreaIcon = (type: string) => {
    switch (type) {
      case 'RESTAURANT': return <UtensilsCrossed className="w-5 h-5 text-stone-500" />;
      case 'HAMMOCKS': return <Palmtree className="w-5 h-5 text-emerald-600" />;
      case 'BEDS': return <BedDouble className="w-5 h-5 text-blue-600" />;
      default: return <MapPin className="w-5 h-5 text-stone-500" />;
    }
  };

  // ---------------------------------------------------------------------------
  // RENDER: STADIUM GRID SELECTION (Once an area is chosen)
  // ---------------------------------------------------------------------------
  if (activeArea) {
    return (
      <div className="w-full max-w-4xl mx-auto my-8 px-4 sm:px-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button 
          onClick={() => setActiveArea(null)}
          className="flex items-center text-stone-500 hover:text-stone-900 mb-6 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Zones
        </button>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-6 gap-4">
          <div>
            <h2 className="text-3xl font-serif font-bold text-stone-900">{activeArea.name}</h2>
            <p className="text-stone-500">Select a bed to continue your reservation.</p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm font-medium">
            <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div> {t('available')}</div>
            <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-orange-400 mr-2"></div> Partial</div>
            <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div> Booked</div>
          </div>
        </div>

        {/* Static Grid Container matching Admin */}
        <div className="overflow-x-auto pb-8">
          <div className="max-w-5xl mx-auto bg-white p-6 sm:p-10 rounded-2xl shadow-xl border border-stone-200 min-w-[600px]">
            <div className="w-full text-center py-2 bg-blue-50 text-blue-800 rounded-xl text-xs font-bold uppercase tracking-widest mb-8">
              Water Side (Front)
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {beds.map((bed) => (
                <button
                  key={bed.id}
                  onClick={() => (bed.status === 'AVAILABLE' || bed.status === 'PARTIAL') && onBedSelect(bed)}
                  disabled={bed.status === 'BOOKED'}
                  className={clsx(
                    "aspect-square border-2 rounded-2xl flex flex-col items-center justify-center shadow-sm transition-all duration-300 w-full",
                    getStatusColor(bed.status),
                    (bed.status === 'AVAILABLE' || bed.status === 'PARTIAL') && "hover:scale-105 hover:shadow-md active:scale-95"
                  )}
                >
                  <span className="font-bold text-sm sm:text-base text-center px-2">{bed.name}</span>
                  {bed.status === 'PARTIAL' && <span className="text-[0.6rem] font-bold text-orange-600 mt-1">Tot {bed.reserved_until}</span>}
                  <span className="text-xs font-medium opacity-80 mt-1">€{bed.price}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // RENDER: ZONE / AREA SELECTION (List or Map)
  // ---------------------------------------------------------------------------
  return (
    <div className="w-full max-w-5xl mx-auto my-8 px-4 sm:px-0 relative animate-in fade-in zoom-in-95 duration-500">
      
      {/* Top Toggle Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">Select a Location</h2>
          <p className="text-stone-500 text-sm">Choose your preferred spot at the beach club.</p>
        </div>

        <div className="flex bg-stone-100 p-1 rounded-xl self-stretch sm:self-auto">
          <button 
            onClick={() => setViewMode('LIST')}
            className={clsx("flex-1 sm:flex-none flex justify-center items-center px-6 py-2.5 rounded-lg font-medium transition-all text-sm", viewMode === 'LIST' ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700")}
          >
            <List className="w-4 h-4 mr-2" /> List View
          </button>
          <button 
            onClick={() => setViewMode('MAP')}
            className={clsx("flex-1 sm:flex-none flex justify-center items-center px-6 py-2.5 rounded-lg font-medium transition-all text-sm", viewMode === 'MAP' ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700")}
          >
            <MapIcon className="w-4 h-4 mr-2" /> Map View
          </button>
        </div>
      </div>

      {viewMode === 'LIST' ? (
        // Mobile-Friendly List View
        <div className="space-y-8">
          {locations.map(loc => {
            const locAreas = areas.filter(a => a.location_id === loc.id);
            if (locAreas.length === 0) return null;
            return (
              <div key={loc.id} className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-100">
                <h3 className="text-xl font-serif font-bold text-stone-900 mb-4">{loc.name.replace('Zone ', 'Zone ')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {locAreas.map(area => (
                    <button
                      key={area.id}
                      onClick={() => setActiveArea(area)}
                      className="flex items-center justify-between p-4 rounded-2xl border-2 border-stone-100 hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-md transition-all text-left group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-stone-100 rounded-xl group-hover:bg-white transition-colors">
                          {getAreaIcon(area.type)}
                        </div>
                        <div>
                          <p className="font-bold text-stone-900">{area.name}</p>
                          <p className="text-xs text-stone-500 uppercase tracking-wider">{area.type}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-emerald-500 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Desktop-Friendly Interactive Map
        <div className="relative w-full aspect-[4/5] sm:aspect-[4/3] md:aspect-[16/9] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/50 bg-stone-300"
             style={{ backgroundImage: `url('${venue.map_image_url}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
          
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>

          {/* Zones */}
          {locations.map((loc) => (
            <div
              key={loc.id}
              onMouseEnter={() => setHoveredLocation(loc.id)}
              onMouseLeave={() => setHoveredLocation(null)}
              style={{ left: `${loc.pos_x}%`, top: `${loc.pos_y}%` }}
              className={clsx(
                "absolute -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all duration-300 cursor-pointer",
                hoveredLocation === loc.id || areas.some(a => a.location_id === loc.id && a.id === hoveredLocation)
                  ? "bg-emerald-500/20 border-4 border-emerald-500/50 z-20 scale-110" 
                  : "bg-transparent z-10"
              )}
            >
              {/* Invisible hotspot for the pre-drawn circles on the map */}
            </div>
          ))}

          {/* Areas */}
          {areas.map((area) => {
            const isHovered = hoveredLocation === area.location_id || hoveredLocation === area.id;
            return (
              <button
                key={area.id}
                onMouseEnter={() => setHoveredLocation(area.id)}
                onMouseLeave={() => setHoveredLocation(null)}
                onClick={() => setActiveArea(area)}
                style={{ left: `${area.pos_x}%`, top: `${area.pos_y}%` }}
                className={clsx(
                  "absolute -translate-x-1/2 -translate-y-1/2 px-4 py-2 rounded-xl text-sm font-bold shadow-xl border-2 whitespace-nowrap transition-all duration-300 flex items-center",
                  isHovered
                    ? "bg-emerald-600 text-white border-white z-40 scale-110 hover:bg-emerald-500" 
                    : "bg-stone-900/80 text-white/90 border-transparent z-30 hover:scale-105"
                )}
              >
                {area.name}
              </button>
            );
          })}
        </div>
      )}
      
      {viewMode === 'MAP' && (
        <div className="mt-6 flex items-start text-stone-600 text-sm bg-white p-5 rounded-2xl shadow-sm border border-stone-100 hidden sm:flex">
          <Info className="w-5 h-5 mr-3 flex-shrink-0 text-stone-400 mt-0.5" />
          <p>Explore the beach club map. Hover over a zone to highlight it, and click on any specific area (e.g. "Camas Chiringo") to view the available beds and make a reservation.</p>
        </div>
      )}
    </div>
  );
}
