import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, companyId, successUrl, cancelUrl, customerEmail, metadata } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Geen items opgegeven' }, { status: 400 });
    }

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is vereist (Multi-Tenant isolatie)' }, { status: 400 });
    }

    // Prepare line items for Stripe Checkout
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
          description: item.description,
          // Optioneel: voeg afbeeldingen toe als die er zijn
          ...(item.image && { images: [item.image] }),
        },
        unit_amount: Math.round(item.price * 100), // Stripe werkt in centen
      },
      quantity: item.quantity || 1,
    }));

    // Create Stripe Checkout Session
    // We store the companyId in metadata so webhooks know which tenant gets the money/credit.
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'ideal'], // Ideal is populair in NL
      customer_email: customerEmail,
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/success`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/cancel`,
      metadata: {
        companyId,
        ...metadata,
      },
    });

    return NextResponse.json({ id: session.id, url: session.url });

  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: error.message || 'Interne betaalfout' }, { status: 500 });
  }
}
