-- Fix subscription_tier constraint to allow all valid tier values
-- Run this SQL command in your Supabase SQL Editor

-- First, drop the existing constraint
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_subscription_tier_check;

-- Add the new constraint with all valid tier values
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_subscription_tier_check
CHECK (subscription_tier IN ('free', 'builder', 'professional', 'all_in'));

-- Verify the constraint was added
SELECT
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conname = 'profiles_subscription_tier_check';
