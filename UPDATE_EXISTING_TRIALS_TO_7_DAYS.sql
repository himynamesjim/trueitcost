-- Update existing trial users to have 7 days from now
-- This will reset the trial period for all current trialing users

-- Option 1: Update ALL trialing users to have 7 days from now
UPDATE public.profiles
SET trial_ends_at = NOW() + INTERVAL '7 days',
    updated_at = NOW()
WHERE subscription_status = 'trialing'
  AND trial_ends_at IS NOT NULL;

-- Option 2: Only update specific user by email (replace with your email)
-- UPDATE public.profiles
-- SET trial_ends_at = NOW() + INTERVAL '7 days',
--     updated_at = NOW()
-- WHERE email = 'your-email@example.com'
--   AND subscription_status = 'trialing';
