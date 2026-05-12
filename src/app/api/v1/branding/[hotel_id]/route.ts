import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ hotel_id: string }> }
) {
  try {
    const resolvedParams = await params;
    const hotel_id = resolvedParams.hotel_id;

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Supabase configuration is missing on the server.' },
        { status: 500 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabase
      .from('hotels')
      .select('slug, name, primary_color, font_family, logo_url')
      .eq('slug', hotel_id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: `Prototype '${hotel_id}' not found.` },
        { status: 404 }
      );
    }

    // Return the blueprint
    return NextResponse.json({
      success: true,
      blueprint: {
        id: data.slug,
        name: data.name,
        branding: {
          color: data.primary_color,
          font: data.font_family,
          logo: data.logo_url
        },
        links: {
          kiosk: `https://vibra-hotels-checkin.vercel.app/kiosk/${data.slug}`,
          checkin: `https://vibra-hotels-checkin.vercel.app/check-in/${data.slug}`
        }
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
