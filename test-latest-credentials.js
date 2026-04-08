/**
 * Test with latest credentials from Ingram Micro portal
 * Run: node test-latest-credentials.js
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const LATEST_CREDENTIALS = {
  customer_number: '21-162272',
  client_id: 'LHUjAYoW76lbNgw2klZS44emCsX2khnQ',
  client_secret: 'Gw4aP09RMhkg06OG',
  secret_key: 'sTDYFtG5pqLKoANcQbNyrTIssknx1B2S',
  base_url: 'https://api.ingrammicro.com:443/sandbox',
  environment: 'sandbox',
};

async function testAuth() {
  console.log('🧪 Testing Ingram Micro Authentication with Latest Credentials\n');

  console.log('Credentials:');
  console.log(`   Customer Number: ${LATEST_CREDENTIALS.customer_number}`);
  console.log(`   Client ID: ${LATEST_CREDENTIALS.client_id}`);
  console.log(`   Client Secret: ${LATEST_CREDENTIALS.client_secret}`);
  console.log(`   Secret Key: ${LATEST_CREDENTIALS.secret_key}\n`);

  // Test with Client Secret
  console.log('1️⃣  Testing OAuth with Client Secret...');

  const baseAuthUrl = LATEST_CREDENTIALS.base_url.replace(':443/sandbox', '');
  const tokenUrl = `${baseAuthUrl}/oauth/oauth20/token`;

  const authString = Buffer.from(
    `${LATEST_CREDENTIALS.client_id}:${LATEST_CREDENTIALS.client_secret}`
  ).toString('base64');

  console.log(`   Token URL: ${tokenUrl}`);
  console.log(`   Auth: Basic ${authString.substring(0, 20)}...`);

  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${authString}`,
      },
      body: 'grant_type=client_credentials',
    });

    console.log(`   Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Authentication SUCCESSFUL!`);
      console.log(`   Access Token: ${data.access_token.substring(0, 30)}...`);
      console.log(`   Token Type: ${data.token_type}`);
      console.log(`   Expires In: ${data.expires_in}s\n`);

      // Save to database
      console.log('💾 Saving credentials to database...');

      const { data: existing } = await supabase
        .from('distributor_credentials')
        .select('id')
        .eq('distributor_name', 'ingram_micro')
        .eq('is_active', true)
        .single();

      if (existing) {
        await supabase
          .from('distributor_credentials')
          .update({
            customer_number: LATEST_CREDENTIALS.customer_number,
            client_id: LATEST_CREDENTIALS.client_id,
            client_secret: LATEST_CREDENTIALS.client_secret,
            base_url: LATEST_CREDENTIALS.base_url,
            environment: LATEST_CREDENTIALS.environment,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        console.log('   ✅ Credentials updated in database\n');
      } else {
        await supabase
          .from('distributor_credentials')
          .insert({
            distributor_name: 'ingram_micro',
            ...LATEST_CREDENTIALS,
            is_active: true,
          });

        console.log('   ✅ Credentials saved to database\n');
      }

      console.log('🎉 SUCCESS! You can now:');
      console.log('   1. Go to http://localhost:3000/vendors');
      console.log('   2. Click "Sync Catalog" on any vendor');
      console.log('   3. Watch the products sync!\n');

      return true;
    } else {
      const errorText = await response.text();
      console.log(`   ❌ Authentication failed`);
      console.log(`   Response: ${errorText}\n`);

      console.log('💡 Troubleshooting:');
      console.log('   - The Client ID is still not recognized by Ingram Micro');
      console.log('   - Try sending a test event from the portal to verify app is active');
      console.log('   - Check if there are any pending approval steps');
      console.log('   - Contact Ingram support if issue persists\n');

      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
    return false;
  }
}

testAuth();
