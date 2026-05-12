'use server'

import { createClient } from '@supabase/supabase-js';
import { uploadSignature, uploadIdPhoto } from '@/lib/cloudinary';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
    // 1. Zoek of maak het hotel aan op basis van de slug ('vibra-algarb')
    let actualHotelId = '';
    const { data: existingHotel } = await supabase
      .from('hotels')
      .select('id')
      .eq('slug', hotelId)
      .single();

    if (existingHotel) {
      actualHotelId = existingHotel.id;
    } else {
      // Hotel bestaat nog niet in de nieuwe DB, maak hem direct aan!
      const { data: newHotel, error: newHotelError } = await supabase
        .from('hotels')
        .insert([{ 
          name: hotelId.replace('-', ' ').toUpperCase(), 
          slug: hotelId 
        }])
        .select('id')
        .single();
        
      if (newHotelError) throw newHotelError;
      actualHotelId = newHotel.id;
    }

    // 2. Upload handtekening en evt paspoortfoto parallel naar Cloudinary (voorkomt Vercel 10s timeout)
    const uploadTasks: Promise<string>[] = [uploadSignature(base64Signature, actualHotelId)];
    if (idPhotoBase64) {
      uploadTasks.push(uploadIdPhoto(idPhotoBase64, actualHotelId));
    }

    const uploadResults = await Promise.all(uploadTasks);
    const signatureUrl = uploadResults[0];
    const idPhotoUrl = idPhotoBase64 ? uploadResults[1] : null;

    // 3. Maak Gast aan in Supabase
    const { data: guestData, error: guestError } = await supabase
      .from('guests')
      .insert([{ 
        first_name: firstName, 
        last_name: lastName,
        email,
        phone,
        address,
        city,
        zipcode,
        country
      }])
      .select('id')
      .single();

    if (guestError) throw guestError;

    // 4. Koppel de checkin aan het ECHTE hotel UUID
    const { error: checkinError } = await supabase
      .from('checkins')
      .insert([{
        hotel_id: actualHotelId,
        guest_id: guestData.id,
        signature_url: signatureUrl,
        id_photo_url: idPhotoUrl,
        status: 'completed'
      }]);

    if (checkinError) throw checkinError;

    return { success: true, message: 'Check-in succesvol afgerond.' };
  } catch (error: any) {
    console.error('SERVER ACTION ERROR:', error);
    return { success: false, message: `Fout: ${error?.message || error || 'Onbekende fout'}` };
  }
}
