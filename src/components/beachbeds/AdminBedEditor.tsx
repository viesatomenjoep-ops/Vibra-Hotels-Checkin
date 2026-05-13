"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, ArrowLeft, Edit3, X } from 'lucide-react';
import { Area } from './AdminMapEditor';
import { clsx } from 'clsx';

export interface Bed {
  id: string;
  area_id: string;
  name: string;
  price: number;
  min_spend: number;
  status: 'AVAILABLE' | 'PARTIAL' | 'BOOKED';
  reserved_until?: string | null;
  pos_x: number;
  pos_y: number;
}

interface AdminBedEditorProps {
  area: Area;
  onBack: () => void;
  onDeleteArea?: () => void;
}

export default function AdminBedEditor({ area, onBack, onDeleteArea }: AdminBedEditorProps) {
  const [beds, setBeds] = useState<Bed[]>([]);
  const [editingBed, setEditingBed] = useState<Bed | null>(null);

  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkData, setBulkData] = useState({ prefix: 'Row 1 - ', count: 5, price: 100, min_spend: 250 });

  useEffect(() => {
    fetchBeds();
  }, [area.id]);

  const fetchBeds = async () => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
      setBeds([
        { id: 'b1', area_id: area.id, name: 'Row 1 - A', price: 500, min_spend: 1000, status: 'BOOKED', pos_x: 0, pos_y: 0 },
        { id: 'b2', area_id: area.id, name: 'Row 1 - B', price: 500, min_spend: 1000, status: 'BOOKED', pos_x: 0, pos_y: 0 },
        { id: 'b3', area_id: area.id, name: 'Row 1 - C', price: 500, min_spend: 1000, status: 'AVAILABLE', pos_x: 0, pos_y: 0 },
      ]);
      return;
    }

    const { data } = await supabase.from('beds').select('*').eq('area_id', area.id).order('created_at', { ascending: true });
    if (data) setBeds(data as Bed[]);
  };

  const handleAddBed = async () => {
    const newBed: Omit<Bed, 'id'> = {
      area_id: area.id,
      name: `Bed ${beds.length + 1}`,
      price: 100,
      min_spend: 250,
      status: 'AVAILABLE',
      pos_x: 0,
      pos_y: 0
    };
    
    // Optimistic UI
    setBeds([...beds, { ...newBed, id: Math.random().toString() }]);

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
      const { data } = await supabase.from('beds').insert([newBed]).select().single();
      if (data) fetchBeds(); 
    }
  };

  const handleBulkCreate = async () => {
    const newBeds: Omit<Bed, 'id'>[] = Array.from({ length: bulkData.count }).map((_, i) => ({
      area_id: area.id,
      name: `${bulkData.prefix}${i + 1}`,
      price: bulkData.price,
      min_spend: bulkData.min_spend,
      status: 'AVAILABLE',
      pos_x: 0,
      pos_y: 0
    }));

    // Optimistic UI
    setBeds([...beds, ...newBeds.map(b => ({ ...b, id: Math.random().toString() }))]);

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
      await supabase.from('beds').insert(newBeds);
      fetchBeds(); 
    }
    setShowBulkModal(false);
  };

  const saveBedDetails = async () => {
    if (!editingBed) return;
    
    setBeds(prev => prev.map(b => b.id === editingBed.id ? editingBed : b));
    
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
      await supabase.from('beds').update({
        name: editingBed.name,
        price: editingBed.price,
        min_spend: editingBed.min_spend,
        status: editingBed.status,
        reserved_until: editingBed.status === 'PARTIAL' ? editingBed.reserved_until : null
      }).eq('id', editingBed.id);
    }
    
    setEditingBed(null);
  };

  const deleteBed = async (id: string) => {
    setBeds(prev => prev.filter(b => b.id !== id));
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
      await supabase.from('beds').delete().eq('id', id);
    }
    setEditingBed(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-emerald-50 border-emerald-400 text-emerald-900';
      case 'PARTIAL': return 'bg-orange-50 border-orange-400 text-orange-900';
      case 'BOOKED': return 'bg-red-50 border-red-400 text-red-900';
      default: return 'bg-stone-50 border-stone-300';
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] font-sans relative">
      <div className="bg-white border-b border-stone-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm z-10">
        <div className="flex items-center">
          <button onClick={onBack} className="mr-4 p-2 bg-stone-100 hover:bg-stone-200 rounded-lg text-stone-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Bed Layout Editor</h1>
            <p className="text-stone-500 text-sm mt-1">Editing static grid for: <strong className="text-emerald-700">{area.name}</strong></p>
          </div>
        </div>
        
        <div className="flex gap-4 items-center">
          <div className="hidden sm:flex gap-3 text-xs font-bold mr-4">
             <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-emerald-500 mr-1" /> Vrij</div>
             <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-orange-400 mr-1" /> Tot tijdstip</div>
             <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-red-500 mr-1" /> Bezet (Hele dag)</div>
          </div>
          
          <button 
            onClick={() => setShowBulkModal(true)}
            className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold transition-colors shadow-sm"
          >
            Bulk Create
          </button>
          
          <button 
            onClick={handleAddBed}
            className="flex items-center px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5 mr-1" />
            Add Bed
          </button>
        </div>
      </div>

      <div className="flex-1 bg-stone-100 p-4 sm:p-8 overflow-y-auto">
        {/* Static Grid Container */}
        <div className="max-w-5xl mx-auto bg-white p-6 sm:p-10 rounded-2xl shadow-xl border border-stone-200">
          <div className="w-full text-center py-2 bg-blue-50 text-blue-800 rounded-xl text-xs font-bold uppercase tracking-widest mb-8">
            Water Side (Front)
          </div>

          {beds.length === 0 ? (
            <div className="text-center py-12 text-stone-400 font-medium">
              No beds added yet. Click "Add Bed" to start building your grid.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {beds.map((bed) => (
                <div
                  key={bed.id}
                  className={clsx(
                    "aspect-square border-2 rounded-2xl flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow group relative",
                    getStatusColor(bed.status)
                  )}
                >
                  <button 
                    onClick={(e) => { e.stopPropagation(); setEditingBed(bed); }}
                    className="absolute -right-2 -top-2 bg-stone-900 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-emerald-600 z-10 shadow-lg"
                    title="Edit details & price"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <span className="font-bold text-sm sm:text-base text-center px-2">{bed.name}</span>
                  {bed.status === 'PARTIAL' && <span className="text-[0.6rem] font-bold text-orange-600 mt-1">Tot {bed.reserved_until}</span>}
                  <span className="text-xs opacity-70 mt-1 font-medium">€{bed.price}</span>

                  {/* iPad Quick Actions for Staff */}
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <button 
                      onClick={async (e) => {
                        e.stopPropagation();
                        setBeds(prev => prev.map(b => b.id === bed.id ? { ...b, status: 'AVAILABLE' } : b));
                        if (process.env.NEXT_PUBLIC_SUPABASE_URL) await supabase.from('beds').update({ status: 'AVAILABLE', reserved_until: null }).eq('id', bed.id);
                      }}
                      className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-white shadow-md hover:scale-110 transition-transform"
                      title="Set to Available"
                    />
                    <button 
                      onClick={async (e) => {
                        e.stopPropagation();
                        setBeds(prev => prev.map(b => b.id === bed.id ? { ...b, status: 'BOOKED' } : b));
                        if (process.env.NEXT_PUBLIC_SUPABASE_URL) await supabase.from('beds').update({ status: 'BOOKED' }).eq('id', bed.id);
                      }}
                      className="w-6 h-6 rounded-full bg-red-500 border-2 border-white shadow-md hover:scale-110 transition-transform"
                      title="Set to Booked"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Bed Modal */}
      {editingBed && (
        <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Edit Bed</h3>
              <button onClick={() => setEditingBed(null)} className="text-stone-400 hover:text-stone-900"><X /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">Name</label>
                <input 
                  type="text" 
                  value={editingBed.name} 
                  onChange={(e) => setEditingBed({...editingBed, name: e.target.value})}
                  className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-stone-700 mb-1">Price (€)</label>
                  <input 
                    type="number" 
                    value={editingBed.price} 
                    onChange={(e) => setEditingBed({...editingBed, price: parseFloat(e.target.value)})}
                    className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-stone-700 mb-1">Min Spend (€)</label>
                  <input 
                    type="number" 
                    value={editingBed.min_spend} 
                    onChange={(e) => setEditingBed({...editingBed, min_spend: parseFloat(e.target.value)})}
                    className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">Status</label>
                <select 
                  value={editingBed.status}
                  onChange={(e) => setEditingBed({...editingBed, status: e.target.value as any})}
                  className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="AVAILABLE">AVAILABLE (Green)</option>
                  <option value="PARTIAL">PARTIALLY BOOKED (Orange)</option>
                  <option value="BOOKED">BOOKED ALL DAY (Red)</option>
                </select>
              </div>

              {editingBed.status === 'PARTIAL' && (
                <div>
                  <label className="block text-sm font-bold text-orange-700 mb-1">Reserved Until (e.g. 14:00)</label>
                  <input 
                    type="time" 
                    value={editingBed.reserved_until || ''} 
                    onChange={(e) => setEditingBed({...editingBed, reserved_until: e.target.value})}
                    className="w-full p-2 border border-orange-300 bg-orange-50 rounded-lg outline-none"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-4 mt-6">
              <button 
                onClick={() => deleteBed(editingBed.id)}
                className="flex-1 py-3 bg-red-100 text-red-700 rounded-xl font-bold hover:bg-red-200 transition-colors"
              >
                Delete Bed
              </button>
              <button 
                onClick={saveBedDetails}
                className="flex-1 py-3 bg-stone-900 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Create Modal */}
      {showBulkModal && (
        <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Bulk Create Beds</h3>
              <button onClick={() => setShowBulkModal(false)} className="text-stone-400 hover:text-stone-900"><X /></button>
            </div>
            <p className="text-sm text-stone-500 mb-4">Instantly generate multiple beds. E.g. "Row 3 - " with count 10 creates 10 beds named Row 3 - 1 to 10.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">Name Prefix</label>
                <input 
                  type="text" 
                  value={bulkData.prefix} 
                  onChange={(e) => setBulkData({...bulkData, prefix: e.target.value})}
                  className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">Number of Beds to Create</label>
                <input 
                  type="number" 
                  value={bulkData.count} 
                  onChange={(e) => setBulkData({...bulkData, count: parseInt(e.target.value)})}
                  className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  min="1" max="100"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-stone-700 mb-1">Price (€)</label>
                  <input type="number" value={bulkData.price} onChange={(e) => setBulkData({...bulkData, price: parseFloat(e.target.value)})} className="w-full p-2 border border-stone-300 rounded-lg" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-stone-700 mb-1">Min Spend (€)</label>
                  <input type="number" value={bulkData.min_spend} onChange={(e) => setBulkData({...bulkData, min_spend: parseFloat(e.target.value)})} className="w-full p-2 border border-stone-300 rounded-lg" />
                </div>
              </div>
            </div>

            <button 
              onClick={handleBulkCreate}
              className="w-full mt-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors"
            >
              Generate {bulkData.count} Beds
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
