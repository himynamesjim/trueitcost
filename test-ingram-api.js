/**
 * Test Ingram Micro API Connection
 * This will test authentication and a basic API call
 */

const customerNumber = '21-162272';
const clientId = 'LHUjAYoW76ibNgw2kIZS44emCsX2khnQ';
const clientSecret = 'Gw4aP09RMhkg06OG';
const baseUrl = 'https://api.ingrammicro.com'; // Use sandbox URL if different

async function testIngramAPI() {
  console.log('🔧 Testing Ingram Micro API Connection\n');
  console.log('Credentials:');
  console.log(`  Customer: ${customerNumber}`);
  console.log(`  Client ID: ${clientId}`);
  console.log(`  Base URL: ${baseUrl}\n`);

  try {
    // Step 1: Test Authentication
    console.log('Step 1: Testing OAuth Authentication...');
    const tokenUrl = `${baseUrl}/oauth/oauth20/token`;
    const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    console.log(`  Token URL: ${tokenUrl}`);
    console.log(`  Auth Header: Basic ${authString.substring(0, 20)}...`);

    const authResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${authString}`,
      },
      body: 'grant_type=client_credentials',
    });

    console.log(`  Response Status: ${authResponse.status} ${authResponse.statusText}`);

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.error('❌ Authentication Failed!');
      console.error(`  Error: ${errorText}`);
      return;
    }

    const authData = await authResponse.json();
    console.log('✅ Authentication Successful!');
    console.log(`  Access Token: ${authData.access_token.substring(0, 30)}...`);
    console.log(`  Token Type: ${authData.token_type}`);
    console.log(`  Expires In: ${authData.expires_in} seconds\n`);

    // Step 2: Test Catalog API
    console.log('Step 2: Testing Catalog API...');
    const catalogUrl = `${baseUrl}/resellers/v6/catalog`;

    console.log(`  Catalog URL: ${catalogUrl}`);
    console.log(`  Customer Number: ${customerNumber}`);

    const catalogResponse = await fetch(catalogUrl + '?pageSize=10', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authData.access_token}`,
        'IM-CustomerNumber': customerNumber,
        'IM-CountryCode': 'US',
        'IM-CorrelationID': `test-${Date.now()}`,
        'Accept': 'application/json',
      },
    });

    console.log(`  Response Status: ${catalogResponse.status} ${catalogResponse.statusText}`);

    if (!catalogResponse.ok) {
      const errorText = await catalogResponse.text();
      console.error('❌ Catalog API Failed!');
      console.error(`  Error: ${errorText}`);

      // Common errors
      if (catalogResponse.status === 401) {
        console.log('\n💡 Tip: Your credentials may be invalid or expired');
      } else if (catalogResponse.status === 403) {
        console.log('\n💡 Tip: Your account may not have access to the catalog API');
      } else if (catalogResponse.status === 404) {
        console.log('\n💡 Tip: The API endpoint may be incorrect for sandbox environment');
        console.log('   Try: https://api.sandbox.ingrammicro.com instead');
      } else if (catalogResponse.status === 406) {
        console.log('\n💡 Tip: The API is rejecting the request headers');
        console.log('   This often means the Customer Number or Country Code is invalid');
      }
      return;
    }

    const catalogData = await catalogResponse.json();
    console.log('✅ Catalog API Successful!');
    console.log(`  Products Found: ${catalogData.catalog?.length || 0}`);

    if (catalogData.catalog && catalogData.catalog.length > 0) {
      console.log('\n📦 Sample Product:');
      const product = catalogData.catalog[0];
      console.log(`    SKU: ${product.ingramPartNumber || 'N/A'}`);
      console.log(`    Vendor Part: ${product.vendorPartNumber || 'N/A'}`);
      console.log(`    Description: ${product.description || 'N/A'}`);
      console.log(`    Vendor: ${product.vendorName || 'N/A'}`);
    }

    console.log('\n✅ All tests passed! Your Ingram Micro API connection is working.');
    console.log('   You can now sync vendor catalogs from the /vendors page.');

  } catch (error) {
    console.error('❌ Test Failed with Exception:');
    console.error(`  ${error.message}`);

    if (error.code === 'ENOTFOUND') {
      console.log('\n💡 Tip: DNS resolution failed. Check your internet connection or try a different network.');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Tip: Connection refused. The API server may be down or the URL is incorrect.');
    }
  }
}

testIngramAPI();
