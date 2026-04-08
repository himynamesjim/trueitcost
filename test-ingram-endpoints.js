/**
 * Test different Ingram Micro endpoint configurations
 * Run: node test-ingram-endpoints.js
 */

const CREDENTIALS = {
  customer_number: '21-162272',
  client_id: 'LHUjAYoW76lbNgw2klZS44emCsX2khnQ',
  client_secret: 'Gw4aP09RMhkg06OG',
};

const authString = Buffer.from(
  `${CREDENTIALS.client_id}:${CREDENTIALS.client_secret}`
).toString('base64');

// Different endpoint configurations to try
const ENDPOINTS = [
  {
    name: 'Production OAuth',
    tokenUrl: 'https://api.ingrammicro.com/oauth/oauth20/token',
    catalogBase: 'https://api.ingrammicro.com',
  },
  {
    name: 'Sandbox OAuth (port 443)',
    tokenUrl: 'https://api.ingrammicro.com:443/oauth/oauth20/token',
    catalogBase: 'https://api.ingrammicro.com:443/sandbox',
  },
  {
    name: 'Sandbox OAuth (no port)',
    tokenUrl: 'https://api.ingrammicro.com/oauth/oauth20/token',
    catalogBase: 'https://api.ingrammicro.com/sandbox',
  },
  {
    name: 'Sandbox direct',
    tokenUrl: 'https://api.ingrammicro.com/sandbox/oauth/oauth20/token',
    catalogBase: 'https://api.ingrammicro.com/sandbox',
  },
];

async function testEndpoint(config) {
  console.log(`\n🧪 Testing: ${config.name}`);
  console.log(`   Token URL: ${config.tokenUrl}`);

  try {
    const response = await fetch(config.tokenUrl, {
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
      console.log(`   ✅ SUCCESS! Token received (expires in ${data.expires_in}s)`);
      console.log(`   Access Token: ${data.access_token.substring(0, 20)}...`);
      return { success: true, config, token: data.access_token };
    } else {
      const errorText = await response.text();
      console.log(`   ❌ Failed: ${errorText.substring(0, 100)}`);
      return { success: false, config };
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return { success: false, config, error: error.message };
  }
}

async function runTests() {
  console.log('🔍 Testing Ingram Micro API Endpoints\n');
  console.log('Credentials:');
  console.log(`   Customer: ${CREDENTIALS.customer_number}`);
  console.log(`   Client ID: ${CREDENTIALS.client_id}`);
  console.log('=' .repeat(60));

  const results = [];

  for (const endpoint of ENDPOINTS) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s between tests
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Test Summary:\n');

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`✅ Successful: ${successful.length}`);
  console.log(`❌ Failed: ${failed.length}\n`);

  if (successful.length > 0) {
    console.log('🎉 Working configuration(s):');
    successful.forEach(r => {
      console.log(`   - ${r.config.name}`);
      console.log(`     Token URL: ${r.config.tokenUrl}`);
      console.log(`     Catalog Base: ${r.config.catalogBase}\n`);
    });
  } else {
    console.log('⚠️  No working configurations found.\n');
    console.log('Possible issues:');
    console.log('   1. Sandbox app not fully activated yet');
    console.log('   2. Client ID/Secret incorrect (check Ingram portal)');
    console.log('   3. App needs additional permissions');
    console.log('   4. Sandbox environment not available\n');
    console.log('💡 Recommendations:');
    console.log('   - Log into https://developer.ingrammicro.com/');
    console.log('   - Verify app status is "Active" (not just "Approved")');
    console.log('   - Try regenerating credentials');
    console.log('   - Contact Ingram support: apigateway@ingrammicro.com\n');
  }
}

runTests();
