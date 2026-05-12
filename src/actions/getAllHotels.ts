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
    const { data, error } = await supabase
      .from('hotels')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return { success: true, hotels: data || [] };
  } catch (err: any) {
    return { success: false, hotels: [], message: err.message };
  }
}
