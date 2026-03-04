-- Add design limit tracking for trial users
-- Run this SQL command in your Supabase SQL Editor

-- Add designs_created column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS designs_created INTEGER DEFAULT 0;

-- Create function to increment design counter
CREATE OR REPLACE FUNCTION public.increment_design_count(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE public.profiles
  SET designs_created = designs_created + 1,
      updated_at = NOW()
  WHERE id = user_uuid
  RETURNING designs_created INTO new_count;

  RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to decrement design counter
CREATE OR REPLACE FUNCTION public.decrement_design_count(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE public.profiles
  SET designs_created = GREATEST(designs_created - 1, 0),
      updated_at = NOW()
  WHERE id = user_uuid
  RETURNING designs_created INTO new_count;

  RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user can create design
CREATE OR REPLACE FUNCTION public.can_create_design(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_status TEXT;
  user_tier TEXT;
  user_count INTEGER;
  trial_end TIMESTAMPTZ;
BEGIN
  SELECT subscription_status, subscription_tier, designs_created, trial_ends_at
  INTO user_status, user_tier, user_count, trial_end
  FROM public.profiles
  WHERE id = user_uuid;

  -- Paid users have unlimited designs
  IF user_status = 'active' THEN
    RETURN TRUE;
  END IF;

  -- Trial users are limited to 6 designs
  IF user_status = 'trialing' AND trial_end > NOW() THEN
    RETURN user_count < 6;
  END IF;

  -- Free users cannot create designs
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
