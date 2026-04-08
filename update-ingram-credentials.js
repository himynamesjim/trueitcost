/**
 * Update Ingram Micro credentials with correct values
 * Based on your sandbox screenshot:
 * - Customer Number: 21-162272
 * - Client ID: LHUjAYoW76ibNgw2kIZS44emCsX2khnQ
 * - Client Secret: Gw4aP09RMhkg06OG
 *
 * Run: node update-ingram-credentials.js
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Correct credentials from your sandbox
const CORRECT_CREDENTIALS = {
  customer_number: '21-162272',
  client_id: 'LHUjAYoW76ibNgw2kIZS44emCsX2khnQ',
  client_secret: 'Gw4aP09RMhkg06OG',
  base_url: 'https://api.ingrammicro.com:443/sandbox',
  environment: 'sandbox',
};

async function updateCredentials() {
  console.log('🔧 Updating Ingram Micro sandbox credentials...\n');

  try {
    // Get current credentials
    const { data: creds, error: fetchError } = await supabase
      .from('distributor_credentials')
      .select('*')
      .eq('distributor_name', 'ingram_micro')
      .eq('is_active', true)
      .single();

    if (fetchError || !creds) {
      console.log('❌ No existing credentials found. Creating new...');

      // Create new credentials
      const { error: insertError } = await supabase
        .from('distributor_credentials')
        .insert({
          distributor_name: 'ingram_micro',
          ...CORRECT_CREDENTIALS,
          is_active: true,
        });

      if (insertError) {
        console.error('❌ Insert failed:', insertError.message);
        return;
      }

      console.log('✅ Credentials created successfully!\n');
    } else {
      console.log('Current credentials:');
      console.log(`   Customer Number: ${creds.customer_number}`);
      console.log(`   Client ID: ${creds.client_id}`);
      console.log(`   Base URL: ${creds.base_url}\n`);

      // Update credentials
      const { error: updateError } = await supabase
        .from('distributor_credentials')
        .update({
          ...CORRECT_CREDENTIALS,
          updated_at: new Date().toISOString(),
        })
        .eq('id', creds.id);

      if (updateError) {
        console.error('❌ Update failed:', updateError.message);
        return;
      }

      console.log('✅ Credentials updated successfully!');
      console.log('\nNew credentials:');
      console.log(`   Customer Number: ${CORRECT_CREDENTIALS.customer_number}`);
      console.log(`   Client ID: ${CORRECT_CREDENTIALS.client_id}`);
      console.log(`   Base URL: ${CORRECT_CREDENTIALS.base_url}\n`);
    }

    console.log('📋 Next steps:');
    console.log('   1. Run: node test-ingram-sync.js (to verify)');
    console.log('   2. Try syncing from http://localhost:3000/vendors\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

updateCredentials();
