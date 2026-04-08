/**
 * Test Ingram Micro authentication with Secret Key instead of Client Secret
 * Run: node test-with-secret-key.js
 */

const CREDENTIALS = {
  customer_number: '21-162272',
  client_id: 'LHUjAYoW76lbNgw2klZS44emCsX2khnQ',
  client_secret: 'Gw4aP09RMhkg06OG',
  secret_key: 'r6W8Zujzx2OsMDucdilx7fdTgWXLWTFO', // From screenshot
};

console.log('🧪 Testing Ingram Micro Authentication\n');
console.log('Testing two approaches:\n');

async function testWithClientSecret() {
  console.log('1️⃣  Testing with Client Secret (Gw4aP09RMhkg06OG)');

  const authString = Buffer.from(
    `${CREDENTIALS.client_id}:${CREDENTIALS.client_secret}`
  ).toString('base64');

  const tokenUrl = 'https://api.ingrammicro.com/oauth/oauth20/token';

  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${authString}`,
      },
      body: 'grant_type=client_credentials',
    });

    console.log(`   Status: ${response.status}`);

    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ SUCCESS with Client Secret!`);
      console.log(`   Token: ${data.access_token.substring(0, 30)}...`);
      return true;
    } else {
      const errorText = await response.text();
      console.log(`   ❌ Failed: ${errorText.substring(0, 100)}\n`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
    return false;
  }
}

async function testWithSecretKey() {
  console.log('2️⃣  Testing with Secret Key (r6W8Zujzx2OsMDucdilx7fdTgWXLWTFO)');

  const authString = Buffer.from(
    `${CREDENTIALS.client_id}:${CREDENTIALS.secret_key}`
  ).toString('base64');

  const tokenUrl = 'https://api.ingrammicro.com/oauth/oauth20/token';

  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${authString}`,
      },
      body: 'grant_type=client_credentials',
    });

    console.log(`   Status: ${response.status}`);

    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ SUCCESS with Secret Key!`);
      console.log(`   Token: ${data.access_token.substring(0, 30)}...`);
      return true;
    } else {
      const errorText = await response.text();
      console.log(`   ❌ Failed: ${errorText.substring(0, 100)}\n`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
    return false;
  }
}

async function runTests() {
  const result1 = await testWithClientSecret();
  await new Promise(resolve => setTimeout(resolve, 1000));
  const result2 = await testWithSecretKey();

  console.log('='.repeat(60));
  if (result1 || result2) {
    console.log('\n✅ Found working authentication method!');
    if (result1) console.log('   Use: Client Secret (Gw4aP09RMhkg06OG)');
    if (result2) console.log('   Use: Secret Key (r6W8Zujzx2OsMDucdilx7fdTgWXLWTFO)');
  } else {
    console.log('\n❌ Both methods failed.');
    console.log('\n💡 Next step: Click "Send Test Event" in the Ingram portal');
    console.log('   This will verify your app is fully activated.');
  }
}

runTests();
