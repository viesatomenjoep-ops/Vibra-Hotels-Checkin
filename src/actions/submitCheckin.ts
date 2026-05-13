'use server'

import { createClient } from '@supabase/supabase-js';
import { uploadSignature, uploadIdPhoto } from '@/lib/cloudinary';

function getSupabaseClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase configuratie ontbreekt in Vercel.');
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function processCheckin(formData: FormData) {
  const hotelId = formData.get('hotelId') as string;
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const email = formData.get('email') as string;
  const phoneCountryCode = formData.get('phoneCountryCode') as string;
  const phoneNumber = formData.get('phoneNumber') as string;
  const phone = `${phoneCountryCode} ${phoneNumber}`.trim();
  const address = formData.get('address') as string;
  const city = formData.get('city') as string;
  const zipcode = formData.get('zipcode') as string;
  const country = formData.get('country') as string;
  const base64Signature = formData.get('signature') as string;
  const idPhotoBase64 = formData.get('idPhoto') as string | null;

  try {
    const supabase = getSupabaseClient();
    
    // 1. Zoek het Bedrijf op basis van de slug
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('id')
      .eq('slug', hotelId)
      .single();

    if (!existingCompany) {
      throw new Error(`Geen actief bedrijf gevonden voor de opgegeven link (${hotelId}).`);
    }
    const actualHotelId = existingCompany.id;

    // 2. Upload handtekening en evt paspoortfoto parallel naar Cloudinary
    const uploadTasks: Promise<string>[] = [uploadSignature(base64Signature, actualHotelId)];
    if (idPhotoBase64) {
      uploadTasks.push(uploadIdPhoto(idPhotoBase64, actualHotelId));
    }

    const uploadResults = await Promise.all(uploadTasks);
    const signatureUrl = uploadResults[0];
    const idPhotoUrl = idPhotoBase64 ? uploadResults[1] : null;

    // 3. Maak Gast aan in Supabase Customers tabel (SaaS scope)
    const { data: guestData, error: guestError } = await supabase
      .from('customers')
      .insert([{ 
        company_id: actualHotelId,
        first_name: firstName, 
        last_name: lastName,
        email,
        phone,
        address,
        city,
        zipcode,
        country,
        id_photo_url: idPhotoUrl
      }])
      .select('id')
      .single();

    if (guestError) throw guestError;

    // 4. Koppel de checkin in hotel_checkins
    const { error: checkinError } = await supabase
      .from('hotel_checkins')
      .insert([{
        company_id: actualHotelId,
        customer_id: guestData.id,
        signature_url: signatureUrl,
        status: 'completed'
      }]);

    if (checkinError) throw checkinError;

    return { success: true, message: 'Check-in succesvol afgerond.' };
  } catch (error: any) {
    console.error('SERVER ACTION ERROR:', error);
    return { success: false, message: `Fout: ${error?.message || error || 'Onbekende fout'}` };
  }
}
