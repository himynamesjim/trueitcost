# Quick Start - Ingram Micro Integration

## Your Credentials

### ⏳ Sandbox App (Currently In Review)
Your sandbox app **21-162272-SandboxApp** is currently "In Review" status in the Ingram Micro Developer Portal. Once approved, use:

- **Customer Number**: `21-162272`
- **Client ID**: `LHUjAYoW76ibNgw2kIZS44emCsX2khnQ`
- **Client Secret**: `Gw4aP09RMhkg06OG`
- **Environment**: Sandbox
- **Base URL**: `https://api.ingrammicro.com:443/sandbox`

### ✅ Production App (Recommended - Create This Now)
For immediate access, create a production app in the [Ingram Micro Developer Portal](https://developer.ingrammicro.com/):

1. Click **"+ Add Production App"**
2. Select **Product Catalog v6** from the API list
3. Provide your Ingram Micro Sales/Account Manager email
4. Wait for approval (up to 48 hours)
5. Once approved, use these settings:
   - **Environment**: Production
   - **Base URL**: `https://api.ingrammicro.com:443`

## Step 1: Run the Database Schema

1. Go to your Supabase Dashboard → SQL Editor
2. Copy the entire contents of `CREATE_VENDOR_CATALOG_SCHEMA.sql`
3. Paste and execute
4. You should see: "Success. No rows returned"

The schema will automatically:
- Create 6 vendors (Cisco, Microsoft, VMware, Poly, Logitech, Yealink)
- Create 8 product categories
- Set up all necessary tables and indexes
- Configure security policies

## Step 2: Configure Your API Credentials

### Option A: Via Web UI (Recommended)

1. Go to http://localhost:3000/vendors
2. Click "API Settings" button (top right)
3. Enter your credentials:
   - **Customer Number**: `21-162272` (from your screenshot)
   - **Client ID**: `LHUjAYoW76ibNgw2kIZS44emCsX2khnQ`
   - **Client Secret**: `Gw4aP09RMhkg06OG`
   - **Environment**: Sandbox
4. Click "Save Credentials"

### Option B: Direct SQL Insert

```sql
INSERT INTO distributor_credentials (
  distributor_name,
  customer_number,
  client_id,
  client_secret,
  base_url,
  environment,
  is_active
) VALUES (
  'ingram_micro',
  '21-162272',
  'LHUjAYoW76ibNgw2kIZS44emCsX2khnQ',
  'Gw4aP09RMhkg06OG',
  'https://api.ingrammicro.com',
  'sandbox',
  true
);
```

## Step 3: Test the Integration

### Test via Web Interface

1. Go to http://localhost:3000/vendors
2. Click "Sync Catalog" on any vendor (try Cisco first)
3. Wait for sync to complete
4. Check the results:
   - Products Added: X
   - Products Updated: Y
   - Errors: 0 (hopefully!)

### Test via API

```bash
# Get your session token from browser dev tools
# Then run:

curl -X POST http://localhost:3000/api/vendor-catalog/sync \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"vendorSlug": "cisco"}'
```

## Step 4: Verify Data

```sql
-- Check vendors
SELECT * FROM vendors;

-- Check if products were synced
SELECT
  v.name as vendor,
  COUNT(p.id) as product_count,
  MAX(p.last_synced_at) as last_sync
FROM vendors v
LEFT JOIN products p ON p.vendor_id = v.id
GROUP BY v.name;

-- View sample products
SELECT
  v.name as vendor,
  p.sku,
  p.name,
  p.msrp,
  p.stock_status
FROM products p
JOIN vendors v ON v.id = p.vendor_id
LIMIT 10;
```

## Important Notes About Sandbox

⚠️ **Sandbox Limitations:**
- Limited product catalog (not all products available)
- May have different data than production
- API rate limits still apply
- Some features might be simulated

## Ingram Micro API Endpoints

Your sandbox app has access to these APIs:

### 1. Catalog API
- Search products by vendor
- Get product details
- Filter by category

### 2. Price & Availability API
- Real-time pricing
- Stock availability
- Lead times

### 3. Order API (if needed later)
- Create orders
- Track shipments
- Order history

## Troubleshooting

### Error: "Authentication failed"
- ✅ Double-check Client ID and Client Secret
- ✅ Verify Customer Number is correct
- ✅ Make sure you selected "sandbox" environment

### Error: "No products found"
- ℹ️ Sandbox may have limited product catalog
- ℹ️ Try different vendor codes
- ℹ️ Check Ingram Micro developer docs for sandbox data

### Error: "Rate limit exceeded"
- ⏱️ Wait 60 minutes before retrying
- 📊 Sandbox typically has lower rate limits than production

## Next Steps

1. ✅ Run database schema
2. ✅ Configure credentials
3. ✅ Sync your first vendor
4. 📧 Contact Ingram Micro rep to get production credentials
5. 🔄 Switch to production environment
6. 📅 Set up automated weekly syncs

## Getting Production Credentials

When ready to move to production:

1. Contact your Ingram Micro account rep
2. Request production API access
3. They'll provide:
   - Production Customer Number
   - Production Client ID/Secret
   - Production API base URL
4. Update credentials in the UI to use "production" environment

## Support Resources

- **Ingram Micro Developer Portal**: https://developer.ingrammicro.com/
- **API Documentation**: Check developer portal for latest docs
- **Sandbox App**: 21-162272-SandboxApp (full access to all APIs)

---

**Ready to start?** Run the SQL schema and configure your credentials!
