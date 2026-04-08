# Ingram Micro Sync Troubleshooting Guide

## Current Issue

The catalog sync is failing with the error:
```
Authentication failed: 500 Internal Server Error
Invalid client identifier
```

## Root Cause

Your sandbox application credentials are not being accepted by the Ingram Micro OAuth server. This typically happens when:

1. **App is still pending approval** - Even though status shows "approved", credentials may not be active yet
2. **Credentials need regeneration** - Sometimes after approval, you need to regenerate Client ID/Secret
3. **Wrong environment** - Sandbox credentials being used with production URLs (we've fixed this)
4. **Typo in credentials** - We've corrected the Client ID typo already

## What We've Fixed So Far

✅ **Base URL**: Updated from `https://api.ingrammicro.com` to `https://api.ingrammicro.com:443/sandbox`
✅ **Client ID typo**: Corrected `LHUjAYoW76lbNgw2klZS44emCsX2khnQ` → `LHUjAYoW76ibNgw2kIZS44emCsX2khnQ`
✅ **Auth endpoint**: Fixed to use root `/oauth/oauth20/token` instead of `/sandbox/oauth/oauth20/token`

## Current Credentials in Database

- **Customer Number**: 21-162272
- **Client ID**: LHUjAYoW76ibNgw2kIZS44emCsX2khnQ
- **Client Secret**: Gw4aP09RMhkg06OG
- **Base URL**: https://api.ingrammicro.com:443/sandbox
- **Environment**: sandbox

## Next Steps to Try

### Option 1: Check Ingram Micro Developer Portal

1. Go to https://developer.ingrammicro.com/
2. Log into your account
3. Navigate to "My Apps" → "21-162272-SandboxApp"
4. Check the app status:
   - If still "In Review": Wait for approval email
   - If "Approved": Continue to step 5
5. Click "View Credentials" or "Regenerate"
6. **Copy the EXACT credentials shown** (especially Client ID - case sensitive!)
7. Update credentials in TrueITCost:
   - Go to http://localhost:3000/vendors
   - Click "API Settings"
   - Paste the new credentials
   - Select "Sandbox" environment
   - Click "Save Credentials"

### Option 2: Create a Production App

If sandbox approval is taking too long, you can create a production app:

1. Go to https://developer.ingrammicro.com/
2. Click "Create New App"
3. Choose "Production" environment
4. Fill in app details
5. Submit for approval
6. Once approved, use those credentials with "Production" environment

### Option 3: Test with Different Credentials Format

Some Ingram Micro implementations require credentials in different formats. Try:

1. Check if Client ID should have additional prefixes/suffixes
2. Verify the Client Secret hasn't changed
3. Try with port 443 vs without: `https://api.ingrammicro.com/sandbox` vs `https://api.ingrammicro.com:443/sandbox`

## Verification Steps

After updating credentials, run these tests:

### Test 1: Verify Credentials Saved
```bash
node test-ingram-sync.js
```

Look for:
- ✅ "Credentials found"
- ✅ "Authentication successful"
- ✅ "Catalog API successful"

### Test 2: Try Sync from UI

1. Go to http://localhost:3000/vendors
2. Click "Sync Catalog" on any vendor (e.g., Cisco)
3. Check for success message

### Test 3: Check Sync Logs

Query the database to see detailed errors:
```sql
SELECT * FROM catalog_sync_logs ORDER BY started_at DESC LIMIT 5;
```

## Common Ingram Micro Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Invalid client identifier` | Client ID is wrong or inactive | Regenerate credentials in portal |
| `Invalid client credentials` | Client Secret is wrong | Copy exact secret from portal |
| `403 Forbidden` | App doesn't have API access | Request catalog API access in portal |
| `404 Not Found` | Wrong base URL | Use correct URL for sandbox/production |
| `401 Unauthorized` | Token expired | Authentication will auto-retry |

## Contact Ingram Micro Support

If issues persist:

- **Email**: apigateway@ingrammicro.com
- **Phone**: 1-800-456-8000 (mention API Developer support)
- **Portal**: https://developer.ingrammicro.com/support

Provide them with:
- Your customer number: 21-162272
- App name: 21-162272-SandboxApp
- Error message: "Invalid client identifier"
- What you're trying to do: "Sync product catalog via API"

## Alternative: Manual Import

While waiting for API access, you can:

1. Download product catalog from Ingram Micro portal
2. Export as CSV
3. Import into TrueITCost database manually

We can build a CSV import feature if needed!

## System Architecture

For reference, here's how the sync works:

```
User clicks "Sync Catalog"
       ↓
/api/vendor-catalog/sync
       ↓
IngramMicroService.syncVendorCatalog()
       ↓
1. Load credentials from DB
2. Authenticate with OAuth
3. Call catalog API
4. Parse products
5. Insert/update in DB
6. Log results
```

The failure is happening at **step 2 (Authentication)**.

## Files Created for Troubleshooting

- `test-ingram-sync.js` - Diagnostic test script
- `update-ingram-credentials.js` - Update credentials helper
- `fix-sandbox-url.js` - Fix base URL helper
- `INGRAM_MICRO_TROUBLESHOOTING.md` - This guide

## Summary

**The sync is failing because the Ingram Micro API is rejecting your Client ID during OAuth authentication.**

**Most likely solution**: Go to the Ingram Micro developer portal and regenerate your credentials, then update them in the TrueITCost admin panel.

**Built with Claude Code** 🤖
