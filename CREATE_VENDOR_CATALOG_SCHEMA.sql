-- Vendor Catalog Database Schema
-- This schema supports pulling vendor catalogs from distributors like Ingram Micro

-- 1. Vendors table - Master list of vendors/manufacturers
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL, -- e.g., 'cisco', 'microsoft', 'vmware'
  logo_url TEXT,
  website_url TEXT,
  is_active BOOLEAN DEFAULT true,
  ingram_vendor_code VARCHAR(50), -- Ingram Micro's vendor identifier
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Product categories table
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL, -- e.g., 'networking', 'collaboration', 'security'
  description TEXT,
  parent_id UUID REFERENCES product_categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Products table - The main catalog
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,

  -- Product identifiers
  sku VARCHAR(255) NOT NULL,
  manufacturer_part_number VARCHAR(255),
  upc_code VARCHAR(50),
  vendor_sku VARCHAR(255), -- Vendor's internal SKU

  -- Product information
  name TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  specifications JSONB, -- Store detailed specs as JSON

  -- Pricing
  msrp DECIMAL(12, 2), -- Manufacturer's Suggested Retail Price
  list_price DECIMAL(12, 2), -- List/catalog price
  cost_price DECIMAL(12, 2), -- Your cost (if available)
  currency VARCHAR(3) DEFAULT 'USD',

  -- Inventory/Availability
  stock_status VARCHAR(50), -- 'in_stock', 'out_of_stock', 'discontinued', etc.
  availability_date DATE,
  lead_time_days INTEGER,

  -- Metadata
  data_source VARCHAR(50) DEFAULT 'ingram_micro', -- 'ingram_micro', 'manual', 'api', etc.
  external_id VARCHAR(255), -- ID from external system (e.g., Ingram's product ID)
  is_active BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Indexes for fast searching
  CONSTRAINT unique_vendor_sku UNIQUE(vendor_id, sku)
);

-- 4. Price history table - Track price changes over time
CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  msrp DECIMAL(12, 2),
  list_price DECIMAL(12, 2),
  cost_price DECIMAL(12, 2),
  effective_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Catalog sync logs - Track sync operations
CREATE TABLE IF NOT EXISTS catalog_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  sync_type VARCHAR(50), -- 'manual', 'scheduled', 'automatic'
  status VARCHAR(50), -- 'started', 'in_progress', 'completed', 'failed'

  -- Sync statistics
  products_added INTEGER DEFAULT 0,
  products_updated INTEGER DEFAULT 0,
  products_removed INTEGER DEFAULT 0,
  errors_count INTEGER DEFAULT 0,

  -- Timing
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,

  -- Error tracking
  error_message TEXT,
  error_details JSONB,

  -- Metadata
  triggered_by UUID REFERENCES auth.users(id),
  api_response JSONB, -- Store raw API response for debugging
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. API credentials table - Store distributor API keys securely
CREATE TABLE IF NOT EXISTS distributor_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_name VARCHAR(100) NOT NULL, -- 'ingram_micro', 'tech_data', etc.

  -- Credentials (encrypt in production!)
  customer_number VARCHAR(100),
  api_key TEXT,
  api_secret TEXT,
  client_id VARCHAR(100),
  client_secret TEXT,

  -- Configuration
  base_url TEXT,
  environment VARCHAR(20) DEFAULT 'production', -- 'sandbox', 'production'
  is_active BOOLEAN DEFAULT true,

  -- Rate limiting
  rate_limit_per_minute INTEGER DEFAULT 60,
  rate_limit_per_day INTEGER DEFAULT 10000,

  -- Metadata
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- 7. Product search index (for full-text search)
CREATE INDEX IF NOT EXISTS idx_products_search ON products
  USING GIN (to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || sku));

-- Additional indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_vendor ON products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_last_synced ON products(last_synced_at);
CREATE INDEX IF NOT EXISTS idx_price_history_product ON price_history(product_id, effective_date);
CREATE INDEX IF NOT EXISTS idx_sync_logs_vendor ON catalog_sync_logs(vendor_id, started_at);

-- Insert initial vendors
INSERT INTO vendors (name, slug, ingram_vendor_code, is_active) VALUES
  ('Cisco', 'cisco', 'CISCO', true),
  ('Microsoft', 'microsoft', 'MSFT', true),
  ('VMware', 'vmware', 'VMWARE', true),
  ('Poly', 'poly', 'POLY', true),
  ('Logitech', 'logitech', 'LOGI', true),
  ('Yealink', 'yealink', 'YEALINK', true)
ON CONFLICT (slug) DO NOTHING;

-- Insert initial product categories
INSERT INTO product_categories (name, slug) VALUES
  ('Networking', 'networking'),
  ('Collaboration', 'collaboration'),
  ('Security', 'security'),
  ('Cloud', 'cloud'),
  ('Voice/UCaaS', 'voice-ucaas'),
  ('Hardware', 'hardware'),
  ('Software', 'software'),
  ('Licenses', 'licenses')
ON CONFLICT (slug) DO NOTHING;

-- Row Level Security (RLS) Policies
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE distributor_credentials ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read vendor catalog data
CREATE POLICY "Allow authenticated users to read vendors" ON vendors
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read products" ON products
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read categories" ON product_categories
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read price history" ON price_history
  FOR SELECT TO authenticated USING (true);

-- Only admins can modify vendor catalog data
-- Note: If you don't have a user_profiles table yet, you can skip these policies
-- and grant access differently, or create the user_profiles table first

DO $$
BEGIN
  -- Check if user_profiles table exists before creating admin policies
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') THEN

    -- Create admin-only policies if user_profiles exists
    EXECUTE 'CREATE POLICY "Allow admins to manage vendors" ON vendors
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE user_profiles.user_id = auth.uid()
          AND user_profiles.is_admin = true
        )
      )';

    EXECUTE 'CREATE POLICY "Allow admins to manage products" ON products
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE user_profiles.user_id = auth.uid()
          AND user_profiles.is_admin = true
        )
      )';

    EXECUTE 'CREATE POLICY "Allow admins to read sync logs" ON catalog_sync_logs
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE user_profiles.user_id = auth.uid()
          AND user_profiles.is_admin = true
        )
      )';

    EXECUTE 'CREATE POLICY "Allow admins to manage credentials" ON distributor_credentials
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE user_profiles.user_id = auth.uid()
          AND user_profiles.is_admin = true
        )
      )';
  ELSE
    -- If user_profiles doesn't exist, allow all authenticated users for now
    -- YOU SHOULD UPDATE THESE POLICIES ONCE YOU CREATE user_profiles TABLE
    RAISE NOTICE 'user_profiles table not found. Creating temporary permissive policies.';
    RAISE NOTICE 'UPDATE THESE POLICIES after creating user_profiles table!';

    EXECUTE 'CREATE POLICY "Allow authenticated to manage vendors" ON vendors
      FOR ALL TO authenticated
      USING (true)';

    EXECUTE 'CREATE POLICY "Allow authenticated to manage products" ON products
      FOR ALL TO authenticated
      USING (true)';

    EXECUTE 'CREATE POLICY "Allow authenticated to read sync logs" ON catalog_sync_logs
      FOR SELECT TO authenticated
      USING (true)';

    EXECUTE 'CREATE POLICY "Allow authenticated to manage credentials" ON distributor_credentials
      FOR ALL TO authenticated
      USING (true)';
  END IF;
END $$;

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_distributor_credentials_updated_at BEFORE UPDATE ON distributor_credentials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
