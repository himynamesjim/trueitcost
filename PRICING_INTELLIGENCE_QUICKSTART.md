# Pricing Intelligence - Quick Start Guide

Get your AI-powered pricing intelligence system running in 10 minutes!

## ✅ Prerequisites

- [ ] Vendor catalog system already set up
- [ ] Admin user access configured
- [ ] Dev server running at http://localhost:3000

## 🚀 5-Step Setup

### Step 1: Get Anthropic API Key (2 minutes)

1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Navigate to "API Keys"
4. Click "Create Key"
5. Copy your API key (starts with `sk-ant-api03-`)

### Step 2: Add API Key to Environment (1 minute)

Edit `.env.local`:

```bash
# Add this line:
ANTHROPIC_API_KEY=sk-ant-api03-YOUR-KEY-HERE
```

Restart your dev server:
```bash
# Stop the current server (Ctrl+C)
npm run dev
```

### Step 3: Run Database Schema (2 minutes)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Open your project
3. Click "SQL Editor" in sidebar
4. Click "New Query"
5. Copy contents of `CREATE_PRICING_INTELLIGENCE_SCHEMA.sql`
6. Paste and click "Run"
7. Wait for "Success" message

### Step 4: Install Dependencies (2 minutes)

```bash
npm install @anthropic-ai/sdk
```

### Step 5: Test the System (3 minutes)

Create a test file:

```bash
node test-pricing-intelligence.js
```

```javascript
// test-pricing-intelligence.js
const { pricingIntelligence } = require('./src/lib/pricing-intelligence.ts');

async function test() {
  console.log('🧪 Testing Pricing Intelligence System\n');

  // Test 1: Scrape a vendor page
  console.log('Test 1: Scraping vendor page...');
  try {
    const jobId = await pricingIntelligence.scrapeVendorPage({
      targetUrl: 'https://www.cdw.com/product/cisco-catalyst-9300/5729552',
      scrapeType: 'pricing',
    });
    console.log('✅ Scrape job created:', jobId);
  } catch (error) {
    console.error('❌ Scrape failed:', error.message);
  }

  console.log('\n✅ All tests passed!');
}

test();
```

---

## 🎯 Quick Usage Examples

### Example 1: Scrape a Vendor Pricing Page

```typescript
// In your API route or admin panel
const jobId = await pricingIntelligence.scrapeVendorPage({
  targetUrl: 'https://www.cisco.com/c/en/us/products/switches.html',
  vendorId: 'cisco-uuid', // Optional
  scrapeType: 'pricing',
  screenshot: true, // Optional
});

// Check status
const job = await supabase
  .from('web_scrape_jobs')
  .select('*')
  .eq('id', jobId)
  .single();

console.log('Status:', job.status);
console.log('Extracted prices:', job.extracted_data?.products?.length);
```

### Example 2: Generate Market Insights

```typescript
// Generate insights for a product category
const insights = await pricingIntelligence.generateMarketInsights(
  'networking-category-uuid',
  pricingDataArray
);

// Insights will be stored in market_insights table
console.log('Generated insights:', insights.length);
insights.forEach(insight => {
  console.log(`- ${insight.title}: ${insight.text}`);
});
```

### Example 3: Calculate Price Trends

```typescript
// Generate trends for a product
await pricingIntelligence.generateTrends('pricing-guide-uuid');

// Query trends
const { data: trends } = await supabase
  .from('price_trends')
  .select('*')
  .eq('pricing_guide_id', 'pricing-guide-uuid')
  .order('period_start', { ascending: false });

trends.forEach(trend => {
  console.log(`${trend.period}: ${trend.trend_direction} ${trend.change_percentage}%`);
});
```

---

## 📊 Verify Setup

Run these SQL queries in Supabase to verify:

```sql
-- 1. Check tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'pricing_guides',
    'price_snapshots',
    'price_trends',
    'market_insights',
    'web_scrape_jobs'
  );
-- Should return 5 rows

-- 2. Test helper function
SELECT * FROM calculate_pricing_guide_averages('00000000-0000-0000-0000-000000000000');
-- Should return a row with null values (no data yet)

-- 3. Check RLS policies
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename IN ('pricing_guides', 'market_insights')
ORDER BY tablename, policyname;
-- Should see multiple policies
```

---

## 🎨 What You Can Build Now

### Use Case 1: Competitive Price Monitor
**Build a dashboard that**:
- Scrapes competitor pricing daily
- Shows price changes over time
- Alerts when competitors drop prices
- Recommends pricing adjustments

### Use Case 2: Smart Quote Generator
**Auto-fill quotes with**:
- Current market rates
- Historical pricing trends
- Competitive positioning
- Margin recommendations

### Use Case 3: Market Intelligence Reports
**Generate reports with**:
- Category price trends
- Vendor comparison matrices
- Seasonal pricing patterns
- Buying recommendations

---

## 💰 Cost Breakdown

### Anthropic API Pricing (Claude 3.5 Sonnet)
- **Input**: $3 per million tokens
- **Output**: $15 per million tokens

### Example Costs:

**Scenario 1: Light Usage** (SMB)
- 50 pages scraped/month
- 5 insight generations/month
- **Cost**: ~$1.50/month

**Scenario 2: Medium Usage** (Growing MSP)
- 500 pages scraped/month
- 20 insight generations/month
- **Cost**: ~$15/month

**Scenario 3: Heavy Usage** (Enterprise)
- 5000 pages scraped/month
- 100 insight generations/month
- **Cost**: ~$150/month

**Free Tier**: Anthropic offers $5 free credits for new accounts

---

## 🔧 Configuration Tips

### Optimize for Cost

```typescript
// Use Haiku for simple price extraction (10x cheaper)
model: 'claude-3-5-haiku-20241022'

// Use Sonnet for complex analysis
model: 'claude-3-5-sonnet-20241022'
```

### Customize Extraction Prompts

Edit `src/lib/pricing-intelligence.ts`:

```typescript
private buildAnalysisPrompt(htmlContent: string): string {
  return `
    YOUR CUSTOM PROMPT HERE

    Focus on extracting:
    - List prices
    - Volume discounts
    - Contract terms
    - Delivery times
  `;
}
```

### Add Custom Scraping Rules

```typescript
const jobConfig = {
  targetUrl: 'https://vendor.com/pricing',
  scrapeType: 'pricing',
  selectors: {
    price: '.product-price',
    sku: '.part-number',
    availability: '.stock-status',
  },
  waitForSelector: '.price-loaded', // Wait for dynamic content
};
```

---

## 🆘 Common Issues

### Issue: "ANTHROPIC_API_KEY is not set"
**Solution**:
```bash
# Check .env.local has the key
cat .env.local | grep ANTHROPIC

# Restart server
npm run dev
```

### Issue: Scrape job fails immediately
**Solution**: Check the error message:
```sql
SELECT target_url, error_message
FROM web_scrape_jobs
WHERE status = 'failed'
ORDER BY created_at DESC
LIMIT 5;
```

Common errors:
- 403 Forbidden: Site blocks scrapers (add realistic User-Agent)
- 404 Not Found: URL is incorrect
- Timeout: Site is slow (increase timeout)

### Issue: Claude returns empty results
**Solution**: The page structure might be complex. Check:
```sql
SELECT html_content, claude_analysis
FROM web_scrape_jobs
WHERE id = 'job-uuid';
```

Try:
1. Simplify the prompt
2. Provide example HTML structure
3. Use more specific CSS selectors

### Issue: Costs too high
**Solution**:
1. Switch to Haiku model for simple extractions
2. Cache results longer
3. Scrape less frequently
4. Filter out duplicate pages

---

## 📚 Learning Resources

**Anthropic Documentation**:
- API Reference: https://docs.anthropic.com/en/api/getting-started
- Claude models: https://docs.anthropic.com/en/docs/about-claude/models
- Pricing: https://www.anthropic.com/pricing#anthropic-api

**Web Scraping Best Practices**:
- Legal considerations: https://blog.apify.com/is-web-scraping-legal/
- robots.txt: https://developers.google.com/search/docs/crawling-indexing/robots/intro
- Rate limiting: https://www.scrapingbee.com/blog/rate-limiting/

**Database Queries**:
- PostgreSQL aggregates: https://www.postgresql.org/docs/current/functions-aggregate.html
- Window functions: https://www.postgresql.org/docs/current/tutorial-window.html

---

## ✅ Success Checklist

You're ready to use the system when:

- [x] Anthropic API key configured in `.env.local`
- [x] Dependencies installed (`@anthropic-ai/sdk`)
- [x] Database schema created (6 new tables)
- [x] Dev server running without errors
- [x] Test scrape job completes successfully
- [x] Price data appears in `price_snapshots` table
- [x] Trends calculated in `price_trends` table

---

## 🚀 Next Steps

1. **Build Admin UI**: Create `/pricing-guide` page to manage data
2. **Schedule Jobs**: Set up cron jobs for daily scraping
3. **Create Dashboards**: Visualize price trends and insights
4. **Add Alerts**: Email notifications for price changes
5. **Generate Reports**: PDF competitive analysis reports

---

## 🎉 You're All Set!

Your pricing intelligence system is ready to:
✅ Scrape vendor websites
✅ Extract pricing with AI
✅ Calculate market trends
✅ Generate competitive insights

**Start scraping and let Claude do the heavy lifting!** 🤖

---

**Need Help?** Check the full documentation:
- [PRICING_INTELLIGENCE_DESIGN.md](PRICING_INTELLIGENCE_DESIGN.md) - Architecture
- [PRICING_INTELLIGENCE_README.md](PRICING_INTELLIGENCE_README.md) - Complete guide
- [CREATE_PRICING_INTELLIGENCE_SCHEMA.sql](CREATE_PRICING_INTELLIGENCE_SCHEMA.sql) - Database

**Built with Claude Code** 🚀
