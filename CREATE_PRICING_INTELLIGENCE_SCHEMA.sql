-- Pricing Intelligence System Database Schema
-- Stores pricing guides, trends, market insights, and scraping jobs

-- ============================================================================
-- PRICING GUIDES
-- ============================================================================

-- Main pricing guide table with market averages
CREATE TABLE IF NOT EXISTS pricing_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Product identification
  product_category_id UUID REFERENCES product_categories(id),
  vendor_id UUID REFERENCES vendors(id),
  product_name TEXT NOT NULL,
  sku TEXT,
  description TEXT,

  -- Pricing data
  msrp DECIMAL(12,2),
  average_cost DECIMAL(12,2),
  low_price DECIMAL(12,2),
  high_price DECIMAL(12,2),
  median_price DECIMAL(12,2),
  currency TEXT DEFAULT 'USD',

  -- Market positioning
  market_position TEXT CHECK (market_position IN ('budget', 'mid-range', 'premium', 'enterprise')),
  price_tier TEXT, -- e.g., "Good, Better, Best"

  -- Confidence and sourcing
  confidence_score INTEGER CHECK (confidence_score BETWEEN 0 AND 100),
  data_sources JSONB, -- Array of source URLs and types
  source_count INTEGER DEFAULT 0,

  -- Metadata
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,

  -- Search optimization
  search_vector tsvector,

  UNIQUE(vendor_id, sku)
);

-- Indexes for pricing guides
CREATE INDEX idx_pricing_guides_category ON pricing_guides(product_category_id);
CREATE INDEX idx_pricing_guides_vendor ON pricing_guides(vendor_id);
CREATE INDEX idx_pricing_guides_sku ON pricing_guides(sku);
CREATE INDEX idx_pricing_guides_position ON pricing_guides(market_position);
CREATE INDEX idx_pricing_guides_search ON pricing_guides USING gin(search_vector);
CREATE INDEX idx_pricing_guides_active ON pricing_guides(is_active);

-- Update search vector on changes
CREATE OR REPLACE FUNCTION update_pricing_guides_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.product_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.sku, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pricing_guides_search_vector_update
  BEFORE INSERT OR UPDATE ON pricing_guides
  FOR EACH ROW
  EXECUTE FUNCTION update_pricing_guides_search_vector();

-- ============================================================================
-- PRICE SNAPSHOTS
-- ============================================================================

-- Individual price observations from various sources
CREATE TABLE IF NOT EXISTS price_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Links to pricing guide
  pricing_guide_id UUID REFERENCES pricing_guides(id) ON DELETE CASCADE,

  -- Source information
  source TEXT NOT NULL CHECK (source IN ('website', 'api', 'distributor', 'manual', 'competitor', 'marketplace')),
  source_name TEXT, -- e.g., "Ingram Micro", "CDW", "Amazon Business"
  source_url TEXT,

  -- Price data
  price DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  price_type TEXT CHECK (price_type IN ('msrp', 'list', 'street', 'quote', 'contract')),

  -- Additional context
  quantity INTEGER DEFAULT 1,
  discount_percentage DECIMAL(5,2),
  promotion_info TEXT,
  availability TEXT, -- in_stock, out_of_stock, backordered, discontinued

  -- Capture details
  captured_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  screenshot_url TEXT,
  raw_data JSONB, -- Store original scraped data

  -- Validation
  is_validated BOOLEAN DEFAULT false,
  validated_by UUID REFERENCES auth.users(id),
  validated_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for price snapshots
CREATE INDEX idx_price_snapshots_guide ON price_snapshots(pricing_guide_id);
CREATE INDEX idx_price_snapshots_source ON price_snapshots(source);
CREATE INDEX idx_price_snapshots_captured ON price_snapshots(captured_at);
CREATE INDEX idx_price_snapshots_validated ON price_snapshots(is_validated);

-- ============================================================================
-- PRICE TRENDS
-- ============================================================================

-- Calculated price trends over time
CREATE TABLE IF NOT EXISTS price_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Links to pricing guide
  pricing_guide_id UUID REFERENCES pricing_guides(id) ON DELETE CASCADE,

  -- Time period
  period TEXT NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Trend data
  trend_direction TEXT CHECK (trend_direction IN ('up', 'down', 'stable', 'volatile')),
  change_amount DECIMAL(12,2),
  change_percentage DECIMAL(7,4),

  -- Statistics
  average_price DECIMAL(12,2),
  median_price DECIMAL(12,2),
  min_price DECIMAL(12,2),
  max_price DECIMAL(12,2),
  std_deviation DECIMAL(12,2),
  sample_count INTEGER,

  -- Metadata
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  UNIQUE(pricing_guide_id, period, period_start, period_end)
);

-- Indexes for price trends
CREATE INDEX idx_price_trends_guide ON price_trends(pricing_guide_id);
CREATE INDEX idx_price_trends_period ON price_trends(period, period_start);
CREATE INDEX idx_price_trends_direction ON price_trends(trend_direction);

-- ============================================================================
-- MARKET INSIGHTS
-- ============================================================================

-- AI-generated market insights and analysis
CREATE TABLE IF NOT EXISTS market_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Scope
  product_category_id UUID REFERENCES product_categories(id),
  pricing_guide_id UUID REFERENCES pricing_guides(id),
  vendor_id UUID REFERENCES vendors(id),

  -- Insight details
  insight_type TEXT NOT NULL CHECK (insight_type IN (
    'trend', 'competition', 'demand', 'seasonality',
    'recommendation', 'risk', 'opportunity'
  )),
  title TEXT NOT NULL,
  insight_text TEXT NOT NULL,

  -- Supporting data
  supporting_data JSONB, -- Charts, statistics, comparisons
  confidence_score INTEGER CHECK (confidence_score BETWEEN 0 AND 100),

  -- AI generation details
  generated_by TEXT DEFAULT 'claude', -- Which AI model
  prompt_used TEXT,
  model_version TEXT,

  -- Metadata
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_published BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for market insights
CREATE INDEX idx_market_insights_category ON market_insights(product_category_id);
CREATE INDEX idx_market_insights_guide ON market_insights(pricing_guide_id);
CREATE INDEX idx_market_insights_type ON market_insights(insight_type);
CREATE INDEX idx_market_insights_published ON market_insights(is_published);

-- ============================================================================
-- WEB SCRAPE JOBS
-- ============================================================================

-- Track web scraping jobs for pricing data
CREATE TABLE IF NOT EXISTS web_scrape_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Target information
  target_url TEXT NOT NULL,
  target_vendor_id UUID REFERENCES vendors(id),
  scrape_type TEXT NOT NULL CHECK (scrape_type IN ('pricing', 'specs', 'availability', 'reviews', 'bulk')),

  -- Job configuration
  scrape_config JSONB, -- Selectors, filters, etc.
  schedule TEXT, -- Cron expression for recurring jobs
  priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),

  -- Execution status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'processing', 'completed', 'failed', 'cancelled'
  )),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,

  -- Results
  html_content TEXT,
  screenshot_path TEXT,
  extracted_data JSONB,

  -- Claude analysis
  claude_analysis JSONB,
  claude_tokens_used INTEGER,
  claude_cost DECIMAL(10,6),

  -- Error handling
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,

  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for web scrape jobs
CREATE INDEX idx_web_scrape_jobs_status ON web_scrape_jobs(status);
CREATE INDEX idx_web_scrape_jobs_vendor ON web_scrape_jobs(target_vendor_id);
CREATE INDEX idx_web_scrape_jobs_type ON web_scrape_jobs(scrape_type);
CREATE INDEX idx_web_scrape_jobs_created ON web_scrape_jobs(created_at);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_web_scrape_jobs_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER web_scrape_jobs_update_timestamp
  BEFORE UPDATE ON web_scrape_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_web_scrape_jobs_timestamp();

-- ============================================================================
-- PRICING ALERTS
-- ============================================================================

-- Price change alerts and notifications
CREATE TABLE IF NOT EXISTS pricing_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Target
  pricing_guide_id UUID REFERENCES pricing_guides(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Alert conditions
  alert_type TEXT NOT NULL CHECK (alert_type IN (
    'price_increase', 'price_decrease', 'price_drop_threshold',
    'availability_change', 'new_promotion'
  )),
  threshold_percentage DECIMAL(5,2),
  threshold_amount DECIMAL(12,2),

  -- Notification settings
  notify_email BOOLEAN DEFAULT true,
  notify_sms BOOLEAN DEFAULT false,
  notify_in_app BOOLEAN DEFAULT true,

  -- Status
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  trigger_count INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for pricing alerts
CREATE INDEX idx_pricing_alerts_guide ON pricing_alerts(pricing_guide_id);
CREATE INDEX idx_pricing_alerts_user ON pricing_alerts(user_id);
CREATE INDEX idx_pricing_alerts_active ON pricing_alerts(is_active);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE pricing_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE web_scrape_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_alerts ENABLE ROW LEVEL SECURITY;

-- Public read access to pricing guides and trends (for authenticated users)
CREATE POLICY "Allow authenticated users to read pricing guides"
  ON pricing_guides FOR SELECT
  USING (auth.role() = 'authenticated' AND is_active = true);

CREATE POLICY "Allow authenticated users to read price snapshots"
  ON price_snapshots FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read price trends"
  ON price_trends FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read published insights"
  ON market_insights FOR SELECT
  USING (auth.role() = 'authenticated' AND is_published = true);

-- Admin-only write access
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') THEN
    EXECUTE '
    CREATE POLICY "Allow admins to manage pricing guides" ON pricing_guides
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE user_id = auth.uid() AND is_admin = true
        )
      );

    CREATE POLICY "Allow admins to manage price snapshots" ON price_snapshots
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE user_id = auth.uid() AND is_admin = true
        )
      );

    CREATE POLICY "Allow admins to manage web scrape jobs" ON web_scrape_jobs
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE user_id = auth.uid() AND is_admin = true
        )
      );

    CREATE POLICY "Allow admins to manage market insights" ON market_insights
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE user_id = auth.uid() AND is_admin = true
        )
      );
    ';
  ELSE
    -- Fallback: Allow all authenticated users (temporary)
    EXECUTE '
    CREATE POLICY "Allow authenticated to manage pricing guides" ON pricing_guides
      FOR ALL USING (auth.role() = ''authenticated'');

    CREATE POLICY "Allow authenticated to manage price snapshots" ON price_snapshots
      FOR ALL USING (auth.role() = ''authenticated'');

    CREATE POLICY "Allow authenticated to manage web scrape jobs" ON web_scrape_jobs
      FOR ALL USING (auth.role() = ''authenticated'');

    CREATE POLICY "Allow authenticated to manage market insights" ON market_insights
      FOR ALL USING (auth.role() = ''authenticated'');
    ';
  END IF;
END $$;

-- Users can manage their own alerts
CREATE POLICY "Users can manage own pricing alerts"
  ON pricing_alerts FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Calculate average price from snapshots
CREATE OR REPLACE FUNCTION calculate_pricing_guide_averages(guide_id UUID)
RETURNS TABLE (
  avg_price DECIMAL(12,2),
  med_price DECIMAL(12,2),
  min_price DECIMAL(12,2),
  max_price DECIMAL(12,2),
  snapshot_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    AVG(price)::DECIMAL(12,2),
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price)::DECIMAL(12,2),
    MIN(price)::DECIMAL(12,2),
    MAX(price)::DECIMAL(12,2),
    COUNT(*)::INTEGER
  FROM price_snapshots
  WHERE pricing_guide_id = guide_id
    AND captured_at > now() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Generate price trend for a period
CREATE OR REPLACE FUNCTION generate_price_trend(
  guide_id UUID,
  trend_period TEXT,
  start_date DATE,
  end_date DATE
)
RETURNS UUID AS $$
DECLARE
  trend_id UUID;
  stats RECORD;
  prev_avg DECIMAL(12,2);
  direction TEXT;
  change_pct DECIMAL(7,4);
BEGIN
  -- Calculate statistics for this period
  SELECT
    AVG(price)::DECIMAL(12,2) as avg_price,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price)::DECIMAL(12,2) as med_price,
    MIN(price)::DECIMAL(12,2) as min_price,
    MAX(price)::DECIMAL(12,2) as max_price,
    STDDEV(price)::DECIMAL(12,2) as std_dev,
    COUNT(*)::INTEGER as sample_count
  INTO stats
  FROM price_snapshots
  WHERE pricing_guide_id = guide_id
    AND captured_at::DATE BETWEEN start_date AND end_date;

  -- Get previous period average for comparison
  SELECT average_price INTO prev_avg
  FROM price_trends
  WHERE pricing_guide_id = guide_id
    AND period = trend_period
    AND period_end < start_date
  ORDER BY period_end DESC
  LIMIT 1;

  -- Determine trend direction
  IF prev_avg IS NULL OR stats.avg_price IS NULL THEN
    direction := 'stable';
    change_pct := 0;
  ELSIF stats.avg_price > prev_avg * 1.05 THEN
    direction := 'up';
    change_pct := ((stats.avg_price - prev_avg) / prev_avg * 100)::DECIMAL(7,4);
  ELSIF stats.avg_price < prev_avg * 0.95 THEN
    direction := 'down';
    change_pct := ((stats.avg_price - prev_avg) / prev_avg * 100)::DECIMAL(7,4);
  ELSIF stats.std_dev > stats.avg_price * 0.15 THEN
    direction := 'volatile';
    change_pct := 0;
  ELSE
    direction := 'stable';
    change_pct := 0;
  END IF;

  -- Insert or update trend
  INSERT INTO price_trends (
    pricing_guide_id,
    period,
    period_start,
    period_end,
    trend_direction,
    change_percentage,
    change_amount,
    average_price,
    median_price,
    min_price,
    max_price,
    std_deviation,
    sample_count
  ) VALUES (
    guide_id,
    trend_period,
    start_date,
    end_date,
    direction,
    change_pct,
    CASE WHEN prev_avg IS NOT NULL THEN stats.avg_price - prev_avg ELSE NULL END,
    stats.avg_price,
    stats.med_price,
    stats.min_price,
    stats.max_price,
    stats.std_dev,
    stats.sample_count
  )
  ON CONFLICT (pricing_guide_id, period, period_start, period_end)
  DO UPDATE SET
    trend_direction = EXCLUDED.trend_direction,
    change_percentage = EXCLUDED.change_percentage,
    change_amount = EXCLUDED.change_amount,
    average_price = EXCLUDED.average_price,
    median_price = EXCLUDED.median_price,
    min_price = EXCLUDED.min_price,
    max_price = EXCLUDED.max_price,
    std_deviation = EXCLUDED.std_deviation,
    sample_count = EXCLUDED.sample_count,
    calculated_at = now()
  RETURNING id INTO trend_id;

  RETURN trend_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Display completion message
DO $$
BEGIN
  RAISE NOTICE 'Pricing Intelligence schema created successfully!';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  - pricing_guides';
  RAISE NOTICE '  - price_snapshots';
  RAISE NOTICE '  - price_trends';
  RAISE NOTICE '  - market_insights';
  RAISE NOTICE '  - web_scrape_jobs';
  RAISE NOTICE '  - pricing_alerts';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Create web scraping service';
  RAISE NOTICE '  2. Integrate Claude API for analysis';
  RAISE NOTICE '  3. Build pricing guide management UI';
END $$;
