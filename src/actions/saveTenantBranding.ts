'use server'

import { createClient } from '@supabase/supabase-js';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function saveTenantBranding(formData: FormData) {
  try {
    const companyId = formData.get('companyId') as string;
    const color = formData.get('color') as string;
    const font_family = formData.get('font_family') as string;
    const logoBase64 = formData.get('logoBase64') as string;
    const slug = formData.get('slug') as string;
    
    if (!companyId) return { success: false, message: "Geen bedrijf gevonden" };

    let logoUrl = '';
    
    if (logoBase64 && logoBase64.startsWith('data:image')) {
      const uploadResponse = await cloudinary.uploader.upload(logoBase64, {
        folder: `viesa/companies/${slug || companyId}`,
        format: 'png',
        quality: 'auto',
      });
      logoUrl = uploadResponse.secure_url;
    } else if (logoBase64 && logoBase64.startsWith('http')) {
      logoUrl = logoBase64;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const updateData: any = { primary_color: color, font_family };
    if (logoUrl) updateData.logo_url = logoUrl;

    const { error } = await supabase
      .from('companies')
      .update(updateData)
      .eq('id', companyId);

    if (error) throw error;

    return { success: true };
  } catch (err: any) {
    console.error('saveTenantBranding error:', err);
    return { success: false, message: err.message || 'Kon configuratie niet opslaan' };
  }
}
