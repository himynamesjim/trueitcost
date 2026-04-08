# Ingram Micro Production App Setup Checklist

Use this checklist when creating your production app in the Ingram Micro Developer Portal.

## 📋 Pre-Requisites

- [ ] You have an Ingram Micro reseller account
- [ ] You can log into https://developer.ingrammicro.com/
- [ ] You know your Ingram Micro Sales/Account Manager's email
- [ ] Your dev server is running at http://localhost:3000
- [ ] You've run the database schema (vendors table exists)
- [ ] You're set as an admin user (can see sync buttons on /vendors page)

## 🚀 Step-by-Step Production App Creation

### Step 1: Access Developer Portal
- [ ] Go to https://developer.ingrammicro.com/
- [ ] Log in with your Ingram Micro credentials
- [ ] Navigate to "My Apps" section

### Step 2: Create Production App
- [ ] Click **"+ Add Production App"** button
- [ ] You'll see a form titled "Create a production app"

### Step 3: Fill Out App Details
- [ ] **App Name**: Enter something descriptive
  - Example: `TrueITCost-Production`
  - Format: `21-162272-[YourAppName]`

- [ ] **App Description**: Explain the purpose
  - Example: "Product catalog integration for TrueITCost pricing tool. Syncs vendor SKUs and MSRP pricing for quote generation."

### Step 4: Select API Products
Under "API Catalog", check the following:

**Required:**
- [ ] ✅ **Product Catalog v6**

**Optional (for future features):**
- [ ] Order Management v6 (if you'll process orders)
- [ ] Quote Management v6 (if you'll generate quotes)
- [ ] Invoice Management v6 (if you'll track invoices)

**Important**: Don't select deprecated v5 APIs - they're being phased out.

### Step 5: Provide Contact Information
- [ ] **Ingram Micro Sales/Account Manager Email ID**:
  - Enter your rep's email address
  - This is required for production API approval
  - If you don't know it, contact your Ingram Micro account team

### Step 6: Submit Application
- [ ] Review all information
- [ ] Click **"Submit"** or **"Create App"** button
- [ ] Note the approval message: "Approval may take up to 48 hours"

### Step 7: Wait for Approval
- [ ] Check your email for approval notification
- [ ] Typical wait time: 24-48 hours
- [ ] If no response after 48 hours, contact your Ingram Micro rep

## ✅ After Approval

### Step 1: Get Your Credentials
Once approved, you'll see your app in "My Apps":

- [ ] Click on your production app name
- [ ] Copy the **Client ID** (long alphanumeric string)
- [ ] Copy the **Client Secret** (long alphanumeric string)
- [ ] Note the **Customer Number** (format: `21-XXXXXX`)

### Step 2: Configure in Your Application
- [ ] Go to http://localhost:3000/vendors
- [ ] Click **"API Settings"** button (top right)
- [ ] Fill in the modal:

```
Customer Number: [Your customer number from portal]
Client ID: [Your Client ID from approved app]
Client Secret: [Your Client Secret from approved app]
Base URL: https://api.ingrammicro.com:443
Environment: production
```

- [ ] Click **"Save Credentials"**
- [ ] Close the modal

### Step 3: Test the Connection
- [ ] Click **"Sync Catalog"** on the **Cisco** vendor card
- [ ] Wait 30-60 seconds
- [ ] Check sync status:
  - ✅ Status should change to "completed"
  - ✅ Products Added should be > 0
  - ✅ Errors should be 0

### Step 4: Verify Data
- [ ] Go to Supabase Dashboard
- [ ] Open SQL Editor
- [ ] Run this query:

```sql
-- Check products were synced
SELECT
  v.name as vendor,
  COUNT(p.id) as product_count,
  MAX(p.last_synced_at) as last_sync
FROM vendors v
LEFT JOIN products p ON p.vendor_id = v.id
GROUP BY v.id, v.name
ORDER BY v.name;
```

- [ ] Verify Cisco has products (should show count > 0)

## 🎉 Success Criteria

You'll know everything is working when:

- [x] Production app shows "Active" status in portal
- [x] API Settings modal saves without errors
- [x] Sync completes with "Products Added" > 0
- [x] Database shows products for synced vendor
- [x] Sync log shows "completed" status with timestamp

## 🔍 Troubleshooting

### App Still Showing "In Review" After 48 Hours
**Solution**:
- Contact your Ingram Micro Sales/Account Manager
- Reference your app name and customer number
- Ask them to expedite the approval

### "Invalid client identifier" Error After Approval
**Solution**:
- Double-check you copied Client ID exactly (no extra spaces)
- Verify you're using the production app's credentials, not sandbox
- Make sure the app status is "Active" not "In Review"

### "406 Not Acceptable" Error
**Solution**:
- Verify Customer Number matches your approved app
- Check that you selected "production" environment
- Ensure Base URL is exactly: `https://api.ingrammicro.com:443`

### Sync Completes But No Products
**Solution**:
- Check the vendor has an Ingram vendor code (see vendors table)
- Verify the vendor code is correct for Ingram Micro
- Try a different vendor (Cisco should always have products)

### "Only administrators can sync" Error
**Solution**:
- Run the `set-admin.js` script to grant yourself admin access
- Or run this SQL in Supabase:
```sql
UPDATE user_profiles
SET is_admin = true
WHERE user_id = '[your-user-id]';
```

## 📞 Support Contacts

**Ingram Micro Developer Support**:
- Portal: https://developer.ingrammicro.com/
- Documentation: https://developer.ingrammicro.com/reseller/getting-started
- Status: https://status.ingrammicro.com/

**Your Sales/Account Manager**:
- Name: _____________________
- Email: _____________________
- Phone: _____________________

## 📝 Notes Section

Use this space to track your progress:

```
Date Started: __________
App Name Created: __________
Approval Date: __________
Client ID (first 10 chars): __________
Customer Number: __________
First Successful Sync: __________
```

---

**Last Updated**: March 31, 2026
