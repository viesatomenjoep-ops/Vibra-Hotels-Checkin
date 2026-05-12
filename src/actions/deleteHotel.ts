'use server';

import { createClient } from '@supabase/supabase-js';

export async function deleteHotel(slug: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { success: false, message: 'Supabase env vars missing' };
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const { error } = await supabase
      .from('hotels')
      .delete()
      .eq('slug', slug);

    if (error) throw error;
    
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err.message || 'Unknown error' };
  }
}
