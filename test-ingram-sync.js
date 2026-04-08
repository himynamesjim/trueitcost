/**
 * Test Ingram Micro sync with approved sandbox credentials
 * Run: node test-ingram-sync.js
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testSync() {
  console.log('🧪 Testing Ingram Micro Sync...\n');

  try {
    // Step 1: Check if credentials are saved
    console.log('Step 1: Checking credentials...');
    const { data: creds, error: credsError } = await supabase
      .from('distributor_credentials')
      .select('*')
      .eq('distributor_name', 'ingram_micro')
      .eq('is_active', true)
      .single();

    if (credsError || !creds) {
      console.error('❌ Credentials not found in database');
      console.log('\nℹ️  You need to save credentials first:');
      console.log('   1. Go to http://localhost:3000/vendors');
      console.log('   2. Click "API Settings"');
      console.log('   3. Enter your Ingram Micro credentials');
      console.log('   4. Click "Save Credentials"\n');
      return;
    }

    console.log('✅ Credentials found:');
    console.log(`   Customer Number: ${creds.customer_number}`);
    console.log(`   Client ID: ${creds.client_id}`);
    console.log(`   Base URL: ${creds.base_url}`);
    console.log(`   Environment: ${creds.environment}\n`);

    // Step 2: Test authentication
    console.log('Step 2: Testing OAuth authentication...');
    // OAuth endpoint is always at root, regardless of sandbox/production
    const baseAuthUrl = creds.base_url.replace(':443/sandbox', '');
    const tokenUrl = `${baseAuthUrl}/oauth/oauth20/token`;
    const authString = Buffer.from(
      `${creds.client_id}:${creds.client_secret}`
    ).toString('base64');

    console.log(`   Token URL: ${tokenUrl}`);

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
      console.error(`❌ Authentication failed: ${authResponse.status} ${authResponse.statusText}`);
      console.error(`   Response: ${errorText}\n`);

      if (authResponse.status === 400) {
        console.log('💡 Common issues:');
        console.log('   - Client ID or Secret is incorrect');
        console.log('   - Credentials are for wrong environment (sandbox vs production)');
        console.log('   - Base URL is incorrect for sandbox\n');
        console.log('📝 Sandbox should use: https://api.ingrammicro.com:443/sandbox');
        console.log('📝 Production should use: https://api.ingrammicro.com\n');
      }
      return;
    }

    const authData = await authResponse.json();
    console.log('✅ Authentication successful!');
    console.log(`   Access token received (expires in ${authData.expires_in}s)\n`);

    // Step 3: Test catalog API
    console.log('Step 3: Testing catalog API...');
    const catalogUrl = `${creds.base_url}/resellers/v6/catalog`;

    const catalogResponse = await fetch(catalogUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authData.access_token}`,
        'IM-CustomerNumber': creds.customer_number,
        'IM-CountryCode': 'US',
        'IM-CorrelationID': `test-${Date.now()}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    console.log(`   Catalog URL: ${catalogUrl}`);
    console.log(`   Status: ${catalogResponse.status} ${catalogResponse.statusText}`);

    if (!catalogResponse.ok) {
      const errorText = await catalogResponse.text();
      console.error(`❌ Catalog API failed`);
      console.error(`   Response: ${errorText}\n`);

      if (catalogResponse.status === 403) {
        console.log('💡 403 Forbidden - Your sandbox app may need additional permissions');
      }
      return;
    }

    const catalogData = await catalogResponse.json();
    console.log('✅ Catalog API successful!');
    console.log(`   Products returned: ${catalogData.catalog?.length || 0}\n`);

    if (catalogData.catalog && catalogData.catalog.length > 0) {
      console.log('📦 Sample product:');
      const sample = catalogData.catalog[0];
      console.log(`   Part Number: ${sample.ingramPartNumber}`);
      console.log(`   Vendor: ${sample.vendorName}`);
      console.log(`   Description: ${sample.description}`);
      console.log(`   Price: $${sample.pricing?.retailPrice || 'N/A'}\n`);
    }

    // Step 4: Check vendor configuration
    console.log('Step 4: Checking vendor configuration...');
    const { data: vendors } = await supabase
      .from('vendors')
      .select('*')
      .order('name');

    console.log(`   Vendors found: ${vendors?.length || 0}`);
    vendors?.forEach(v => {
      console.log(`   - ${v.name} (code: ${v.ingram_vendor_code || 'NOT SET'})`);
    });

    console.log('\n✅ All diagnostic tests passed!');
    console.log('\n📋 Next steps:');
    console.log('   1. Ensure vendors have ingram_vendor_code set');
    console.log('   2. Try syncing a vendor from the UI');
    console.log('   3. Check catalog_sync_logs table for detailed errors\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\nFull error:', error);
  }
}

testSync();
