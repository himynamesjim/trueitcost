/**
 * Test Ingram Micro API with correct sandbox path
 * According to docs: sandbox uses /sandbox path, not different domain
 */

const customerNumber = '21-162272';
const clientId = 'LHUjAYoW76ibNgw2kIZS44emCsX2khnQ';
const clientSecret = 'Gw4aP09RMhkg06OG';

// Correct sandbox base URL from documentation
const baseUrl = 'https://api.ingrammicro.com:443/sandbox';

async function testIngramAPI() {
  console.log('🔧 Testing Ingram Micro Sandbox API\n');
  console.log('Configuration:');
  console.log(`  Base URL: ${baseUrl}`);
  console.log(`  Customer: ${customerNumber}`);
  console.log(`  Client ID: ${clientId}\n`);

  try {
    // Step 1: Test Authentication
    console.log('Step 1: OAuth Authentication');
    console.log('------------------------------------------');

    // Note: OAuth endpoint might still be at root, not /sandbox
    const tokenUrl = 'https://api.ingrammicro.com:443/oauth/oauth20/token';
    const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    console.log(`Token URL: ${tokenUrl}`);

    const authResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${authString}`,
      },
      body: 'grant_type=client_credentials',
    });

    console.log(`Response: ${authResponse.status} ${authResponse.statusText}\n`);

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.error('❌ Authentication Failed!');
      console.error('Response:', errorText);
      console.error('\n💡 This means your Client ID or Client Secret is incorrect.');
      console.error('   Please verify them in the Ingram Micro Developer Portal:');
      console.error('   https://developer.ingrammicro.com/');
      return;
    }

    const authData = await authResponse.json();
    console.log('✅ Authentication Successful!');
    console.log(`Access Token: ${authData.access_token.substring(0, 40)}...`);
    console.log(`Expires In: ${authData.expires_in} seconds\n`);

    // Step 2: Test Catalog API with sandbox path
    console.log('Step 2: Testing Catalog API (Sandbox)');
    console.log('------------------------------------------');

    const catalogUrl = `${baseUrl}/resellers/v6/catalog`;
    console.log(`Catalog URL: ${catalogUrl}`);

    const catalogResponse = await fetch(catalogUrl + '?pageSize=5', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authData.access_token}`,
        'IM-CustomerNumber': customerNumber,
        'IM-CountryCode': 'US',
        'IM-CorrelationID': `test-${Date.now()}`,
        'Accept': 'application/json',
      },
    });

    console.log(`Response: ${catalogResponse.status} ${catalogResponse.statusText}\n`);

    if (!catalogResponse.ok) {
      const errorText = await catalogResponse.text();
      console.error('❌ Catalog API Failed!');
      console.error('Response:', errorText.substring(0, 500));

      if (catalogResponse.status === 406) {
        console.error('\n💡 406 Not Acceptable Error:');
        console.error('   This usually means the IM-CustomerNumber is invalid for sandbox.');
        console.error(`   Your Customer Number: ${customerNumber}`);
        console.error('   Check if this is the correct sandbox customer number.');
      }
      return;
    }

    const catalogData = await catalogResponse.json();
    console.log('✅ Catalog API Successful!');
    console.log(`Products in response: ${catalogData.catalog?.length || 0}`);

    if (catalogData.catalog && catalogData.catalog.length > 0) {
      console.log('\n📦 Sample Products:');
      catalogData.catalog.slice(0, 3).forEach((product, index) => {
        console.log(`\n${index + 1}. ${product.description || 'Unnamed Product'}`);
        console.log(`   Ingram SKU: ${product.ingramPartNumber || 'N/A'}`);
        console.log(`   Vendor: ${product.vendorName || 'N/A'}`);
        console.log(`   Vendor Part: ${product.vendorPartNumber || 'N/A'}`);
      });
    }

    console.log('\n✅ SUCCESS! Your Ingram Micro API is fully configured.');
    console.log('   You can now sync catalogs from the /vendors page.');
    console.log(`\n📝 Use this Base URL in your database: ${baseUrl}`);

  } catch (error) {
    console.error('❌ Test Failed:');
    console.error(`   ${error.message}`);

    if (error.code === 'ENOTFOUND') {
      console.error('\n💡 DNS Error: Cannot reach api.ingrammicro.com');
      console.error('   Check your internet connection.');
    }
  }
}

testIngramAPI();
