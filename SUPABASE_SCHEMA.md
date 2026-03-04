# Supabase Database Schema

Run these SQL commands in your Supabase SQL Editor to create the database schema.

## 1. Enable UUID Extension

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

## 2. Users Table (extends auth.users)

```sql
-- Create profiles table to extend Supabase auth.users
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT CHECK (subscription_tier IN ('free', 'builder', 'professional', 'all-in')) DEFAULT 'free',
  subscription_status TEXT CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'trialing')) DEFAULT 'trialing',
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  trial_ends_at TIMESTAMPTZ,
  subscription_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, trial_ends_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NOW() + INTERVAL '7 days'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles updated_at
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

## 3. Saved Designs Table

```sql
-- Create saved_designs table
CREATE TABLE public.saved_designs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  design_type TEXT CHECK (design_type IN (
    'collaboration',
    'ucaas',
    'networking',
    'datacenter',
    'security',
    'bcdr'
  )) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  design_data JSONB NOT NULL,
  ai_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.saved_designs ENABLE ROW LEVEL SECURITY;

-- Saved designs policies
CREATE POLICY "Users can view own designs"
  ON public.saved_designs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own designs"
  ON public.saved_designs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own designs"
  ON public.saved_designs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own designs"
  ON public.saved_designs FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for saved_designs updated_at
CREATE TRIGGER set_saved_designs_updated_at
  BEFORE UPDATE ON public.saved_designs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Index for faster queries
CREATE INDEX saved_designs_user_id_idx ON public.saved_designs(user_id);
CREATE INDEX saved_designs_design_type_idx ON public.saved_designs(design_type);
```

## 4. Saved Calculations Table

```sql
-- Create saved_calculations table
CREATE TABLE public.saved_calculations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  calculation_type TEXT CHECK (calculation_type IN (
    'coterm',
    'assessment',
    'downtime',
    'hardware-lifecycle',
    'cloud-vs-onprem',
    'inhouse-vs-msp'
  )) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  calculation_data JSONB NOT NULL,
  results JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.saved_calculations ENABLE ROW LEVEL SECURITY;

-- Saved calculations policies
CREATE POLICY "Users can view own calculations"
  ON public.saved_calculations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calculations"
  ON public.saved_calculations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calculations"
  ON public.saved_calculations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own calculations"
  ON public.saved_calculations FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for saved_calculations updated_at
CREATE TRIGGER set_saved_calculations_updated_at
  BEFORE UPDATE ON public.saved_calculations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Index for faster queries
CREATE INDEX saved_calculations_user_id_idx ON public.saved_calculations(user_id);
CREATE INDEX saved_calculations_calculation_type_idx ON public.saved_calculations(calculation_type);
```

## 5. Usage Analytics Table

```sql
-- Create usage_analytics table
CREATE TABLE public.usage_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  tool_type TEXT,
  metadata JSONB,
  session_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.usage_analytics ENABLE ROW LEVEL SECURITY;

-- Usage analytics policies
CREATE POLICY "Users can view own analytics"
  ON public.usage_analytics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert analytics"
  ON public.usage_analytics FOR INSERT
  WITH CHECK (true);

-- Indexes for analytics queries
CREATE INDEX usage_analytics_user_id_idx ON public.usage_analytics(user_id);
CREATE INDEX usage_analytics_event_type_idx ON public.usage_analytics(event_type);
CREATE INDEX usage_analytics_created_at_idx ON public.usage_analytics(created_at DESC);
```

## 6. Subscription Events Table (for Stripe webhooks)

```sql
-- Create subscription_events table
CREATE TABLE public.subscription_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  stripe_event_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  event_data JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

-- Subscription events policies (only service role can access)
CREATE POLICY "Service role can manage subscription events"
  ON public.subscription_events FOR ALL
  USING (auth.role() = 'service_role');

-- Index for webhook processing
CREATE INDEX subscription_events_stripe_event_id_idx ON public.subscription_events(stripe_event_id);
CREATE INDEX subscription_events_processed_idx ON public.subscription_events(processed);
```

## 7. Feature Access Function

```sql
-- Function to check if user has access to a feature
CREATE OR REPLACE FUNCTION public.has_feature_access(
  user_uuid UUID,
  feature TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  tier TEXT;
  status TEXT;
  trial_end TIMESTAMPTZ;
BEGIN
  SELECT subscription_tier, subscription_status, trial_ends_at
  INTO tier, status, trial_end
  FROM public.profiles
  WHERE id = user_uuid;

  -- Check if in trial or active subscription
  IF status = 'trialing' AND trial_end > NOW() THEN
    RETURN TRUE;
  END IF;

  IF status != 'active' THEN
    RETURN FALSE;
  END IF;

  -- Feature access based on tier
  CASE tier
    WHEN 'all-in' THEN
      RETURN TRUE;
    WHEN 'professional' THEN
      RETURN feature IN ('solution-architect', 'coterm-calc', 'assessment');
    WHEN 'builder' THEN
      RETURN feature IN ('single-builder');
    ELSE
      RETURN FALSE;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 8. Storage Buckets

```sql
-- Create storage bucket for user uploads (logos, etc)
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-uploads', 'user-uploads', true);

-- Storage policies
CREATE POLICY "Users can upload own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Next Steps

1. Run these SQL commands in Supabase SQL Editor
2. Enable Google OAuth in Supabase Auth settings
3. Configure email templates for Magic Link
4. Set up Stripe webhook endpoint for subscription management
5. Add service role key to .env.local (get from Supabase dashboard under API settings)
