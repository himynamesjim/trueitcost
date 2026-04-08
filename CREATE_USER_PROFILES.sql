-- Create user_profiles table for admin access
-- This table is needed for vendor catalog management

-- Create the table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_admin ON user_profiles(is_admin);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Create policies
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Insert profile for existing users and set first user as admin
-- This will create profiles for all existing auth.users
INSERT INTO user_profiles (user_id, email, is_admin)
SELECT
  id,
  email,
  ROW_NUMBER() OVER (ORDER BY created_at) = 1 AS is_admin  -- First user becomes admin
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- Display results
SELECT
  email,
  is_admin,
  created_at
FROM user_profiles
ORDER BY created_at;
