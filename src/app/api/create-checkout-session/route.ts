import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  try {
    const { amount, isMonthly, donorName, donorEmail } = await request.json();

    // Validate the amount
    if (!amount || amount < 5) {
      return NextResponse.json(
        { error: 'Minimum donation amount is $5' },
        { status: 400 }
      );
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Support Inklined - ${isMonthly ? 'Monthly' : 'One-Time'} Donation`,
              description: `Support independent political journalism and data transparency. ${isMonthly ? 'Monthly recurring' : 'One-time'} donation.`,
              images: ['https://your-domain.com/logo.png'], // Replace with your logo URL
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
            ...(isMonthly && { recurring: { interval: 'month' } }),
          },
          quantity: 1,
        },
      ],
      mode: isMonthly ? 'subscription' : 'payment',
      success_url: `${request.nextUrl.origin}/support/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/support`,
      customer_email: donorEmail,
      metadata: {
        donationType: isMonthly ? 'Monthly' : 'One-Time',
        donorName: donorName || 'Anonymous',
        source: 'website_donation',
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
