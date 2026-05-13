import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Example: Twilio, MessageBird, or Make.com webhook URL
    // In production, configure this in your .env.local
    const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL;
    
    if (!webhookUrl) {
      console.warn('WHATSAPP_WEBHOOK_URL is not defined. Simulating success.');
      return NextResponse.json({ success: true, simulated: true, data: body });
    }

    // Forward the payload to your automation provider (e.g., Make.com or Twilio)
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${process.env.WHATSAPP_API_KEY}` // if needed
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Webhook failed with status: ${response.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('WhatsApp Webhook Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to send WhatsApp message' }, { status: 500 });
  }
}
