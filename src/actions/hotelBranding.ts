'use server'

import { createClient } from '@supabase/supabase-js';
import { v2 as cloudinary } from 'cloudinary';

// Initialize Cloudinary (can be at top level as it doesn't throw immediately)
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Helper function to get Supabase client safely
function getSupabaseClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase configuratie ontbreekt in Vercel Environment Variables.');
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function saveHotelBranding(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const color = formData.get('color') as string;
    const font_family = formData.get('font_family') as string;
    const logoBase64 = formData.get('logoBase64') as string;
    const business_type = formData.get('business_type') as string || 'hotel';
    const scooter_fleet = formData.get('scooter_fleet') ? JSON.parse(formData.get('scooter_fleet') as string) : [];
    
    let logoUrl = '/vibra-logo.svg'; // Default
    
    // Upload logo to Cloudinary if provided
    if (logoBase64 && logoBase64.startsWith('data:image')) {
      const uploadResponse = await cloudinary.uploader.upload(logoBase64, {
        folder: `viesa/branding/${slug}`,
        format: 'png',
        quality: 'auto',
      });
      logoUrl = uploadResponse.secure_url;
    } else if (logoBase64 && logoBase64.startsWith('http')) {
      logoUrl = logoBase64; // Fallback if they passed an existing URL
    }

    // Upsert the hotel in Supabase
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('hotels')
      .upsert({ 
        slug, 
        name, 
        primary_color: color, 
        logo_url: logoUrl,
        font_family,
        business_type,
        scooter_fleet
      }, { onConflict: 'slug' });

    if (error) throw error;

    return { success: true, slug };
  } catch (err: any) {
    console.error('saveHotelBranding error:', err);
    return { success: false, message: err.message || 'Kon hotel niet opslaan' };
  }
}

export async function getHotelBranding(slug: string) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('hotels')
      .select('name, primary_color, logo_url, font_family, business_type, scooter_fleet')
      .eq('slug', slug)
      .single();
      
    if (error || !data) {
      return { name: null, color: null, logo: null, font: null, business_type: 'hotel', scooter_fleet: [] };
    }
    
    return {
      name: data.name,
      color: data.primary_color,
      logo: data.logo_url,
      font: data.font_family,
      business_type: data.business_type || 'hotel',
      scooter_fleet: data.scooter_fleet || []
    };
  } catch (e) {
    return { name: null, color: null, logo: null, font: null };
  }
}
