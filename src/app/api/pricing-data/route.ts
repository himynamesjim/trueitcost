import { NextResponse } from 'next/server';
import { COMMON_PRODUCT_PRICING, VENDOR_HIERARCHY, VENDOR_MARKET_INSIGHTS, searchProductPricing, calculateMSPPricing, generatePriceTrend } from '@/lib/pricing-scraper';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const vendor = searchParams.get('vendor') || '';
  const category = searchParams.get('category') || '';

  try {
    // If there's a search query, search for products
    if (query) {
      const results = searchProductPricing(query);
      return NextResponse.json({ products: results });
    }

    // Otherwise, return all products with MSP markup calculations
    const allProducts: any[] = [];

    Object.entries(COMMON_PRODUCT_PRICING).forEach(([vendorName, products]) => {
      // Filter by vendor if specified
      if (vendor && vendorName.toLowerCase() !== vendor.toLowerCase()) {
        return;
      }

      Object.entries(products).forEach(([productName, pricing]: [string, any]) => {
        // Filter by category if specified
        if (category && pricing.category !== category) {
          return;
        }

        // Calculate MSP pricing tiers
        const baseCost = pricing.estimated_cost || pricing.monthly || pricing.msrp;
        const pricingCategory = pricing.category || 'software';

        const lowTier = calculateMSPPricing(baseCost, pricingCategory, 'low');
        const mediumTier = calculateMSPPricing(baseCost, pricingCategory, 'medium');
        const highTier = calculateMSPPricing(baseCost, pricingCategory, 'high');

        // Generate price trend data
        const priceTrend = generatePriceTrend(vendorName, pricingCategory);

        allProducts.push({
          id: `${vendorName}-${productName}`.toLowerCase().replace(/\s+/g, '-'),
          vendor: vendorName,
          product_name: productName,
          category: pricing.category,
          msrp: pricing.msrp || null,
          monthly_cost: pricing.monthly || null,
          annual_cost: pricing.annual || null,
          estimated_cost: pricing.estimated_cost || null,
          msp_pricing: {
            low: lowTier,
            medium: mediumTier,
            high: highTier,
          },
          price_trend: priceTrend,
          last_updated: new Date().toISOString(),
        });
      });
    });

    return NextResponse.json({
      products: allProducts,
      total: allProducts.length,
      vendors: Object.keys(COMMON_PRODUCT_PRICING),
      vendorHierarchy: VENDOR_HIERARCHY,
      marketInsights: VENDOR_MARKET_INSIGHTS,
    });
  } catch (error) {
    console.error('Error fetching pricing data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pricing data' },
      { status: 500 }
    );
  }
}
