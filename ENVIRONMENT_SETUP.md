# Environment Variables Setup

Add these environment variables to your `.env.local` file: 

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=no-reply@theinklined.com
EMAIL_PASSWORD=your_app_password_here
EMAIL_FROM=no-reply@theinklined.com

# SMTP Configuration (alternative to Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false

# Python API (optional)
PYTHON_API_URL=http://localhost:8000
```

## Setup Instructions

### 1. Stripe Webhook Setup
1. Go to your Stripe Dashboard
2. Navigate to Webhooks
3. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
4. Select events: `checkout.session.completed`
5. Copy the webhook secret to `STRIPE_WEBHOOK_SECRET`

### 2. Email Setup (Gmail)
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use the app password in `EMAIL_PASSWORD`

### 3. Email Setup (Custom SMTP)
If using a different email service, configure the SMTP settings accordingly.
