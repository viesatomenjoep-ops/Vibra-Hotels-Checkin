"use client";

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Crosshair, Grid, X, Settings2, Edit3, Trash2, Save, MapPin } from 'lucide-react';
import { clsx } from 'clsx';
import AdminBedEditor from './AdminBedEditor';

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

export interface Venue {
  id: string;
  name: string;
  location_address: string;
  map_image_url: string;
  logo_url?: string;
}

export default function AdminMapEditor() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [venue, setVenue] = useState<Venue | null>(null);
  
  const [activeArea, setActiveArea] = useState<Area | null>(null);
  
  // Modals for Create/Edit
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [showVenueModal, setShowVenueModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: 'BEDS' });
  const [venueFormData, setVenueFormData] = useState({ name: '', location_address: '', map_image_url: '', logo_url: '' });
  const [modalTargetLocationId, setModalTargetLocationId] = useState<string | null>(null);

  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [editingArea, setEditingArea] = useState<Area | null>(null);

  // Moving logic
  const [movingItem, setMovingItem] = useState<{ id: string, type: 'LOCATION' | 'AREA', name: string } | null>(null);
  const [hasUnsavedMapChanges, setHasUnsavedMapChanges] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
      setVenue({
        id: '0', name: 'VIESA Beach Club', location_address: 'Ibiza', map_image_url: '/calabassa-map.jpg'
      });
      setLocations([
        { id: '1', name: 'Zone 1', pos_x: 15, pos_y: 50 },
        { id: '2', name: 'Zone 2', pos_x: 30, pos_y: 25 }
      ]);
      setAreas([
        { id: 'a1', location_id: '1', name: 'Restaurante Chiringo', type: 'RESTAURANT', pos_x: 5, pos_y: 40 },
        { id: 'a2', location_id: '1', name: 'Camas Chiringo', type: 'BEDS', pos_x: 18, pos_y: 38 },
        { id: 'a4', location_id: '2', name: 'Hamacas Mumm', type: 'HAMMOCKS', pos_x: 35, pos_y: 20 },
      ]);
      return;
    }

    const { data: venueData } = await supabase.from('venues').select('*').limit(1).single();
    const { data: locData } = await supabase.from('locations').select('*');
    const { data: areaData } = await supabase.from('areas').select('*');
    
    if (venueData) {
      setVenue(venueData);
      setVenueFormData({ name: venueData.name, location_address: venueData.location_address || '', map_image_url: venueData.map_image_url, logo_url: venueData.logo_url || '' });
    } else {
      // Fallback if no venue exists yet
      setVenue({ id: 'fallback', name: 'VIESA Beach Club', location_address: '', map_image_url: '/calabassa-map.jpg', logo_url: '' });
      setVenueFormData({ name: 'VIESA Beach Club', location_address: '', map_image_url: '/calabassa-map.jpg', logo_url: '' });
    }
    
    if (locData) setLocations(locData);
    if (areaData) setAreas(areaData);
    setHasUnsavedMapChanges(false);
  };

  // Click on the map to place the moving item
  const handleMapClick = (e: React.MouseEvent) => {
    if (!movingItem || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const xPct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    if (movingItem.type === 'LOCATION') {
      setLocations(prev => prev.map(loc => loc.id === movingItem.id ? { ...loc, pos_x: xPct, pos_y: yPct } : loc));
    } else {
      setAreas(prev => prev.map(area => area.id === movingItem.id ? { ...area, pos_x: xPct, pos_y: yPct } : area));
    }
    
    setHasUnsavedMapChanges(true);
    setMovingItem(null);
  };

  // Explicit Save Map Button
  const saveMapPositions = async () => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
      alert('Map positions saved successfully (Mock Mode)');
      setHasUnsavedMapChanges(false);
      return;
    }

    try {
      const locationPromises = locations.map(loc => 
        supabase.from('locations').update({ pos_x: loc.pos_x, pos_y: loc.pos_y }).eq('id', loc.id)
      );
      const areaPromises = areas.map(area => 
        supabase.from('areas').update({ pos_x: area.pos_x, pos_y: area.pos_y }).eq('id', area.id)
      );

      const results = await Promise.all([...locationPromises, ...areaPromises]);
      
      const errors = results.filter(r => r.error);
      if (errors.length > 0) {
        console.error("Save Errors:", errors);
        alert(`Let op: Er gingen ${errors.length} updates mis. Check je console voor details.`);
      } else {
        setHasUnsavedMapChanges(false);
        alert("Plattegrond bliksemsnel en 100% succesvol opgeslagen in SQL!");
      }
    } catch (err) {
      console.error(err);
      alert("Er is een fatale netwerkfout opgetreden bij het opslaan.");
    }
  };

  // --- CRUD Operations ---
  const handleSaveLocation = async () => {
    if (!formData.name) return;
    const tempId = Math.random().toString();
    const optimisticLoc: Location = { id: tempId, name: formData.name, pos_x: 50, pos_y: 50 };
    setLocations([...locations, optimisticLoc]);
    
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
      const { data, error } = await supabase.from('locations').insert([{ name: formData.name, pos_x: 50, pos_y: 50 }]).select().single();
      if (error) {
        console.error(error);
        alert("Fout bij aanmaken zone: " + error.message);
      } else if (data) {
        setLocations(prev => prev.map(l => l.id === tempId ? data : l));
      }
    }
    setShowLocationModal(false);
    setFormData({ name: '', type: 'BEDS' });
  };

  const handleUpdateLocation = async () => {
    if (!editingLocation) return;
    setLocations(prev => prev.map(loc => loc.id === editingLocation.id ? editingLocation : loc));
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) await supabase.from('locations').update({ name: editingLocation.name }).eq('id', editingLocation.id);
    setEditingLocation(null);
  };

  const handleDeleteLocation = async (id: string) => {
    if (!confirm("Weet je zeker dat je deze hele ZONE inclusief alle sub-gebieden wilt verwijderen?")) return;
    setLocations(prev => prev.filter(l => l.id !== id));
    setAreas(prev => prev.filter(a => a.location_id !== id));
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) await supabase.from('locations').delete().eq('id', id);
  };

  const handleSaveArea = async () => {
    if (!formData.name || !modalTargetLocationId) return;
    const tempId = Math.random().toString();
    const optimisticArea: Area = { id: tempId, location_id: modalTargetLocationId, name: formData.name, type: formData.type, pos_x: 50, pos_y: 50 };
    setAreas([...areas, optimisticArea]);
    
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
      const { data, error } = await supabase.from('areas').insert([{ location_id: modalTargetLocationId, name: formData.name, type: formData.type, pos_x: 50, pos_y: 50 }]).select().single();
      if (error) {
        console.error(error);
        alert("Fout bij aanmaken area: " + error.message);
      } else if (data) {
        setAreas(prev => prev.map(a => a.id === tempId ? data : a));
      }
    }
    setShowAreaModal(false);
    setFormData({ name: '', type: 'BEDS' });
  };

  const handleUpdateArea = async () => {
    if (!editingArea) return;
    setAreas(prev => prev.map(a => a.id === editingArea.id ? editingArea : a));
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) await supabase.from('areas').update({ name: editingArea.name, type: editingArea.type }).eq('id', editingArea.id);
    setEditingArea(null);
  };

  const handleDeleteArea = async (id: string) => {
    if (!confirm("Weet je zeker dat je dit gebied en alle bedjes daarin wilt verwijderen?")) return;
    setAreas(prev => prev.filter(a => a.id !== id));
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) await supabase.from('areas').delete().eq('id', id);
  };

  const handleSaveVenue = async () => {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
      const payload = { 
        name: venueFormData.name, 
        location_address: venueFormData.location_address, 
        map_image_url: venueFormData.map_image_url,
        logo_url: venueFormData.logo_url
      };
      
      if (venue?.id && venue.id !== 'fallback') {
        const { error } = await supabase.from('venues').update(payload).eq('id', venue.id);
        if (error) {
          alert("Opslaan mislukt! Tabel ontbreekt of error: " + error.message);
          return;
        }
      } else {
        const { data, error } = await supabase.from('venues').insert([payload]).select().single();
        if (error) {
          alert("BELANGRIJK: Je hebt de nieuwe schema.sql code nog niet uitgevoerd in Supabase! De 'venues' tabel mist nog. Plak de schema.sql code in je SQL Editor en klik Run.");
          return;
        }
        if (data) setVenue(data);
      }
      setVenue(prev => ({ ...prev!, ...payload }));
    } else {
      setVenue({ ...venue!, ...venueFormData });
    }
    setShowVenueModal(false);
    alert("Bedrijfsinstellingen & Achtergrond succesvol opgeslagen!");
  };

  // If Bed Editor is open, show it
  if (activeArea) {
    return <AdminBedEditor area={activeArea} onBack={() => setActiveArea(null)} onDeleteArea={() => { handleDeleteArea(activeArea.id); setActiveArea(null); }} />;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] font-sans relative bg-stone-100">
      
      {/* Top Header */}
      <div className="bg-white border-b border-stone-200 p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm z-20 shrink-0">
        <div className="flex items-center">
          {venue?.logo_url ? (
            <img src={venue.logo_url} alt="Venue Logo" className="h-10 w-auto object-contain mr-4 rounded-md" />
          ) : (
            <Settings2 className="mr-2 text-emerald-600 h-8 w-8" />
          )}
          <div>
            <h1 className="text-2xl font-bold text-stone-900 flex items-center">
              {venue?.name || 'Master Admin Planner'}
            </h1>
            <p className="text-stone-500 text-sm mt-1">{venue?.location_address || 'Beheer zones in de lijst, en bepaal posities op de plattegrond.'}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowVenueModal(true)}
            className="flex items-center px-4 py-3 rounded-xl font-bold bg-stone-100 text-stone-700 hover:bg-stone-200 transition-all shadow-sm border-2 border-transparent"
          >
            Venue Settings
          </button>
          <button 
            onClick={saveMapPositions}
            className="flex items-center px-6 py-3 rounded-xl font-bold transition-all shadow-sm border-2 bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-700 hover:scale-105"
          >
            <Save className="w-5 h-5 mr-2" />
            Save Map Positions
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left Sidebar (Data Manager) */}
        <div className="w-full lg:w-96 bg-white border-r border-stone-200 flex flex-col overflow-y-auto shrink-0 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
          <div className="p-4 border-b border-stone-100 bg-stone-50">
            <button 
              onClick={() => setShowLocationModal(true)}
              className="w-full flex items-center justify-center px-4 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold transition-colors shadow-md"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Main Zone
            </button>
          </div>

          <div className="p-4 space-y-6">
            {locations.length === 0 && (
              <p className="text-stone-400 text-center py-8 text-sm font-medium">Nog geen zones. Maak eerst een Main Zone aan.</p>
            )}

            {locations.map(loc => (
              <div key={loc.id} className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
                {/* Main Zone Header */}
                <div className="bg-stone-100 px-4 py-3 flex items-center justify-between border-b border-stone-200">
                  <span className="font-bold text-stone-900 text-lg">{loc.name}</span>
                  <div className="flex gap-1">
                    <button onClick={() => setMovingItem({ id: loc.id, type: 'LOCATION', name: loc.name })} className={clsx("p-2 rounded-lg transition-colors", movingItem?.id === loc.id ? "bg-blue-600 text-white shadow-md" : "bg-white text-stone-500 hover:bg-blue-50 hover:text-blue-600")} title="Positie op kaart bepalen">
                      <Crosshair className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditingLocation(loc)} className="p-2 bg-white rounded-lg text-stone-500 hover:bg-stone-200 transition-colors" title="Naam bewerken">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteLocation(loc.id)} className="p-2 bg-white rounded-lg text-stone-500 hover:bg-red-100 hover:text-red-600 transition-colors" title="Zone verwijderen">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Sub Areas List */}
                <div className="p-3 space-y-2">
                  {areas.filter(a => a.location_id === loc.id).map(area => (
                    <div key={area.id} className="flex flex-col gap-2 p-3 bg-stone-50 rounded-xl border border-stone-100 hover:border-emerald-200 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                           <span className="font-bold text-sm text-stone-800 block">{area.name}</span>
                           <span className="text-[0.65rem] uppercase font-bold text-stone-500 tracking-wider">{area.type}</span>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => setMovingItem({ id: area.id, type: 'AREA', name: area.name })} className={clsx("p-1.5 rounded-md transition-colors", movingItem?.id === area.id ? "bg-blue-600 text-white shadow-md" : "bg-stone-200 text-stone-600 hover:bg-blue-100 hover:text-blue-700")} title="Positie op kaart bepalen">
                            <Crosshair className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setEditingArea(area)} className="p-1.5 bg-stone-200 rounded-md text-stone-600 hover:bg-stone-300 transition-colors" title="Area bewerken">
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDeleteArea(area.id)} className="p-1.5 bg-stone-200 rounded-md text-stone-600 hover:bg-red-200 hover:text-red-700 transition-colors" title="Area verwijderen">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <button 
                        onClick={() => setActiveArea(area)}
                        className="w-full mt-1 flex items-center justify-center py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-sm font-bold transition-colors"
                      >
                        <Grid className="w-4 h-4 mr-2" /> Open Seat Planner (Bedden)
                      </button>
                    </div>
                  ))}

                  <button 
                    onClick={() => { setModalTargetLocationId(loc.id); setShowAreaModal(true); }}
                    className="w-full mt-2 py-2 flex items-center justify-center text-sm font-bold text-stone-500 border-2 border-dashed border-stone-300 rounded-xl hover:bg-stone-100 hover:text-stone-800 transition-all"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Sub Area
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Canvas (Visual Map) */}
        <div className="flex-1 bg-stone-300 p-4 sm:p-8 overflow-hidden flex justify-center items-center relative">
          
          {movingItem && (
            <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold shadow-2xl animate-bounce z-50 flex items-center text-lg border-4 border-blue-400">
              <Crosshair className="w-6 h-6 mr-3 animate-spin-slow" />
              Klik ergens op de kaart om "{movingItem.name}" te plaatsen!
            </div>
          )}

          <div 
            ref={containerRef}
            onClick={handleMapClick}
            className={clsx(
              "relative w-full max-w-7xl aspect-[16/9] bg-stone-400 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300",
              movingItem ? "cursor-crosshair ring-8 ring-blue-500/50 scale-[0.98]" : "border-4 border-white"
            )}
            style={{ backgroundImage: `url('${venue?.map_image_url || '/calabassa-map.jpg'}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          >
            {/* Draw Locations (Zones) */}
            {locations.map((loc) => (
              <div
                key={`loc-${loc.id}`}
                style={{ left: `${loc.pos_x}%`, top: `${loc.pos_y}%`, position: 'absolute', transform: 'translate(-50%, -50%)' }}
                className={clsx(
                  "w-16 h-16 sm:w-20 sm:h-20 rounded-full flex flex-col items-center justify-center transition-all",
                  movingItem?.id === loc.id ? "bg-blue-500/80 border-4 border-white shadow-lg scale-125 z-50" : "hidden"
                )}
              >
                {movingItem?.id === loc.id && <Crosshair className="text-white w-6 h-6" />}
              </div>
            ))}

            {/* Draw Areas */}
            {areas.map((area) => (
              <div
                key={`area-${area.id}`}
                style={{ left: `${area.pos_x}%`, top: `${area.pos_y}%`, position: 'absolute', transform: 'translate(-50%, -50%)' }}
                className={clsx(
                  "px-4 py-2 rounded-xl text-sm font-bold shadow-xl border-2 whitespace-nowrap transition-all",
                  movingItem?.id === area.id 
                    ? "bg-blue-600 text-white border-white scale-125 z-50" 
                    : "bg-stone-900/80 text-white border-stone-700 z-30 pointer-events-none"
                )}
              >
                {movingItem?.id === area.id ? <span className="flex items-center"><Crosshair className="w-4 h-4 mr-2" /> {area.name}</span> : area.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* Create Location */}
      <AnimatePresence>
        {showLocationModal && (
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Add Main Zone</h3>
                <button onClick={() => setShowLocationModal(false)} className="text-stone-400 hover:text-stone-900"><X /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-1">Zone Name</label>
                  <input type="text" placeholder="e.g. Zone 6" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
              </div>
              <button onClick={handleSaveLocation} className="w-full mt-6 py-3 bg-stone-900 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors">Create Zone</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Area */}
      <AnimatePresence>
        {showAreaModal && modalTargetLocationId && (
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Add Sub Area</h3>
                <button onClick={() => setShowAreaModal(false)} className="text-stone-400 hover:text-stone-900"><X /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-1">Area Name</label>
                  <input type="text" placeholder="e.g. VIP Cabanas" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-1">Type of Area</label>
                  <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
                    <option value="BEDS">Beds</option>
                    <option value="HAMMOCKS">Hammocks</option>
                    <option value="VIP">VIP Lounge</option>
                    <option value="RESTAURANT">Restaurant Tables</option>
                  </select>
                </div>
              </div>
              <button onClick={handleSaveArea} className="w-full mt-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors">Create Area</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Location */}
      {editingLocation && (
        <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Edit Main Zone</h3>
              <button onClick={() => setEditingLocation(null)} className="text-stone-400 hover:text-stone-900"><X /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">Zone Name</label>
                <input type="text" value={editingLocation.name} onChange={(e) => setEditingLocation({...editingLocation, name: e.target.value})} className="w-full p-3 border border-stone-300 rounded-lg outline-none" />
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button onClick={handleUpdateLocation} className="w-full py-3 bg-stone-900 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Area */}
      {editingArea && (
        <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Edit Sub Area</h3>
              <button onClick={() => setEditingArea(null)} className="text-stone-400 hover:text-stone-900"><X /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">Area Name</label>
                <input type="text" value={editingArea.name} onChange={(e) => setEditingArea({...editingArea, name: e.target.value})} className="w-full p-3 border border-stone-300 rounded-lg outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">Type of Area</label>
                <select value={editingArea.type} onChange={(e) => setEditingArea({...editingArea, type: e.target.value})} className="w-full p-3 border border-stone-300 rounded-lg outline-none">
                  <option value="BEDS">Beds</option>
                  <option value="HAMMOCKS">Hammocks</option>
                  <option value="VIP">VIP Lounge</option>
                  <option value="RESTAURANT">Restaurant Tables</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button onClick={handleUpdateArea} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Venue Settings Modal */}
      <AnimatePresence>
        {showVenueModal && (
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Business Settings</h3>
                <button onClick={() => setShowVenueModal(false)} className="text-stone-400 hover:text-stone-900"><X /></button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-1">Bedrijf / Hotel Naam</label>
                  <input type="text" value={venueFormData.name} onChange={(e) => setVenueFormData({...venueFormData, name: e.target.value})} className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. Viesa Beach Club" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-1">Locatie / Adres</label>
                  <input type="text" value={venueFormData.location_address} onChange={(e) => setVenueFormData({...venueFormData, location_address: e.target.value})} className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. Cala Bassa, Ibiza" />
                </div>
                
                {/* LOGO UPLOAD */}
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-1">Bedrijfslogo (Bovenaan Admin)</label>
                  <div className="flex flex-col gap-2 mt-2 mb-3">
                    <label className="flex items-center justify-center w-full py-3 px-4 border-2 border-dashed border-stone-300 bg-stone-50 text-stone-600 rounded-xl font-bold cursor-pointer hover:bg-stone-100 transition-colors">
                      <span className="flex items-center"><Plus className="w-5 h-5 mr-2" /> Upload Logo (Cloudinary)</span>
                      <input 
                        type="file" accept="image/*" className="hidden" 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
                          const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
                          if (!cloudName || !uploadPreset) {
                            alert("Cloudinary is nog niet geconfigureerd! Voeg NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME en NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET toe in Vercel.");
                            return;
                          }
                          alert("Logo uploaden naar Cloudinary gestart... even geduld.");
                          const formData = new FormData();
                          formData.append('file', file);
                          formData.append('upload_preset', uploadPreset);
                          try {
                            const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: formData });
                            const data = await res.json();
                            if (data.secure_url) {
                              setVenueFormData({ ...venueFormData, logo_url: data.secure_url });
                              alert("Logo succesvol geüpload!");
                            } else alert("Fout bij uploaden: " + data.error?.message);
                          } catch (err) { alert("Netwerkfout bij uploaden."); }
                        }}
                      />
                    </label>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-1">
                    <hr className="flex-1 border-stone-200" />
                    <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">OF PLAK EEN LINK</span>
                    <hr className="flex-1 border-stone-200" />
                  </div>
                  <input type="text" value={venueFormData.logo_url} onChange={(e) => setVenueFormData({...venueFormData, logo_url: e.target.value})} className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="https://jouw-website.nl/logo.png" />

                  {venueFormData.logo_url && (
                    <div className="mt-2 p-2 bg-stone-100 border border-stone-200 rounded-lg flex items-center justify-center">
                      <img src={venueFormData.logo_url} className="h-12 object-contain" alt="Logo preview" />
                    </div>
                  )}
                </div>

                {/* PLATTEGROND UPLOAD */}
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-1">Achtergrond Plattegrond URL</label>
                  
                  {/* Cloudinary File Uploader */}
                  <div className="flex flex-col gap-2 mt-2 mb-3">
                    <label className="flex items-center justify-center w-full py-3 px-4 border-2 border-dashed border-emerald-300 bg-emerald-50 text-emerald-700 rounded-xl font-bold cursor-pointer hover:bg-emerald-100 transition-colors">
                      <span className="flex items-center"><Plus className="w-5 h-5 mr-2" /> Upload nieuwe plattegrond (Cloudinary)</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
                          const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

                          if (!cloudName || !uploadPreset) {
                            alert("Cloudinary is nog niet geconfigureerd! Voeg NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME en NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET toe in Vercel.");
                            return;
                          }

                          // Show an optimistic loading alert
                          alert("Uploaden naar Cloudinary gestart... even geduld.");

                          const formData = new FormData();
                          formData.append('file', file);
                          formData.append('upload_preset', uploadPreset);

                          try {
                            const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                              method: 'POST',
                              body: formData,
                            });
                            const data = await res.json();
                            if (data.secure_url) {
                              setVenueFormData({ ...venueFormData, map_image_url: data.secure_url });
                              alert("Upload succesvol!");
                            } else {
                              alert("Fout bij uploaden: " + data.error?.message);
                            }
                          } catch (err) {
                            console.error(err);
                            alert("Netwerkfout bij uploaden.");
                          }
                        }}
                      />
                    </label>
                  </div>

                  <div className="flex items-center gap-2 mb-1">
                    <hr className="flex-1 border-stone-200" />
                    <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">OF PLAK EEN LINK</span>
                    <hr className="flex-1 border-stone-200" />
                  </div>
                  
                  <input type="text" value={venueFormData.map_image_url} onChange={(e) => setVenueFormData({...venueFormData, map_image_url: e.target.value})} className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="https://res.cloudinary.com/..." />
                </div>
                
                {venueFormData.map_image_url && (
                  <div className="mt-4 border border-stone-200 rounded-lg p-2 bg-stone-50">
                    <p className="text-xs font-bold text-stone-500 mb-2 uppercase">Live Preview</p>
                    <div className="w-full h-32 rounded-md bg-stone-200" style={{ backgroundImage: `url('${venueFormData.map_image_url}')`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  </div>
                )}
              </div>
              
              <button onClick={handleSaveVenue} className="w-full mt-6 py-3 bg-stone-900 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors">
                Save Business Settings
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
