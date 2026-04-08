/**
 * Pricing Intelligence Service
 *
 * Uses Claude API to scrape vendor websites, extract pricing data,
 * and generate market insights and trends.
 */

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// ============================================================================
// TYPES
// ============================================================================

interface ScrapeJobConfig {
  targetUrl: string;
  vendorId?: string;
  scrapeType: 'pricing' | 'specs' | 'availability' | 'bulk';
  selectors?: Record<string, string>;
  waitForSelector?: string;
  screenshot?: boolean;
}

interface ExtractedPrice {
  productName: string;
  sku?: string;
  price: number;
  msrp?: number;
  currency: string;
  availability?: string;
  source: string;
  sourceUrl: string;
  confidence: number;
  notes?: string;
}

interface PriceTrend {
  direction: 'up' | 'down' | 'stable' | 'volatile';
  changePercentage: number;
  prediction?: string;
  recommendation?: string;
}

interface MarketInsight {
  type: 'trend' | 'competition' | 'demand' | 'recommendation';
  title: string;
  text: string;
  confidence: number;
  supportingData?: any;
}

// ============================================================================
// WEB SCRAPING
// ============================================================================

export class PricingIntelligenceService {
  /**
   * Scrape a vendor page for pricing information
   */
  async scrapeVendorPage(config: ScrapeJobConfig, userId?: string): Promise<string> {
    // Create scrape job record
    const { data: job, error: jobError } = await supabase
      .from('web_scrape_jobs')
      .insert({
        target_url: config.targetUrl,
        target_vendor_id: config.vendorId,
        scrape_type: config.scrapeType,
        scrape_config: config,
        status: 'pending',
        created_by: userId,
      })
      .select()
      .single();

    if (jobError || !job) {
      throw new Error(`Failed to create scrape job: ${jobError?.message}`);
    }

    // Start processing
    await this.processScrapeJob(job.id);

    return job.id;
  }

  /**
   * Process a scrape job
   */
  private async processScrapeJob(jobId: string): Promise<void> {
    try {
      // Update status to processing
      await supabase
        .from('web_scrape_jobs')
        .update({ status: 'processing', started_at: new Date().toISOString() })
        .eq('id', jobId);

      // Get job details
      const { data: job } = await supabase
        .from('web_scrape_jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (!job) throw new Error('Job not found');

      const startTime = Date.now();

      // Fetch the page content
      const htmlContent = await this.fetchPageContent(job.target_url);

      // Send to Claude for analysis
      const analysis = await this.analyzePageWithClaude(
        htmlContent,
        job.scrape_type,
        job.target_url
      );

      const duration = Math.floor((Date.now() - startTime) / 1000);

      // Update job with results
      await supabase
        .from('web_scrape_jobs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          duration_seconds: duration,
          html_content: htmlContent.substring(0, 50000), // Store first 50KB
          extracted_data: analysis.extractedData,
          claude_analysis: analysis,
          claude_tokens_used: analysis.tokensUsed,
        })
        .eq('id', jobId);

      // Process extracted prices
      if (analysis.prices && analysis.prices.length > 0) {
        await this.processPriceData(analysis.prices, jobId);
      }

    } catch (error: any) {
      // Update job with error
      await supabase
        .from('web_scrape_jobs')
        .update({
          status: 'failed',
          error_message: error.message,
          completed_at: new Date().toISOString(),
        })
        .eq('id', jobId);

      throw error;
    }
  }

  /**
   * Fetch page content using fetch API
   * In production, you might want to use Puppeteer/Playwright for JavaScript-heavy sites
   */
  private async fetchPageContent(url: string): Promise<string> {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TrueITCost PriceBot/1.0; +https://trueitcost.com/bot)',
        'Accept': 'text/html,application/xhtml+xml,application/xml',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.text();
  }

  // ============================================================================
  // CLAUDE API INTEGRATION
  // ============================================================================

  /**
   * Analyze page content with Claude to extract pricing data
   */
  private async analyzePageWithClaude(
    htmlContent: string,
    scrapeType: string,
    sourceUrl: string
  ): Promise<any> {
    const prompt = this.buildAnalysisPrompt(htmlContent, scrapeType, sourceUrl);

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    // Parse JSON response from Claude
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const extractedData = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    return {
      extractedData,
      rawResponse: responseText,
      tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
      prices: extractedData.products || [],
    };
  }

  /**
   * Build analysis prompt for Claude
   */
  private buildAnalysisPrompt(htmlContent: string, scrapeType: string, sourceUrl: string): string {
    // Truncate HTML to avoid token limits
    const maxLength = 100000; // ~25k tokens
    const truncatedHtml = htmlContent.substring(0, maxLength);

    if (scrapeType === 'pricing') {
      return `Analyze this vendor pricing page and extract all product pricing information.

URL: ${sourceUrl}

HTML Content:
${truncatedHtml}

Extract and return ONLY a valid JSON object with this exact structure:
{
  "products": [
    {
      "productName": "Full product name",
      "sku": "Part number or SKU",
      "price": 999.99,
      "msrp": 1299.99,
      "currency": "USD",
      "availability": "in stock" | "out of stock" | "backordered",
      "confidence": 95,
      "notes": "Any relevant pricing notes or promotions"
    }
  ],
  "pageType": "product listing" | "single product" | "price list",
  "vendorName": "Extracted vendor name",
  "lastUpdated": "Date if shown on page"
}

Important:
- Extract ALL products you can find on the page
- Set confidence 0-100 based on how clear the pricing is
- Include currency symbol context
- Note any discounts or promotions
- If MSRP isn't shown but price is, set msrp = null
- Be very careful with decimal places and currency symbols
- Return ONLY the JSON, no explanation text`;
    }

    // Other scrape types can have different prompts
    return `Analyze this page and extract relevant information.\n\nHTML: ${truncatedHtml}`;
  }

  /**
   * Generate market insights using Claude
   */
  async generateMarketInsights(
    productCategoryId: string,
    pricingData: any[]
  ): Promise<MarketInsight[]> {
    const prompt = `Analyze these pricing data points and generate market insights:

Product Category: ${productCategoryId}
Price Data: ${JSON.stringify(pricingData, null, 2)}

Generate 3-5 actionable market insights covering:
1. Price trends (are prices going up, down, or stable?)
2. Competitive positioning (who's cheapest, who's premium?)
3. Demand indicators (any patterns suggesting demand changes?)
4. Buying recommendations (best time to buy, best value options)

Return a JSON array with this structure:
[
  {
    "type": "trend" | "competition" | "demand" | "recommendation",
    "title": "Short insight title",
    "text": "Detailed explanation of the insight (2-3 sentences)",
    "confidence": 85,
    "supportingData": { "key": "value" }
  }
]`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    const insights = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    // Store insights in database
    for (const insight of insights) {
      await supabase.from('market_insights').insert({
        product_category_id: productCategoryId,
        insight_type: insight.type,
        title: insight.title,
        insight_text: insight.text,
        confidence_score: insight.confidence,
        supporting_data: insight.supportingData,
        generated_by: 'claude',
        model_version: 'claude-3-5-sonnet-20241022',
      });
    }

    return insights;
  }

  /**
   * Analyze price trends using Claude
   */
  async analyzePriceTrend(
    pricingGuideId: string,
    historicalPrices: Array<{ date: string; price: number }>
  ): Promise<PriceTrend> {
    const prompt = `Analyze this price history and provide trend analysis:

Historical Prices:
${historicalPrices.map(p => `${p.date}: $${p.price}`).join('\n')}

Provide analysis in JSON format:
{
  "direction": "up" | "down" | "stable" | "volatile",
  "changePercentage": 5.2,
  "prediction": "Likely to continue rising due to...",
  "recommendation": "Consider buying now before prices increase further"
}`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514', // Use Haiku for faster/cheaper analysis
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const trend = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    return trend;
  }

  // ============================================================================
  // DATA PROCESSING
  // ============================================================================

  /**
   * Process extracted price data and store in database
   */
  private async processPriceData(
    prices: ExtractedPrice[],
    scrapeJobId: string
  ): Promise<void> {
    for (const priceData of prices) {
      try {
        // Find or create pricing guide
        let pricingGuide = await this.findOrCreatePricingGuide(priceData);

        // Create price snapshot
        await supabase.from('price_snapshots').insert({
          pricing_guide_id: pricingGuide.id,
          source: 'website',
          source_url: priceData.sourceUrl,
          price: priceData.price,
          currency: priceData.currency,
          price_type: priceData.msrp ? 'street' : 'list',
          availability: priceData.availability,
          raw_data: priceData,
        });

        // Update pricing guide averages
        await this.updatePricingGuideAverages(pricingGuide.id);

      } catch (error) {
        console.error('Error processing price data:', error);
      }
    }
  }

  /**
   * Find existing pricing guide or create new one
   */
  private async findOrCreatePricingGuide(priceData: ExtractedPrice): Promise<any> {
    // Try to find by SKU
    if (priceData.sku) {
      const { data: existing } = await supabase
        .from('pricing_guides')
        .select('*')
        .eq('sku', priceData.sku)
        .single();

      if (existing) return existing;
    }

    // Create new pricing guide
    const { data: newGuide, error } = await supabase
      .from('pricing_guides')
      .insert({
        product_name: priceData.productName,
        sku: priceData.sku,
        msrp: priceData.msrp,
        average_cost: priceData.price,
        low_price: priceData.price,
        high_price: priceData.price,
        currency: priceData.currency,
        confidence_score: priceData.confidence,
        source_count: 1,
        data_sources: [{ source: priceData.source, url: priceData.sourceUrl }],
      })
      .select()
      .single();

    if (error) throw error;
    return newGuide;
  }

  /**
   * Update pricing guide with latest averages from snapshots
   */
  private async updatePricingGuideAverages(pricingGuideId: string): Promise<void> {
    // Use the database function to calculate averages
    const { data: stats } = await supabase
      .rpc('calculate_pricing_guide_averages', { guide_id: pricingGuideId })
      .single();

    if (stats && typeof stats === 'object' && 'avg_price' in stats) {
      await supabase
        .from('pricing_guides')
        .update({
          average_cost: (stats as any).avg_price,
          median_price: (stats as any).med_price,
          low_price: (stats as any).min_price,
          high_price: (stats as any).max_price,
          source_count: (stats as any).snapshot_count,
          last_updated_at: new Date().toISOString(),
        })
        .eq('id', pricingGuideId);
    }
  }

  /**
   * Generate price trends for a pricing guide
   */
  async generateTrends(pricingGuideId: string): Promise<void> {
    const now = new Date();
    const periods = [
      { period: 'weekly', days: 7 },
      { period: 'monthly', days: 30 },
      { period: 'quarterly', days: 90 },
    ];

    for (const { period, days } of periods) {
      const endDate = now.toISOString().split('T')[0];
      const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      await supabase.rpc('generate_price_trend', {
        guide_id: pricingGuideId,
        trend_period: period,
        start_date: startDate,
        end_date: endDate,
      });
    }
  }
}

// Export singleton instance
export const pricingIntelligence = new PricingIntelligenceService();
