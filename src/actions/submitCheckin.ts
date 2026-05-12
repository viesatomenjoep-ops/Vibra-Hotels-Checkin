'use server'

import { createClient } from '@supabase/supabase-js';
import { uploadSignature } from '@/lib/cloudinary';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function processCheckin(formData: FormData) {
  const hotelId = formData.get('hotelId') as string;
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const address = formData.get('address') as string;
  const city = formData.get('city') as string;
  const zipcode = formData.get('zipcode') as string;
  const country = formData.get('country') as string;
  const base64Signature = formData.get('signature') as string;

  try {
    // 1. Upload handtekening naar Cloudinary
    const signatureUrl = await uploadSignature(base64Signature, hotelId);

    // 2. Maak Gast aan in Supabase
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

    // 3. Koppel de checkin
    const { error: checkinError } = await supabase
      .from('checkins')
      .insert([{
        hotel_id: hotelId,
        guest_id: guestData.id,
        signature_url: signatureUrl,
        status: 'completed'
      }]);

    if (checkinError) throw checkinError;

    return { success: true, message: 'Check-in succesvol afgerond.' };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Er is een fout opgetreden.' };
  }
}
