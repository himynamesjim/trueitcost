/**
 * Quick database verification script
 * Run: node verify-db-setup.js
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifySetup() {
  console.log('🔍 Verifying vendor catalog database setup...\n');

  try {
    // Check vendors table
    console.log('1. Checking vendors table...');
    const { data: vendors, error: vendorsError } = await supabase
      .from('vendors')
      .select('name, slug, ingram_vendor_code, is_active')
      .order('name');

    if (vendorsError) {
      console.error('❌ Vendors table error:', vendorsError.message);
      return;
    }

    console.log(`✅ Found ${vendors.length} vendors:`);
    vendors.forEach(v => {
      console.log(`   - ${v.name} (${v.slug}) | Ingram: ${v.ingram_vendor_code || 'N/A'} | Active: ${v.is_active}`);
    });

    // Check products table
    console.log('\n2. Checking products table...');
    const { count: productCount, error: productsError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (productsError) {
      console.error('❌ Products table error:', productsError.message);
      return;
    }

    console.log(`✅ Products table exists (${productCount || 0} products currently)`);

    // Check distributor_credentials table
    console.log('\n3. Checking distributor_credentials table...');
    const { data: creds, error: credsError } = await supabase
      .from('distributor_credentials')
      .select('distributor_name, customer_number, environment, is_active');

    if (credsError) {
      console.error('❌ Credentials table error:', credsError.message);
      return;
    }

    if (creds && creds.length > 0) {
      console.log(`✅ Found ${creds.length} credential(s):`);
      creds.forEach(c => {
        console.log(`   - ${c.distributor_name} | Customer: ${c.customer_number} | Env: ${c.environment} | Active: ${c.is_active}`);
      });
    } else {
      console.log('⚠️  No credentials configured yet');
    }

    // Check product_categories table
    console.log('\n4. Checking product_categories table...');
    const { data: categories, error: categoriesError } = await supabase
      .from('product_categories')
      .select('name, slug')
      .order('name');

    if (categoriesError) {
      console.error('❌ Categories table error:', categoriesError.message);
      return;
    }

    console.log(`✅ Found ${categories.length} product categories:`);
    categories.forEach(c => {
      console.log(`   - ${c.name} (${c.slug})`);
    });

    console.log('\n✅ Database setup verified successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Navigate to http://localhost:3000/vendors');
    console.log('   2. Click "API Settings" button');
    console.log('   3. Enter your Ingram Micro credentials:');
    console.log('      - Customer Number: 21-162272');
    console.log('      - Client ID: LHUjAYoW76ibNgw2kIZS44emCsX2khnQ');
    console.log('      - Client Secret: Gw4aP09RMhkg06OG');
    console.log('      - Environment: sandbox');
    console.log('   4. Click "Sync Catalog" on any vendor to test');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

verifySetup();
