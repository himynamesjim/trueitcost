# Vendor Catalog System - Setup Guide

## Overview

This system allows you to automatically sync vendor product catalogs (SKUs and MSRP pricing) from Ingram Micro for vendors like Cisco, Microsoft, VMware, Poly, Logitech, and Yealink.

## Architecture

- **Database**: PostgreSQL with comprehensive schema for products, vendors, pricing, and sync logs
- **API Integration**: Ingram Micro API via OAuth 2.0
- **Admin Interface**: Web-based management on `/vendors` page
- **Product Search**: `/pricing-guide` page for end-user product lookup

---

## Step 1: Database Setup

### Run the SQL Schema

Execute the SQL file to create all necessary tables:

```bash
# Option 1: Via Supabase Dashboard
# 1. Go to https://supabase.com/dashboard
# 2. Select your project
# 3. Go to SQL Editor
# 4. Copy contents of CREATE_VENDOR_CATALOG_SCHEMA.sql
# 5. Execute the SQL

# Option 2: Via psql
psql your_database_url -f CREATE_VENDOR_CATALOG_SCHEMA.sql
```

### What Gets Created

- **vendors** - Master list of manufacturers (Cisco, Microsoft, VMware, Poly, Logitech, Yealink)
- **products** - Product catalog with SKUs, pricing, descriptions
- **product_categories** - Product classifications (Networking, Security, etc.)
- **price_history** - Historical pricing data
- **catalog_sync_logs** - Sync operation tracking
- **distributor_credentials** - Secure API credential storage

---

## Step 2: Get Ingram Micro API Access

### Register for API Access

1. **Contact Your Ingram Micro Rep**
   - Tell them you need API access for your customer account
   - Request access to the "Catalog API" and "Price & Availability API"

2. **Register at Developer Portal**
   - Go to: https://developer.ingrammicro.com/
   - Create an account or log in
   - Register a new application

3. **Obtain Credentials**
   You'll need three pieces of information:
   - **Customer Number**: Your Ingram Micro customer account number
   - **Client ID**: From the developer portal
   - **Client Secret**: From the developer portal

4. **Choose Environment**
   - **Sandbox**: For testing (limited data)
   - **Production**: For real data

---

## Step 3: Configure API Credentials

### Via Web Interface (Recommended)

1. Log in to TrueITCost as an admin
2. Navigate to `/vendors` page
3. Click "API Settings" button (top right)
4. Enter your Ingram Micro credentials:
   - Customer Number
   - Client ID
   - Client Secret
   - Environment (production or sandbox)
5. Click "Save Credentials"

### Via Database (Alternative)

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
  'YOUR_CUSTOMER_NUMBER',
  'YOUR_CLIENT_ID',
  'YOUR_CLIENT_SECRET',
  'https://api.ingrammicro.com',
  'production',
  true
);
```

---

## Step 4: Sync Vendor Catalogs

### Via Web Interface

1. Go to `/vendors` page
2. For each vendor card:
   - Click "Sync Catalog" button
   - Wait for sync to complete (may take 1-5 minutes per vendor)
   - View sync results (products added/updated)

3. Or sync all vendors at once:
   - Click "Sync All Vendors" button (top right)
   - Wait for all syncs to complete

### Via API

```bash
# Sync single vendor
curl -X POST http://localhost:3000/api/vendor-catalog/sync \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"vendorSlug": "cisco"}'

# Sync all vendors
curl -X POST http://localhost:3000/api/vendor-catalog/sync \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"vendorSlug": "all"}'
```

---

## Step 5: Verify Data

### Check Synced Products

```sql
-- Count products per vendor
SELECT
  v.name,
  COUNT(p.id) as product_count,
  MAX(p.last_synced_at) as last_sync
FROM vendors v
LEFT JOIN products p ON p.vendor_id = v.id
GROUP BY v.name
ORDER BY product_count DESC;

-- View sample products
SELECT
  v.name as vendor,
  p.sku,
  p.name as product_name,
  p.msrp,
  p.stock_status
FROM products p
JOIN vendors v ON v.id = p.vendor_id
LIMIT 10;
```

### Check Sync Logs

```sql
-- View recent sync operations
SELECT
  v.name as vendor,
  l.status,
  l.products_added,
  l.products_updated,
  l.errors_count,
  l.duration_seconds,
  l.completed_at
FROM catalog_sync_logs l
JOIN vendors v ON v.id = l.vendor_id
ORDER BY l.started_at DESC
LIMIT 20;
```

---

## Step 6: Enable Product Search

The pricing guide page (`/pricing-guide`) can now search synced products:

```typescript
// Example: Search for Cisco switches
const response = await fetch('/api/vendor-catalog/products?search=switch&vendor=cisco');
const { products, pagination } = await response.json();
```

---

## Vendor-Specific Setup

### Cisco (ingram_vendor_code: CISCO)
- Products: Networking, Security, Collaboration
- Categories: Switches, Routers, Firewalls, Unified Communications

### Microsoft (ingram_vendor_code: MSFT)
- Products: Software licenses, Cloud services
- Categories: Microsoft 365, Azure, Windows, Office

### VMware (ingram_vendor_code: VMWARE)
- Products: Virtualization software
- Categories: vSphere, vSAN, NSX, Cloud Foundation

### Poly (ingram_vendor_code: POLY)
- Products: Audio/video conferencing
- Categories: Headsets, Conference phones, Cameras

### Logitech (ingram_vendor_code: LOGI)
- Products: Peripherals, Meeting room solutions
- Categories: Webcams, Keyboards, Conference equipment

### Yealink (ingram_vendor_code: YEALINK)
- Products: VoIP phones, Video conferencing
- Categories: IP Phones, Conference systems

---

## Maintenance & Scheduling

### Recommended Sync Frequency

- **Real-time**: Not practical (API rate limits)
- **Daily**: Good for pricing updates
- **Weekly**: Good for catalog changes
- **Monthly**: Minimum recommended

### Set Up Automated Syncs

#### Option 1: Cron Job

```bash
# Add to crontab - sync daily at 2 AM
0 2 * * * curl -X POST http://your-domain.com/api/vendor-catalog/sync \
  -H "Authorization: Bearer YOUR_SERVICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"vendorSlug": "all"}'
```

#### Option 2: Vercel Cron (if using Vercel)

```json
// vercel.json
{
  "crons": [{
    "path": "/api/vendor-catalog/sync",
    "schedule": "0 2 * * *"
  }]
}
```

#### Option 3: Supabase pg_cron

```sql
-- Schedule daily sync at 2 AM
SELECT cron.schedule(
  'vendor-catalog-sync',
  '0 2 * * *',
  $$
  -- Add logic to call your sync endpoint
  $$
);
```

---

## Troubleshooting

### Error: "Credentials not found"
**Solution**: Configure Ingram Micro credentials in `/vendors` → "API Settings"

### Error: "Authentication failed"
**Solutions**:
- Verify Client ID and Client Secret are correct
- Check if Customer Number matches your Ingram account
- Ensure API access is enabled on your Ingram Micro account

### Error: "Rate limit exceeded"
**Solutions**:
- Wait 60 minutes before retrying
- Sync vendors individually instead of all at once
- Contact Ingram Micro to increase rate limits

### No products synced
**Solutions**:
- Check that vendor has an `ingram_vendor_code` configured
- Verify the vendor code matches Ingram Micro's system
- Check sync logs for specific error messages
- Ensure you have access to that vendor's products through Ingram

### Products missing pricing
**Possible Causes**:
- Product not available in your region
- Pricing requires special agreement with vendor
- Product is discontinued or end-of-life

---

## Security Best Practices

1. **Encrypt API Credentials**
   - Use environment variables for sensitive data
   - Consider using a secrets manager (AWS Secrets Manager, HashiCorp Vault)

2. **Restrict Admin Access**
   - Only admin users can sync catalogs
   - Verify `is_admin` flag in `user_profiles` table

3. **Monitor Sync Logs**
   - Review errors regularly
   - Set up alerts for failed syncs

4. **Secure API Endpoints**
   - All endpoints require authentication
   - Use HTTPS in production

---

## API Endpoints Reference

### POST /api/vendor-catalog/sync
Trigger a catalog sync

**Headers:**
- Authorization: Bearer {token}
- Content-Type: application/json

**Body:**
```json
{
  "vendorSlug": "cisco" // or "all"
}
```

### GET /api/vendor-catalog/products
Search products

**Query Params:**
- search: Search term
- vendor: Vendor slug
- category: Category slug
- page: Page number
- limit: Items per page

### POST /api/vendor-catalog/credentials
Save API credentials (admin only)

**Body:**
```json
{
  "distributorName": "ingram_micro",
  "customerNumber": "...",
  "clientId": "...",
  "clientSecret": "...",
  "baseUrl": "https://api.ingrammicro.com",
  "environment": "production"
}
```

---

## Next Steps

1. **Enhance Product Display**
   - Update `/pricing-guide` to show synced products
   - Add filtering by vendor, category, price range
   - Implement comparison features

2. **Add More Distributors**
   - Tech Data API integration
   - Synnex/TD SYNNEX API
   - Direct vendor APIs where available

3. **Price Tracking**
   - Monitor price changes over time
   - Alert on significant price drops
   - Show price trends in UI

4. **Inventory Integration**
   - Real-time stock levels
   - Lead time tracking
   - Backorder notifications

---

## Support

For issues or questions:
1. Check the [Ingram Micro Developer Docs](https://developer.ingrammicro.com/)
2. Review sync logs in database: `catalog_sync_logs` table
3. Check API error messages in console/logs
4. Contact your Ingram Micro account rep for API support

---

## Files Created

```
/src/lib/ingram-micro.ts                          - API integration service
/src/app/api/vendor-catalog/sync/route.ts         - Sync endpoint
/src/app/api/vendor-catalog/products/route.ts     - Product search endpoint
/src/app/api/vendor-catalog/credentials/route.ts  - Credentials management
/src/app/vendors/page.tsx                         - Admin UI
CREATE_VENDOR_CATALOG_SCHEMA.sql                  - Database schema
VENDOR_CATALOG_SETUP.md                           - This guide
```
