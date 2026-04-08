/**
 * Test OAuth 3.0 endpoint (correct version from documentation)
 * Run: node test-oauth30.js
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const CREDENTIALS = {
  customer_number: '21-162272',
  client_id: 'LHUjAYoW76lbNgw2klZS44emCsX2khnQ',
  client_secret: 'Gw4aP09RMhkg06OG',
};

console.log('🧪 Testing OAuth 3.0 Endpoint (Correct Version)\n');
console.log('=' .repeat(60));

async function testOAuth30() {
  console.log('\n✅ Using CORRECT endpoint from documentation:');
  console.log('   https://api.ingrammicro.com:443/oauth/oauth30/token\n');

  const authString = Buffer.from(
    `${CREDENTIALS.client_id}:${CREDENTIALS.client_secret}`
  ).toString('base64');

  try {
    const response = await fetch('https://api.ingrammicro.com:443/oauth/oauth30/token', {
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
      console.log('\n🎉 SUCCESS! OAuth 3.0 authentication works!\n');
      console.log(`   Access Token: ${data.access_token.substring(0, 50)}...`);
      console.log(`   Token Type: ${data.token_type}`);
      console.log(`   Expires In: ${data.expires_in}s`);
      console.log(`   Scope: ${data.scope || 'default'}\n`);

      // Test catalog API with the token
      console.log('📦 Testing Product Catalog API with token...\n');

      const catalogResponse = await fetch('https://api.ingrammicro.com:443/sandbox/resellers/v6/catalog', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${data.access_token}`,
          'IM-CustomerNumber': CREDENTIALS.customer_number,
          'IM-CountryCode': 'US',
          'IM-CorrelationID': `test-${Date.now()}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      console.log(`   Catalog API Status: ${catalogResponse.status} ${catalogResponse.statusText}`);

      if (catalogResponse.ok) {
        const catalogData = await catalogResponse.json();
        console.log(`   ✅ Catalog API works!`);
        console.log(`   Products returned: ${catalogData.catalog?.length || 0}\n`);

        if (catalogData.catalog && catalogData.catalog.length > 0) {
          const sample = catalogData.catalog[0];
          console.log('   Sample Product:');
          console.log(`     - Part Number: ${sample.ingramPartNumber}`);
          console.log(`     - Vendor: ${sample.vendorName}`);
          console.log(`     - Description: ${sample.description?.substring(0, 50)}`);
          console.log(`     - Price: $${sample.pricing?.retailPrice || 'N/A'}\n`);
        }

        // Update database with correct OAuth endpoint
        console.log('💾 Updating credentials in database with correct OAuth endpoint...\n');

        const { data: creds } = await supabase
          .from('distributor_credentials')
          .select('id')
          .eq('distributor_name', 'ingram_micro')
          .eq('is_active', true)
          .single();

        if (creds) {
          await supabase
            .from('distributor_credentials')
            .update({
              customer_number: CREDENTIALS.customer_number,
              client_id: CREDENTIALS.client_id,
              client_secret: CREDENTIALS.client_secret,
              base_url: 'https://api.ingrammicro.com:443/sandbox',
              environment: 'sandbox',
              updated_at: new Date().toISOString(),
            })
            .eq('id', creds.id);

          console.log('   ✅ Credentials updated in database\n');
        }

        console.log('🎉 ALL TESTS PASSED!\n');
        console.log('Next steps:');
        console.log('   1. Go to http://localhost:3000/vendors');
        console.log('   2. Click "Sync Catalog" on any vendor');
        console.log('   3. Watch the products sync successfully!\n');

        return true;
      } else {
        const errorText = await catalogResponse.text();
        console.log(`   ❌ Catalog API failed: ${errorText.substring(0, 200)}\n`);
        return false;
      }
    } else {
      const errorText = await response.text();
      console.log(`\n   ❌ OAuth failed: ${errorText}\n`);
      return false;
    }
  } catch (error) {
    console.log(`\n   ❌ Error: ${error.message}\n`);
    return false;
  }
}

testOAuth30();
