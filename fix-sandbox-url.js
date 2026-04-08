/**
 * Fix Ingram Micro sandbox base URL
 * Run: node fix-sandbox-url.js
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixSandboxURL() {
  console.log('🔧 Fixing Ingram Micro sandbox base URL...\n');

  try {
    // Get current credentials
    const { data: creds, error: fetchError } = await supabase
      .from('distributor_credentials')
      .select('*')
      .eq('distributor_name', 'ingram_micro')
      .eq('is_active', true)
      .single();

    if (fetchError || !creds) {
      console.error('❌ Credentials not found');
      return;
    }

    console.log('Current configuration:');
    console.log(`   Environment: ${creds.environment}`);
    console.log(`   Base URL: ${creds.base_url}\n`);

    // Determine correct base URL
    const correctBaseUrl = creds.environment === 'sandbox'
      ? 'https://api.ingrammicro.com:443/sandbox'
      : 'https://api.ingrammicro.com';

    if (creds.base_url === correctBaseUrl) {
      console.log('✅ Base URL is already correct!');
      return;
    }

    console.log(`Updating to: ${correctBaseUrl}\n`);

    // Update the credentials
    const { error: updateError } = await supabase
      .from('distributor_credentials')
      .update({
        base_url: correctBaseUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', creds.id);

    if (updateError) {
      console.error('❌ Update failed:', updateError.message);
      return;
    }

    console.log('✅ Base URL updated successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Run: node test-ingram-sync.js (to verify fix)');
    console.log('   2. Try syncing from http://localhost:3000/vendors\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixSandboxURL();
