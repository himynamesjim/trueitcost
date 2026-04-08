/**
 * Update Ingram Micro credentials with exact values from user
 * Run: node update-credentials-final.js
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// EXACT credentials provided by user
const CREDENTIALS = {
  customer_number: '21-162272',
  client_id: 'LHUjAYoW76lbNgw2klZS44emCsX2khnQ',
  client_secret: 'Gw4aP09RMhkg06OG',
  base_url: 'https://api.ingrammicro.com:443/sandbox',
  environment: 'sandbox',
};

async function updateCredentials() {
  console.log('🔧 Updating Ingram Micro credentials with user-provided values...\n');

  try {
    const { data: creds, error: fetchError } = await supabase
      .from('distributor_credentials')
      .select('*')
      .eq('distributor_name', 'ingram_micro')
      .eq('is_active', true)
      .single();

    if (fetchError || !creds) {
      console.log('Creating new credentials...');
      const { error: insertError } = await supabase
        .from('distributor_credentials')
        .insert({
          distributor_name: 'ingram_micro',
          ...CREDENTIALS,
          is_active: true,
        });

      if (insertError) {
        console.error('❌ Insert failed:', insertError.message);
        return;
      }
      console.log('✅ Credentials created!\n');
    } else {
      const { error: updateError } = await supabase
        .from('distributor_credentials')
        .update({
          ...CREDENTIALS,
          updated_at: new Date().toISOString(),
        })
        .eq('id', creds.id);

      if (updateError) {
        console.error('❌ Update failed:', updateError.message);
        return;
      }
      console.log('✅ Credentials updated!\n');
    }

    console.log('Saved credentials:');
    console.log(`   Customer Number: ${CREDENTIALS.customer_number}`);
    console.log(`   Client ID: ${CREDENTIALS.client_id}`);
    console.log(`   Client Secret: ${CREDENTIALS.client_secret}`);
    console.log(`   Base URL: ${CREDENTIALS.base_url}`);
    console.log(`   Environment: ${CREDENTIALS.environment}\n`);

    console.log('📋 Testing authentication...\n');

    // Test authentication
    const baseAuthUrl = CREDENTIALS.base_url.replace(':443/sandbox', '');
    const tokenUrl = `${baseAuthUrl}/oauth/oauth20/token`;
    const authString = Buffer.from(
      `${CREDENTIALS.client_id}:${CREDENTIALS.client_secret}`
    ).toString('base64');

    const authResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${authString}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.error(`❌ Authentication test failed: ${authResponse.status} ${authResponse.statusText}`);
      console.error(`   Response: ${errorText}\n`);
      console.log('⚠️  The credentials were saved but authentication is still failing.');
      console.log('   This means the Client ID/Secret from Ingram Micro portal may be incorrect or inactive.\n');
      return;
    }

    const authData = await authResponse.json();
    console.log('✅ Authentication successful!');
    console.log(`   Access token received (expires in ${authData.expires_in}s)\n`);
    console.log('🎉 You can now sync catalogs from http://localhost:3000/vendors\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

updateCredentials();
