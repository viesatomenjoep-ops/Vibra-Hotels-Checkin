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
    
    // Do not throw if scooter_companies fails (e.g. schema cache issue), just fallback to empty array
    const { data: scootersData, error: scootersError } = await supabase
      .from('scooter_companies')
      .select('*')
      .order('created_at', { ascending: false });

    const hotelsWithTypes = (hotelsData || []).map(h => ({ ...h, business_type: 'hotel' }));
    const scootersWithTypes = (!scootersError && scootersData ? scootersData : []).map(s => ({ ...s, business_type: 'scooter' }));

    return { success: true, hotels: [...hotelsWithTypes, ...scootersWithTypes] };
  } catch (err: any) {
    return { success: false, hotels: [], message: err.message };
  }
}
