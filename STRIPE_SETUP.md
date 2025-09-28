# Stripe Integration Setup

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
```

## Getting Your Stripe Keys

1. **Sign up for Stripe**: Go to [stripe.com](https://stripe.com) and create an account
2. **Get your API keys**: 
   - Go to your [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
   - Copy your **Publishable Key** (starts with `pk_test_` or `pk_live_`) → use as `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Copy your **Secret Key** (starts with `sk_test_` or `sk_live_`) → use as `STRIPE_SECRET_KEY`
3. **Replace the placeholder values** in your `.env.local` file with your actual keys

## Features Implemented

### Support Us Page (`/support`)
- Professional donation form with preset amounts ($15, $25, $50, $100, $250, $500)
- Custom amount input
- Monthly/One-time donation toggle
- Non-profit disclaimer about tax deductibility
- Optional donor information collection
- Secure Stripe Checkout integration
- Responsive design matching your site's aesthetic

### Payment Processing
- Server-side checkout session creation
- Support for both one-time and recurring monthly donations
- Secure redirect to Stripe Checkout
- Success page with confirmation
- Error handling and validation

### Success Page (`/support/success`)
- Thank you message
- Confirmation details
- Navigation back to main site

## Testing

1. **Test Mode**: Use your test keys (starting with `pk_test_` and `sk_test_`)
2. **Test Cards**: Use Stripe's test card numbers:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - Any future expiry date and any CVC

## Production Deployment

1. **Switch to Live Keys**: Replace test keys with live keys in production
2. **Webhook Setup**: Configure webhooks in Stripe Dashboard for production events
3. **Domain Verification**: Add your production domain to Stripe settings

## Security Notes

- Never commit your `.env.local` file to version control
- The secret key should only be used on the server side
- The publishable key is safe to use on the client side
- All payment processing is handled securely by Stripe

## Files Created

- `src/app/support/page.tsx` - Main donation page
- `src/app/support/success/page.tsx` - Success confirmation page
- `src/app/api/create-checkout-session/route.ts` - Payment processing API
- `package.json` - Updated with Stripe dependencies

The Support Us button is already linked in your main navigation header and will direct users to `/support`.
