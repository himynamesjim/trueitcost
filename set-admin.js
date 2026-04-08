/**
 * Set current user as admin
 * Run: node set-admin.js
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setAdmin() {
  try {
    console.log('🔍 Checking for user_profiles table...\n');

    // Check if user_profiles table exists
    const { data: tables, error: tablesError } = await supabase
      .from('user_profiles')
      .select('user_id, is_admin, email')
      .limit(1);

    if (tablesError) {
      console.log('⚠️  user_profiles table does not exist yet');
      console.log('\nCreating user_profiles table...');

      // Create the table using service role
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
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

          CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
          CREATE INDEX IF NOT EXISTS idx_user_profiles_is_admin ON user_profiles(is_admin);

          -- Enable RLS
          ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

          -- Create policies
          DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
          CREATE POLICY "Users can read own profile" ON user_profiles
            FOR SELECT USING (auth.uid() = user_id);

          DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
          CREATE POLICY "Users can update own profile" ON user_profiles
            FOR UPDATE USING (auth.uid() = user_id);
        `
      });

      if (createError) {
        console.error('❌ Could not create table automatically');
        console.log('\nPlease run this SQL in Supabase SQL Editor:\n');
        console.log(`
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

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_admin ON user_profiles(is_admin);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);
        `);
        return;
      }
    }

    // Get all users from auth.users
    console.log('📋 Fetching users...\n');

    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message);
      return;
    }

    if (!users || users.length === 0) {
      console.log('⚠️  No users found. Please sign up first at http://localhost:3000');
      return;
    }

    console.log(`Found ${users.length} user(s):\n`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.id})`);
    });

    // Use the first user (or you can modify this to select a specific user)
    const targetUser = users[0];
    console.log(`\n✅ Setting ${targetUser.email} as admin...\n`);

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', targetUser.id)
      .single();

    if (existingProfile) {
      // Update existing profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ is_admin: true })
        .eq('user_id', targetUser.id);

      if (updateError) {
        console.error('❌ Error updating profile:', updateError.message);
        return;
      }
      console.log('✅ Updated existing profile to admin');
    } else {
      // Insert new profile
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: targetUser.id,
          email: targetUser.email,
          is_admin: true,
        });

      if (insertError) {
        console.error('❌ Error creating profile:', insertError.message);
        return;
      }
      console.log('✅ Created new admin profile');
    }

    // Verify
    const { data: verifyProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', targetUser.id)
      .single();

    console.log('\n📊 Profile details:');
    console.log(`   Email: ${verifyProfile.email}`);
    console.log(`   Admin: ${verifyProfile.is_admin}`);
    console.log(`   User ID: ${verifyProfile.user_id}`);

    console.log('\n✅ Success! Refresh the /vendors page to see the sync buttons.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

setAdmin();
