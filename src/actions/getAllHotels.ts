'use server';

import { createClient } from '@supabase/supabase-js';

export async function getAllHotels() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { success: false, hotels: [], message: 'Supabase env vars ontbreken' };
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const { data: hotelsData, error: hotelsError } = await supabase
      .from('hotels')
      .select('*')
      .order('created_at', { ascending: false });

    if (hotelsError) throw hotelsError;
    
    const { data: scootersData, error: scootersError } = await supabase
      .from('scooter_companies')
      .select('*')
      .order('created_at', { ascending: false });

    if (scootersError) throw scootersError;

    const hotelsWithTypes = (hotelsData || []).map(h => ({ ...h, business_type: 'hotel' }));
    const scootersWithTypes = (scootersData || []).map(s => ({ ...s, business_type: 'scooter' }));

    return { success: true, hotels: [...hotelsWithTypes, ...scootersWithTypes] };
  } catch (err: any) {
    return { success: false, hotels: [], message: err.message };
  }
}
