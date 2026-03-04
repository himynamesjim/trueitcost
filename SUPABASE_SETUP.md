# Supabase Setup Guide

This guide will help you complete the Supabase integration for TrueITCost, including authentication, database setup, and Stripe integration.

## Prerequisites

- Supabase account created
- Project URL: `https://vkpnpewpxnybfhzoweiq.supabase.co`
- Anon/Publishable key already added to `.env.local`
- Database password: `6%$Txi61&2$W^9`

## Step 1: Add Service Role Key

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the **service_role** key (secret key)
4. Update `.env.local`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

## Step 2: Run Database Schema

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file `SUPABASE_SCHEMA.md` in this project
4. Copy and run each SQL block in order (sections 1-8):
   - Section 1: Enable UUID Extension
   - Section 2: Users/Profiles Table with RLS policies
   - Section 3: Saved Designs Table
   - Section 4: Saved Calculations Table
   - Section 5: Usage Analytics Table
   - Section 6: Subscription Events Table
   - Section 7: Feature Access Function
   - Section 8: Storage Buckets

5. Verify all tables were created:
   - Go to **Table Editor**
   - You should see: `profiles`, `saved_designs`, `saved_calculations`, `usage_analytics`, `subscription_events`

## Step 3: Configure Google OAuth

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Providers**
3. Click on **Google**
4. Enable Google provider
5. You'll need to create a Google OAuth App:

### Creating Google OAuth Credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Choose **Web application**
6. Add Authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - Your production domain (when deployed)
7. Add Authorized redirect URIs:
   - `https://vkpnpewpxnybfhzoweiq.supabase.co/auth/v1/callback`
8. Copy the **Client ID** and **Client Secret**
9. Paste them into Supabase Google provider settings
10. Click **Save**

## Step 4: Configure Magic Link Email

1. Go to **Authentication** → **Email Templates**
2. Click on **Magic Link**
3. Customize the email template if desired (optional)
4. The default template works fine for testing

### Email Settings:

1. Go to **Settings** → **Auth**
2. Under **Email Auth**:
   - ✅ Enable email confirmations (optional, recommended for production)
   - ✅ Enable email sign-ins
3. Configure SMTP (optional but recommended for production):
   - Go to **Settings** → **Auth** → **SMTP Settings**
   - For development, Supabase's built-in email works fine
   - For production, configure your own SMTP server

## Step 5: Configure Auth Settings

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to your production domain (or `http://localhost:3000` for testing)
3. Add **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - Your production domain + `/auth/callback`
   - Any other redirect URLs you need

## Step 6: Test Authentication

1. Restart your dev server if it's running:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000
3. Click the **Login** button in the header
4. Try both authentication methods:
   - **Google OAuth**: Click "Continue with Google"
   - **Magic Link**: Enter email and click "Send magic link"

5. If Magic Link is used:
   - Check your email
   - Click the magic link
   - You should be redirected back and logged in

6. Verify you're logged in:
   - You should see your email/avatar in the header
   - Click on it to see the dropdown menu
   - Navigate to **Account Settings** to see your profile

## Step 7: Stripe Integration (Optional - for paid subscriptions)

### Get Stripe Keys:

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers** → **API keys**
3. Copy:
   - **Publishable key**
   - **Secret key**
4. Add to `.env.local`:
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_... (we'll get this next)
   ```

### Create Products in Stripe:

1. Go to **Products** in Stripe Dashboard
2. Create 3 products matching your pricing:
   - **Builder**: $4.99/month
   - **Professional**: $9.99/month
   - **All-In**: $14.99/month
3. Copy each product's **Price ID** (starts with `price_`)

### Configure Stripe Webhook:

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. For development, use Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
4. Copy the webhook signing secret (starts with `whsec_`)
5. Add it to `.env.local` as `STRIPE_WEBHOOK_SECRET`

### Create Stripe Webhook Endpoint (we'll need to implement this):

The webhook will handle:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

## Step 8: Verify Everything Works

### Check Database:

1. Sign up a test user
2. Go to Supabase **Table Editor**
3. Open the `profiles` table
4. You should see your test user with:
   - Email
   - `subscription_tier: 'free'`
   - `subscription_status: 'trialing'`
   - `trial_ends_at`: 7 days from now

### Check Authentication:

1. Sign out
2. Sign in with Google
3. Sign out
4. Sign in with Magic Link
5. Both should work seamlessly

### Check Account Page:

1. While logged in, click your avatar in the header
2. Click **Account Settings**
3. You should see:
   - Your profile information
   - Subscription status (Free Plan)
   - Empty saved designs section
   - Usage statistics (all zeros for now)

## Troubleshooting

### "Invalid redirect URL" error:
- Make sure you added all redirect URLs in Supabase Auth settings
- Check that URLs match exactly (http vs https, with/without trailing slash)

### Magic Link not arriving:
- Check your spam folder
- For development, Supabase emails might be delayed
- Consider setting up custom SMTP for production

### Google OAuth not working:
- Verify Google OAuth credentials are correct in Supabase
- Check that redirect URI is exactly: `https://vkpnpewpxnybfhzoweiq.supabase.co/auth/v1/callback`
- Make sure Google Cloud project has proper permissions

### Database errors:
- Check SQL queries ran successfully
- Verify RLS policies are enabled
- Check browser console for specific error messages

### Can't access account page:
- Make sure you're logged in
- Check browser console for auth errors
- Verify the auth callback route is working

## Environment Variables Checklist

Make sure your `.env.local` has all of these:

```bash
# Anthropic API
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://vkpnpewpxnybfhzoweiq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_7H-9iRG6aUcj4RjLTJqiQw_rcVcYZPc
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SUPABASE_DB_PASSWORD=6%$Txi61&2$W^9

# Stripe (when ready)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

## Next Steps

1. Complete Stripe integration (create webhook handler, checkout flow)
2. Implement save/load functionality for designs and calculations
3. Build usage analytics tracking
4. Add subscription management features (upgrade, downgrade, cancel)
5. Create email templates for important events
6. Set up monitoring and error tracking
7. Deploy to production (Vercel)

## Production Checklist

Before going live:

- [ ] Set proper Site URL in Supabase Auth settings
- [ ] Add production redirect URLs
- [ ] Configure custom SMTP for emails
- [ ] Set up proper Stripe webhook endpoint (not CLI)
- [ ] Enable RLS policies on all tables
- [ ] Test all authentication flows
- [ ] Test subscription flows
- [ ] Set up proper error tracking
- [ ] Review security settings
- [ ] Enable rate limiting on API routes
- [ ] Set up database backups

## Need Help?

If you encounter issues:

1. Check browser console for errors
2. Check Supabase logs (Settings → Logs)
3. Review this guide step by step
4. Consult Supabase docs: https://supabase.com/docs
5. Check Stripe docs: https://stripe.com/docs
