# Google reCAPTCHA v3 Setup

This application uses Google reCAPTCHA v3 to protect signup forms from bots and spam.

## Setup Instructions

### 1. Get reCAPTCHA Keys

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Click the **+** button to register a new site
3. Fill in the registration form:
   - **Label**: TrueITCost (or your preferred name)
   - **reCAPTCHA type**: Select **reCAPTCHA v3**
   - **Domains**: Add your domains:
     - `localhost` (for development)
     - Your production domain (e.g., `trueitcost.com`)
   - Accept the reCAPTCHA Terms of Service
4. Click **Submit**

### 2. Add Keys to Environment Variables

1. Copy your **Site Key** from the reCAPTCHA admin console
2. Open your `.env.local` file
3. Replace `your_recaptcha_site_key_here` with your actual site key:

```
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_actual_site_key_here
```

4. Restart your development server for the changes to take effect

### 3. Verify Setup

1. Navigate to the signup page: `http://localhost:3000/signup`
2. Open your browser's developer console
3. Fill out the signup form and submit it
4. You should see a console log with the reCAPTCHA token

### 4. Backend Verification (TODO)

When you implement the actual authentication, you'll need to verify the reCAPTCHA token on the backend:

```typescript
// Example backend verification
const verifyRecaptcha = async (token: string) => {
  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`
  });

  const data = await response.json();
  return data.success && data.score >= 0.5; // Adjust score threshold as needed
};
```

## How It Works

- **reCAPTCHA v3** runs in the background without requiring user interaction (no checkbox)
- It generates a score (0.0 to 1.0) indicating the likelihood that the user is a bot
- The token is included with form submissions and should be verified on your backend
- Currently implemented on:
  - `/signup` page (free trial signup)
  - `/login` page (register mode only)

## Troubleshooting

### Warning: "reCAPTCHA site key not found"
- Make sure you've added `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` to your `.env.local` file
- Restart your development server after adding the key

### reCAPTCHA badge not showing
- This is normal for reCAPTCHA v3 - it runs invisibly
- A small badge will appear in the bottom-right corner of the page

### Token not being generated
- Check the browser console for errors
- Verify your site key is correct
- Make sure your domain is registered in the reCAPTCHA admin console
