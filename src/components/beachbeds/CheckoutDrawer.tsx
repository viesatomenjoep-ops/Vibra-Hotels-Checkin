"use client";

import React, { useState } from 'react';
import type { Bed } from './AdminBedEditor';
import { useLanguage } from '@/contexts/LanguageContext';
import { X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CheckoutDrawerProps {
  bed: Bed | null;
  onClose: () => void;
}

export default function CheckoutDrawer({ bed, onClose }: CheckoutDrawerProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProceed = () => {
    // Ideally here we would optimistically set status to RESERVED in Supabase
    setStep(2);
  };

  const handleMockPayment = async () => {
    // This would call our checkout API route or mock checkout
    alert("Payment successful! Webhook will be triggered.");
    
    // Simulate API call to webhook
    try {
      await fetch('/api/webhooks/booking-success', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bed_id: bed?.id,
          bed_name: bed?.name,
          user_name: formData.name,
          phone: formData.phone,
          date: formData.date
        })
      });
    } catch (e) {
      console.error(e);
    }

    onClose();
    setStep(1);
  };

  return (
    <AnimatePresence>
      {bed && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 max-h-[90vh] bg-white rounded-t-3xl shadow-2xl z-50 overflow-y-auto max-w-2xl mx-auto border-t border-stone-200"
          >
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-serif text-stone-900">{t('checkoutTitle')}</h2>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-stone-100 transition-colors text-stone-500">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {step === 1 ? (
                <div className="space-y-6">
                  {/* Bed Details Summary */}
                  <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-stone-500 uppercase tracking-wider">{t('bedNumber')}</p>
                      <p className="text-3xl font-bold text-stone-900">{bed.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-stone-500 uppercase tracking-wider">{t('price')}</p>
                      <p className="text-3xl font-bold text-emerald-600">€{bed.price}</p>
                      <p className="text-stone-500 text-sm mt-1">{t('minSpend')}: €{bed.min_spend}</p>
                    </div>
                  </div>

                  {/* Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">{t('selectDate')}</label>
                      <input 
                        type="date" 
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className="w-full p-3 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">{t('name')}</label>
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="w-full p-3 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">{t('email')}</label>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        className="w-full p-3 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">{t('phone')}</label>
                      <input 
                        type="tel" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+34 600 000 000"
                        className="w-full p-3 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={handleProceed}
                    disabled={!formData.name || !formData.email || !formData.phone}
                    className="w-full py-4 bg-stone-900 text-white rounded-xl font-medium text-lg hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-8 flex items-center justify-center shadow-lg"
                  >
                    {t('proceedToPayment')}
                  </button>
                </div>
              ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-stone-900">{t('summary')}</h3>
                  </div>

                  <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100 space-y-4">
                     <div className="flex justify-between border-b border-stone-200 pb-4">
                       <span className="text-stone-500">{t('bedNumber')}</span>
                       <span className="font-medium text-stone-900">{bed.name}</span>
                     </div>
                     <div className="flex justify-between border-b border-stone-200 pb-4">
                       <span className="text-stone-500">{t('selectDate')}</span>
                       <span className="font-medium text-stone-900">{formData.date}</span>
                     </div>
                     <div className="flex justify-between border-b border-stone-200 pb-4">
                       <span className="text-stone-500">{t('name')}</span>
                       <span className="font-medium text-stone-900">{formData.name}</span>
                     </div>
                     <div className="flex justify-between pt-2">
                       <span className="text-stone-900 font-bold">{t('total')}</span>
                       <span className="font-bold text-emerald-600 text-xl">€{bed.price}</span>
                     </div>
                  </div>

                  <button 
                    onClick={handleMockPayment}
                    className="w-full py-4 bg-emerald-600 text-white rounded-xl font-medium text-lg hover:bg-emerald-700 transition-colors mt-8 flex items-center justify-center shadow-lg shadow-emerald-600/30"
                  >
                    Pay €{bed.price} Now
                  </button>
                  <button 
                    onClick={() => setStep(1)}
                    className="w-full py-4 bg-transparent text-stone-500 hover:text-stone-800 transition-colors mt-2"
                  >
                    Back to Details
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
