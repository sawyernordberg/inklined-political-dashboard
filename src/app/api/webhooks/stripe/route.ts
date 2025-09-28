import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { SupporterDatabase } from '../../../../../lib/database';
import { sendThankYouEmail } from '../../../../../lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('Received Stripe webhook:', event.type);

    // Handle successful payment
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      console.log('Processing successful checkout session:', session.id);

      // Extract customer information
      const customerId = session.customer as string;
      const customerEmail = session.customer_details?.email;
      const customerName = session.customer_details?.name || 'Anonymous Supporter';
      const amount = session.amount_total || 0;
      const currency = session.currency || 'usd';

      if (!customerEmail) {
        console.log('No email provided, skipping database storage');
        return NextResponse.json({ received: true });
      }

      // Check if supporter already exists
      const existingSupporter = SupporterDatabase.getSupporterByStripeCustomerId(customerId);
      
      if (existingSupporter) {
        console.log('Supporter already exists:', existingSupporter.id);
        return NextResponse.json({ received: true });
      }

      // Add supporter to database
      const supporter = await SupporterDatabase.addSupporter({
        email: customerEmail,
        name: customerName,
        amount: amount / 100, // Convert from cents
        currency: currency.toUpperCase(),
        stripe_customer_id: customerId,
        stripe_payment_intent_id: session.payment_intent as string
      });

      console.log('Added supporter to database:', supporter.id);

      // Send thank you email
      try {
        await sendThankYouEmail({
          to: customerEmail,
          name: customerName,
          amount: amount / 100,
          currency: currency.toUpperCase()
        });

        // Mark email as sent
        await SupporterDatabase.markEmailSent(supporter.id);
        console.log('Thank you email sent to:', customerEmail);
      } catch (emailError) {
        console.error('Failed to send thank you email:', emailError);
        // Don't fail the webhook if email fails
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
