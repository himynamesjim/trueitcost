# Pricing Intelligence System - Complete Guide

## 🎯 Overview

Your **Pricing Intelligence System** uses Claude API to automatically:
- Scrape vendor websites for pricing data
- Extract and normalize pricing information
- Calculate market averages and trends
- Generate competitive intelligence insights
- Provide buying recommendations

## ✅ What's Been Built

### 1. Database Schema ✅
**File**: `CREATE_PRICING_INTELLIGENCE_SCHEMA.sql`

**Tables Created**:
- `pricing_guides` - Master pricing data with market averages
- `price_snapshots` - Individual price observations from sources
- `price_trends` - Calculated trends over time (daily, weekly, monthly)
- `market_insights` - AI-generated market intelligence
- `web_scrape_jobs` - Track scraping operations
- `pricing_alerts` - Price change notifications

### 2. Intelligence Service ✅
**File**: `src/lib/pricing-intelligence.ts`

**Features**:
- Web scraping with fetch API
- Claude API integration for price extraction
- Trend analysis and prediction
- Market insight generation
- Automated data processing

### 3. API Endpoints ✅
**Files**:
- `src/app/api/pricing-intelligence/scrape/route.ts` - Trigger scrape jobs
- `src/app/api/pricing-intelligence/insights/route.ts` - Generate/retrieve insights

### 4. Documentation ✅
- `PRICING_INTELLIGENCE_DESIGN.md` - System architecture
- `PRICING_INTELLIGENCE_README.md` - This file

---

## 🚀 Setup Instructions

### Step 1: Run Database Schema

```bash
# In Supabase SQL Editor, run:
CREATE_PRICING_INTELLIGENCE_SCHEMA.sql
```

This creates all necessary tables, indexes, and helper functions.

### Step 2: Install Dependencies

```bash
npm install @anthropic-ai/sdk
```

### Step 3: Configure Environment Variables

Add to your `.env.local`:

```bash
# Anthropic Claude API
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

Get your API key from: https://console.anthropic.com/

### Step 4: Test the System

```bash
# Start dev server
npm run dev

# Test scraping a vendor page (requires admin access)
curl -X POST http://localhost:3000/api/pricing-intelligence/scrape \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "targetUrl": "https://www.cisco.com/c/en/us/products/switches/catalyst-9300-series-switches/index.html",
    "vendorId": "VENDOR_UUID",
    "scrapeType": "pricing"
  }'
```

---

## 📊 How It Works

### Workflow 1: Scrape Vendor Pricing Page

```
User triggers scrape
       ↓
System fetches HTML content
       ↓
Claude analyzes HTML and extracts pricing
       ↓
System normalizes and validates data
       ↓
Stores in price_snapshots table
       ↓
Updates pricing_guides with new averages
       ↓
Calculates trends
```

**Example Request**:
```typescript
const response = await fetch('/api/pricing-intelligence/scrape', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    targetUrl: 'https://example.com/product-pricing',
    vendorId: 'cisco-uuid',
    scrapeType: 'pricing',
  }),
});
```

**Claude's Role**:
- Analyzes HTML structure
- Identifies pricing elements
- Extracts product names, SKUs, prices
- Determines confidence scores
- Returns structured JSON data

### Workflow 2: Generate Market Insights

```
Admin selects product category
       ↓
System gathers all pricing data for category
       ↓
Claude analyzes trends, competition, demand
       ↓
Generates insights with recommendations
       ↓
Stores in market_insights table
       ↓
Displays to users
```

**Example Request**:
```typescript
const response = await fetch('/api/pricing-intelligence/insights', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    productCategoryId: 'networking-uuid',
  }),
});
```

**Claude's Analysis**:
- Identifies price trends (up/down/stable)
- Compares competitors
- Predicts future pricing
- Recommends buying strategies
- Assesses market conditions

---

## 💡 Use Cases

### Use Case 1: Daily Price Monitoring
**Scenario**: Track Cisco switch pricing across distributors

**Setup**:
1. Create scrape jobs for CDW, Ingram Micro, Amazon Business
2. Schedule daily at 2 AM
3. System automatically:
   - Scrapes all sources
   - Extracts prices using Claude
   - Updates pricing guides
   - Calculates trends
   - Sends alert if prices change >5%

**Result**: Always have current market rates for quotes

### Use Case 2: Competitive Analysis
**Scenario**: Compare UCaaS pricing across vendors

**Setup**:
1. Scrape Cisco Webex, Microsoft Teams, Zoom pricing pages
2. Generate market insights using Claude
3. System produces:
   - Price comparison matrix
   - TCO analysis
   - Feature/price positioning chart
   - Recommendation by company size

**Result**: Data-driven vendor recommendations for clients

### Use Case 3: Price Trend Forecasting
**Scenario**: Predict when to buy hardware

**Setup**:
1. Collect 90 days of pricing data
2. Claude analyzes seasonality, trends, supply chain
3. System generates:
   - Price forecast for next 30 days
   - Optimal purchase timing
   - Budget planning recommendations

**Result**: Buy at the right time, save money

---

## 🔧 Configuration Options

### Scrape Job Configuration

```typescript
interface ScrapeJobConfig {
  targetUrl: string;              // URL to scrape
  vendorId?: string;               // Link to vendor
  scrapeType: 'pricing' | 'specs'; // What to extract
  selectors?: {                    // Custom CSS selectors
    price: '.price-element',
    sku: '.part-number',
  };
  screenshot?: boolean;            // Capture screenshot
  schedule?: string;               // Cron expression
}
```

### Claude Analysis Prompts

You can customize prompts in `src/lib/pricing-intelligence.ts`:

```typescript
private buildAnalysisPrompt(htmlContent: string, scrapeType: string): string {
  // Modify this function to change how Claude analyzes pages
  return `Your custom prompt here...`;
}
```

---

## 📈 Cost Estimation

### Claude API Costs

**Model**: Claude 3.5 Sonnet
- Input: $3 per million tokens
- Output: $15 per million tokens

**Typical Usage**:
| Operation | Tokens | Cost per Call |
|-----------|--------|---------------|
| Price Extraction (single page) | ~4,000 input, ~1,000 output | $0.027 |
| Market Insights (category) | ~8,000 input, ~2,000 output | $0.054 |
| Trend Analysis | ~2,000 input, ~500 output | $0.014 |

**Monthly Estimates**:
- 100 scrapes/month: ~$2.70
- 20 insight generations/month: ~$1.08
- **Total**: ~$3.78/month for light usage

**High Volume** (1000 products, daily updates):
- 1000 scrapes/day × 30 days = ~$810/month
- **Optimization**: Use Claude Haiku for simple extractions = ~$80/month

### Optimization Tips

1. **Use appropriate models**:
   - Sonnet: Complex analysis, competitive research
   - Haiku: Simple price extraction, trend calculation

2. **Cache results**:
   - Don't re-scrape unchanged pages
   - Store HTML for re-analysis

3. **Batch processing**:
   - Scrape multiple products per page
   - Analyze categories together

4. **Smart scheduling**:
   - Daily for volatile products
   - Weekly for stable products
   - Monthly for enterprise licensing

---

## 🎨 Admin Interface (Next Step)

Build a pricing guide management UI:

### Features to Include:
- **Dashboard**: Overview of pricing coverage, trends, alerts
- **Scrape Jobs**: Create, monitor, retry scrape operations
- **Pricing Guides**: Browse, edit, approve pricing data
- **Market Insights**: View, publish, share AI-generated insights
- **Alerts**: Configure price change notifications
- **Reports**: Generate competitive analysis PDFs

### Suggested Pages:
1. `/pricing-guide` - Main pricing database
2. `/pricing-guide/scrape-jobs` - Job management
3. `/pricing-guide/insights` - Market intelligence
4. `/pricing-guide/trends` - Price charts and analytics
5. `/pricing-guide/alerts` - Notification settings

---

## 🔐 Security Considerations

### What's Allowed ✅
- Scraping public pricing pages
- Analyzing published pricing data
- Aggregating market information
- Fair use competitive research

### What's Restricted ❌
- Bypassing authentication/paywalls
- Violating website Terms of Service
- Excessive scraping (DDoS-like behavior)
- Storing confidential pricing

### Best Practices
- **Respect robots.txt**: Check before scraping
- **Rate limiting**: Wait 1-2 seconds between requests
- **User-Agent**: Identify yourself properly
- **Caching**: Don't scrape same page multiple times/day
- **Legal review**: Consult lawyer for compliance

---

## 🧪 Testing

### Manual Test: Scrape a Vendor Page

```bash
# 1. Get your session token from browser DevTools
# 2. Run this curl command:

curl -X POST http://localhost:3000/api/pricing-intelligence/scrape \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "targetUrl": "https://www.cdw.com/product/cisco-catalyst-9300-48p-switch/5729552",
    "scrapeType": "pricing"
  }'

# 3. Check response:
{
  "success": true,
  "jobId": "uuid-here",
  "message": "Scrape job created and processing"
}

# 4. Check job status:
curl "http://localhost:3000/api/pricing-intelligence/scrape?jobId=uuid-here"

# 5. Verify in database:
SELECT * FROM web_scrape_jobs WHERE id = 'uuid-here';
SELECT * FROM price_snapshots ORDER BY created_at DESC LIMIT 10;
```

### Test Market Insights

```bash
curl -X POST http://localhost:3000/api/pricing-intelligence/insights \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productCategoryId": "networking-category-uuid"
  }'

# Check insights in database:
SELECT * FROM market_insights ORDER BY generated_at DESC LIMIT 5;
```

---

## 📚 Next Steps

### Phase 1: Core Functionality (Complete ✅)
- [x] Database schema
- [x] Claude integration
- [x] Web scraping service
- [x] API endpoints
- [x] Trend calculations

### Phase 2: UI/UX (Next)
- [ ] Create `/pricing-guide` page
- [ ] Build scrape job management interface
- [ ] Add pricing guide browser
- [ ] Display market insights
- [ ] Create trend visualizations

### Phase 3: Automation
- [ ] Scheduled scraping jobs (cron)
- [ ] Automatic trend updates
- [ ] Price change alerts
- [ ] Email reports

### Phase 4: Advanced Features
- [ ] Multi-source price aggregation
- [ ] PDF price list parsing
- [ ] Competitor quote analysis
- [ ] Custom pricing rules
- [ ] API for external access

---

## 🆘 Troubleshooting

### "ANTHROPIC_API_KEY not set"
**Solution**: Add to `.env.local`:
```bash
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

### Scrape job stuck in "processing"
**Solution**: Check error logs:
```sql
SELECT error_message FROM web_scrape_jobs WHERE status = 'failed';
```

### No prices extracted
**Solution**: Claude might not recognize the page structure. Check:
1. `claude_analysis` field in `web_scrape_jobs`
2. Adjust prompt in `buildAnalysisPrompt()` function
3. Test with known vendor pages first

### High Claude API costs
**Solution**:
1. Switch to Haiku for simple operations
2. Increase cache duration
3. Reduce scraping frequency
4. Filter out unchanged pages

---

## 📖 Additional Resources

**Claude API Docs**: https://docs.anthropic.com/
**Web Scraping Best Practices**: https://www.scraping-bot.io/best-practices/
**Legal Considerations**: https://www.eff.org/issues/coders/reverse-engineering-faq

---

## ✨ Summary

You now have a **complete pricing intelligence system** that:

1. **Scrapes vendor websites** using standard web fetch
2. **Extracts pricing** using Claude's AI analysis
3. **Calculates trends** with statistical functions
4. **Generates insights** for competitive positioning
5. **Stores everything** in a comprehensive database
6. **Provides APIs** for integration

**Status**: Backend complete ✅ | Frontend pending ⏳

**Next action**: Build the admin UI to manage pricing guides and view insights!

---

**Built with Claude Code** 🤖
**Last Updated**: March 31, 2026
