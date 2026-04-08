/**
 * Test Ingram Micro Catalog API with different authentication approaches
 * Run: node test-catalog-api-direct.js
 */

const CREDENTIALS = {
  customer_number: '21-162272',
  client_id: 'LHUjAYoW76lbNgw2klZS44emCsX2khnQ',
  client_secret: 'Gw4aP09RMhkg06OG',
};

console.log('🧪 Testing Ingram Micro Product Catalog API\n');
console.log('=' .repeat(60));

async function testOAuthV2() {
  console.log('\n1️⃣  OAuth 2.0 Client Credentials (Standard)');
  console.log('   URL: https://api.ingrammicro.com/oauth/oauth20/token\n');

  const authString = Buffer.from(
    `${CREDENTIALS.client_id}:${CREDENTIALS.client_secret}`
  ).toString('base64');

  try {
    const response = await fetch('https://api.ingrammicro.com/oauth/oauth20/token', {
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
      console.log(`   ✅ SUCCESS!`);
      console.log(`   Token: ${data.access_token.substring(0, 40)}...`);
      return data.access_token;
    } else {
      const error = await response.text();
      console.log(`   ❌ Failed: ${error.substring(0, 150)}`);
      return null;
    }
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
    return null;
  }
}

async function testSandboxOAuth() {
  console.log('\n2️⃣  Sandbox-specific OAuth endpoint');
  console.log('   URL: https://api.ingrammicro.com:443/sandbox/oauth/oauth20/token\n');

  const authString = Buffer.from(
    `${CREDENTIALS.client_id}:${CREDENTIALS.client_secret}`
  ).toString('base64');

  try {
    const response = await fetch('https://api.ingrammicro.com:443/sandbox/oauth/oauth20/token', {
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
      console.log(`   ✅ SUCCESS!`);
      console.log(`   Token: ${data.access_token.substring(0, 40)}...`);
      return data.access_token;
    } else {
      const error = await response.text();
      console.log(`   ❌ Failed: ${error.substring(0, 150)}`);
      return null;
    }
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
    return null;
  }
}

async function testCatalogAPIWithoutAuth() {
  console.log('\n3️⃣  Direct Catalog API call (testing if auth is even needed)');
  console.log('   URL: https://api.ingrammicro.com:443/sandbox/resellers/v6/catalog\n');

  try {
    const response = await fetch('https://api.ingrammicro.com:443/sandbox/resellers/v6/catalog', {
      method: 'GET',
      headers: {
        'IM-CustomerNumber': CREDENTIALS.customer_number,
        'IM-CountryCode': 'US',
        'IM-CorrelationID': `test-${Date.now()}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    console.log(`   Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Catalog accessible without OAuth!`);
      console.log(`   Products: ${data.catalog?.length || 0}`);
      return true;
    } else {
      const error = await response.text();
      console.log(`   ❌ Failed: ${error.substring(0, 150)}`);

      if (response.status === 401) {
        console.log(`   → OAuth required`);
      }
      return false;
    }
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
    return false;
  }
}

async function testCatalogAPIWithAPIKey() {
  console.log('\n4️⃣  Catalog API with Client ID as API Key (header-based auth)');
  console.log('   URL: https://api.ingrammicro.com:443/sandbox/resellers/v6/catalog\n');

  try {
    const response = await fetch('https://api.ingrammicro.com:443/sandbox/resellers/v6/catalog', {
      method: 'GET',
      headers: {
        'IM-CustomerNumber': CREDENTIALS.customer_number,
        'IM-CountryCode': 'US',
        'IM-CorrelationID': `test-${Date.now()}`,
        'IM-ApplicationID': CREDENTIALS.client_id,
        'IM-ClientSecret': CREDENTIALS.client_secret,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    console.log(`   Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ SUCCESS with header-based auth!`);
      console.log(`   Products: ${data.catalog?.length || 0}`);
      return true;
    } else {
      const error = await response.text();
      console.log(`   ❌ Failed: ${error.substring(0, 150)}`);
      return false;
    }
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log('Testing all possible authentication methods...\n');

  const token1 = await testOAuthV2();
  await new Promise(r => setTimeout(r, 1000));

  const token2 = await testSandboxOAuth();
  await new Promise(r => setTimeout(r, 1000));

  const direct = await testCatalogAPIWithoutAuth();
  await new Promise(r => setTimeout(r, 1000));

  const headerAuth = await testCatalogAPIWithAPIKey();

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Results Summary:\n');

  if (token1) {
    console.log('✅ Standard OAuth works - use this method');
  } else if (token2) {
    console.log('✅ Sandbox OAuth works - use this method');
  } else if (direct) {
    console.log('✅ No auth needed - unexpected but we can use it!');
  } else if (headerAuth) {
    console.log('✅ Header-based auth works - update code to use this');
  } else {
    console.log('❌ All authentication methods failed\n');
    console.log('🔍 Possible Issues:');
    console.log('   1. App credentials not yet active in API system');
    console.log('   2. Client ID might be for webhooks only, not API access');
    console.log('   3. Need to request API access separately from webhook access\n');
    console.log('💡 Next Steps:');
    console.log('   → Check Ingram portal for separate "API Credentials"');
    console.log('   → Look for "Product Catalog API" specific credentials');
    console.log('   → Contact Ingram support: apigateway@ingrammicro.com');
  }
}

runAllTests();
