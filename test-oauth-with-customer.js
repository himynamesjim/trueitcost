/**
 * Test OAuth with customer number in various ways
 * Some APIs require customer number in OAuth request
 * Run: node test-oauth-with-customer.js
 */

const CREDENTIALS = {
  customer_number: '21-162272',
  client_id: 'LHUjAYoW76lbNgw2klZS44emCsX2khnQ',
  client_secret: 'Gw4aP09RMhkg06OG',
};

console.log('🧪 Testing OAuth with Customer Number variations\n');

async function testStandardOAuth() {
  console.log('1️⃣  Standard OAuth (Client ID + Secret)');

  const authString = Buffer.from(
    `${CREDENTIALS.client_id}:${CREDENTIALS.client_secret}`
  ).toString('base64');

  const response = await fetch('https://api.ingrammicro.com/oauth/oauth20/token', {
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
    console.log(`   ✅ SUCCESS!\n`);
    return data.access_token;
  } else {
    const error = await response.text();
    console.log(`   ❌ Failed: ${error.substring(0, 100)}\n`);
    return null;
  }
}

async function testOAuthWithCustomerInBody() {
  console.log('2️⃣  OAuth with Customer Number in request body');

  const authString = Buffer.from(
    `${CREDENTIALS.client_id}:${CREDENTIALS.client_secret}`
  ).toString('base64');

  const response = await fetch('https://api.ingrammicro.com/oauth/oauth20/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${authString}`,
    },
    body: `grant_type=client_credentials&customer_number=${CREDENTIALS.customer_number}`,
  });

  console.log(`   Status: ${response.status}`);

  if (response.ok) {
    const data = await response.json();
    console.log(`   ✅ SUCCESS!\n`);
    return data.access_token;
  } else {
    const error = await response.text();
    console.log(`   ❌ Failed: ${error.substring(0, 100)}\n`);
    return null;
  }
}

async function testOAuthWithCustomerInHeader() {
  console.log('3️⃣  OAuth with Customer Number in header');

  const authString = Buffer.from(
    `${CREDENTIALS.client_id}:${CREDENTIALS.client_secret}`
  ).toString('base64');

  const response = await fetch('https://api.ingrammicro.com/oauth/oauth20/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${authString}`,
      'IM-CustomerNumber': CREDENTIALS.customer_number,
    },
    body: 'grant_type=client_credentials',
  });

  console.log(`   Status: ${response.status}`);

  if (response.ok) {
    const data = await response.json();
    console.log(`   ✅ SUCCESS!\n`);
    return data.access_token;
  } else {
    const error = await response.text();
    console.log(`   ❌ Failed: ${error.substring(0, 100)}\n`);
    return null;
  }
}

async function testOAuthWithCustomerAsUsername() {
  console.log('4️⃣  OAuth with Customer as username prefix');

  const authString = Buffer.from(
    `${CREDENTIALS.customer_number}:${CREDENTIALS.client_id}:${CREDENTIALS.client_secret}`
  ).toString('base64');

  const response = await fetch('https://api.ingrammicro.com/oauth/oauth20/token', {
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
    console.log(`   ✅ SUCCESS!\n`);
    return data.access_token;
  } else {
    const error = await response.text();
    console.log(`   ❌ Failed: ${error.substring(0, 100)}\n`);
    return null;
  }
}

async function testOAuthWithScope() {
  console.log('5️⃣  OAuth with scope parameter');

  const authString = Buffer.from(
    `${CREDENTIALS.client_id}:${CREDENTIALS.client_secret}`
  ).toString('base64');

  const response = await fetch('https://api.ingrammicro.com/oauth/oauth20/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${authString}`,
    },
    body: 'grant_type=client_credentials&scope=catalog',
  });

  console.log(`   Status: ${response.status}`);

  if (response.ok) {
    const data = await response.json();
    console.log(`   ✅ SUCCESS!\n`);
    return data.access_token;
  } else {
    const error = await response.text();
    console.log(`   ❌ Failed: ${error.substring(0, 100)}\n`);
    return null;
  }
}

async function runTests() {
  const results = [];

  results.push(await testStandardOAuth());
  await new Promise(r => setTimeout(r, 500));

  results.push(await testOAuthWithCustomerInBody());
  await new Promise(r => setTimeout(r, 500));

  results.push(await testOAuthWithCustomerInHeader());
  await new Promise(r => setTimeout(r, 500));

  results.push(await testOAuthWithCustomerAsUsername());
  await new Promise(r => setTimeout(r, 500));

  results.push(await testOAuthWithScope());

  console.log('='.repeat(60));

  const successful = results.filter(r => r !== null);

  if (successful.length > 0) {
    console.log('\n✅ Found working authentication!\n');
    console.log('The sync should now work. Run:');
    console.log('   node test-ingram-sync.js\n');
  } else {
    console.log('\n❌ All OAuth variations failed.\n');
    console.log('This confirms: The Client ID is not valid for OAuth.\n');
    console.log('📋 Action Required:');
    console.log('   1. In Ingram portal, look for API documentation');
    console.log('   2. Find "Try it out" or sample code section');
    console.log('   3. Look for different Client ID in code examples');
    console.log('   4. Or contact: apigateway@ingrammicro.com\n');
  }
}

runTests();
