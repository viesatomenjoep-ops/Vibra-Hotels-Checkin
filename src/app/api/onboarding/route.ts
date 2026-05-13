import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; // Must have this env var

export async function POST(req: Request) {
  try {
    const { companyName, category, promoCode, userId, userFullName } = await req.json();

    if (!companyName || !category || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Initialize an admin client to bypass RLS for creating the tenant
    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Create the Company (Tenant)
    const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    const { data: newCompany, error: companyError } = await adminSupabase
      .from('companies')
      .insert({
        name: companyName,
        slug: slug,
        branch_category: category,
        promo_code: promoCode,
      })
      .select('id')
      .single();

    // If there is an error (e.g. relation does not exist because DB schema isn't applied yet, we gracefully return it)
    if (companyError) {
      console.error("Error creating company:", companyError);
      return NextResponse.json({ error: 'Fout bij aanmaken bedrijf' }, { status: 500 });
    }

    // 2. Create the User Profile linking the user to the company
    const { error: profileError } = await adminSupabase
      .from('user_profiles')
      .insert({
        id: userId,
        company_id: newCompany.id,
        full_name: userFullName,
        role: 'admin',
      });

    if (profileError) {
      console.error("Error creating profile:", profileError);
      return NextResponse.json({ error: 'Fout bij aanmaken profiel' }, { status: 500 });
    }

    return NextResponse.json({ success: true, companyId: newCompany.id });

  } catch (err: any) {
    console.error("Onboarding API error:", err);
    return NextResponse.json({ error: 'Interne serverfout' }, { status: 500 });
  }
}
