/**
 * Test Ingram Micro SANDBOX API Connection
 * Sandbox typically uses a different URL
 */

const customerNumber = '21-162272';
const clientId = 'LHUjAYoW76ibNgw2kIZS44emCsX2khnQ';
const clientSecret = 'Gw4aP09RMhkg06OG';

// Try different possible sandbox URLs
const urlsToTry = [
  'https://api.sandbox.ingrammicro.com',
  'https://sandbox-api.ingrammicro.com',
  'https://api-sandbox.ingrammicro.com',
  'https://apigtwb2c.us.dell.com/sandbox/ingrammicro', // Sometimes sandbox is on different domain
];

async function testURL(baseUrl) {
  console.log(`\n🔧 Testing: ${baseUrl}`);

  try {
    const tokenUrl = `${baseUrl}/oauth/oauth20/token`;
    const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const authResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${authString}`,
      },
      body: 'grant_type=client_credentials',
    });

    console.log(`  Status: ${authResponse.status} ${authResponse.statusText}`);

    if (authResponse.ok) {
      const authData = await authResponse.json();
      console.log(`✅ SUCCESS! This is the correct URL: ${baseUrl}`);
      console.log(`  Access Token: ${authData.access_token.substring(0, 30)}...`);
      return true;
    } else {
      const errorText = await authResponse.text();
      console.log(`  ❌ Error: ${errorText.substring(0, 200)}`);
      return false;
    }
  } catch (error) {
    console.log(`  ❌ Connection Failed: ${error.message}`);
    return false;
  }
}

async function findCorrectURL() {
  console.log('🔍 Searching for correct Ingram Micro Sandbox URL...\n');
  console.log('Credentials:');
  console.log(`  Customer: ${customerNumber}`);
  console.log(`  Client ID: ${clientId}`);
  console.log('=====================================');

  for (const url of urlsToTry) {
    const success = await testURL(url);
    if (success) {
      console.log('\n✅ Found the correct sandbox URL!');
      console.log(`   Update your credentials in the database to use: ${url}`);
      return;
    }
  }

  console.log('\n❌ None of the sandbox URLs worked.');
  console.log('\n💡 Troubleshooting Tips:');
  console.log('   1. Check Ingram Micro developer docs for the correct sandbox URL');
  console.log('   2. Verify your sandbox app is active in the Ingram Micro developer portal');
  console.log('   3. Make sure your Client ID and Secret are for sandbox, not production');
  console.log('   4. Contact Ingram Micro support to verify your sandbox credentials');
  console.log('\n📚 Ingram Micro Developer Portal: https://developer.ingrammicro.com/');
}

findCorrectURL();
