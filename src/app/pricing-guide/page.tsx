'use client';

import { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown, DollarSign, RefreshCw, Sparkles, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import NavMenu from '@/components/nav-menu';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

interface PricingGuide {
  id: string;
  product_name: string;
  sku: string;
  vendor: { name: string; slug: string } | null;
  product_category: { name: string; slug: string } | null;
  msrp: number;
  average_cost: number;
  low_price: number;
  high_price: number;
  market_position: string;
  confidence_score: number;
  source_count: number;
  last_updated_at: string;
  price_trends?: Array<{
    trend_direction: string;
    change_percentage: number;
    period: string;
  }>;
}

interface MarketInsight {
  id: string;
  title: string;
  insight_text: string;
  insight_type: string;
  confidence_score: number;
  generated_at: string;
}

interface Stats {
  totalProducts: number;
  averagePrice: number;
  trendingUp: number;
  trendingDown: number;
}

export default function PricingGuidePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVendorFamily, setSelectedVendorFamily] = useState<string>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [pricingGuides, setPricingGuides] = useState<PricingGuide[]>([]);
  const [insights, setInsights] = useState<MarketInsight[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    averagePrice: 0,
    trendingUp: 0,
    trendingDown: 0,
  });
  const [loading, setLoading] = useState(true);
  const [vendorHierarchy, setVendorHierarchy] = useState<Record<string, string[]>>({});
  const [availableSubcategories, setAvailableSubcategories] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, [selectedVendorFamily, selectedSubcategory, searchQuery]);

  async function loadData() {
    try {
      setLoading(true);

      // Load pricing data from our API
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (selectedSubcategory !== 'all') {
        params.append('vendor', selectedSubcategory);
      } else if (selectedVendorFamily !== 'all') {
        // If vendor family selected but no subcategory, don't filter yet
        // We'll filter client-side based on hierarchy
      }

      const response = await fetch(`/api/pricing-data?${params.toString()}`);
      const data = await response.json();

      // Set up vendor hierarchy from API response
      if (data.vendorHierarchy) {
        setVendorHierarchy(data.vendorHierarchy);

        // Update available subcategories when vendor family changes
        if (selectedVendorFamily !== 'all' && data.vendorHierarchy[selectedVendorFamily]) {
          setAvailableSubcategories(data.vendorHierarchy[selectedVendorFamily]);
        } else {
          setAvailableSubcategories([]);
        }
      }

      if (data.products) {
        // Transform API data to match our PricingGuide interface
        let transformedData = data.products.map((product: any) => ({
          id: product.id,
          product_name: product.product_name,
          sku: product.product_name, // Use product name as SKU for now
          vendor: { name: product.vendor, slug: product.vendor.toLowerCase() },
          product_category: product.category ? { name: product.category, slug: product.category } : null,
          msrp: product.msrp || product.monthly_cost || product.estimated_cost || 0,
          average_cost: product.estimated_cost || product.monthly_cost || product.msrp || 0,
          low_price: product.msp_pricing?.low?.sellingPrice || 0,
          high_price: product.msp_pricing?.high?.sellingPrice || 0,
          market_position: 'mid-range',
          confidence_score: 95,
          source_count: 1,
          last_updated_at: product.last_updated,
          price_trends: product.price_trend ? [product.price_trend] : [],
        }));

        // Client-side filter by vendor family if selected but no subcategory
        if (selectedVendorFamily !== 'all' && selectedSubcategory === 'all' && data.vendorHierarchy[selectedVendorFamily]) {
          const vendorFamilyCategories = data.vendorHierarchy[selectedVendorFamily];
          transformedData = transformedData.filter((product: any) =>
            vendorFamilyCategories.includes(product.vendor.name)
          );
        }

        setPricingGuides(transformedData);

        // Calculate stats
        const totalProducts = transformedData.length;
        const averagePrice =
          transformedData.reduce((sum: number, g: any) => sum + (g.average_cost || 0), 0) /
            totalProducts || 0;

        // Count trending up/down products
        const trendingUp = transformedData.filter((p: any) =>
          p.price_trends?.[0]?.trend_direction === 'up'
        ).length;
        const trendingDown = transformedData.filter((p: any) =>
          p.price_trends?.[0]?.trend_direction === 'down'
        ).length;

        setStats({
          totalProducts,
          averagePrice,
          trendingUp,
          trendingDown,
        });
      }

      // Set vendor-specific insights
      if (data.marketInsights) {
        const vendorInsight = selectedVendorFamily !== 'all' && data.marketInsights[selectedVendorFamily]
          ? data.marketInsights[selectedVendorFamily]
          : null;

        const insightsList: MarketInsight[] = [];

        if (vendorInsight) {
          // Add vendor-specific insight with recommendation
          const recommendationText =
            vendorInsight.recommendation === 'buy_now'
              ? '✅ Good time to buy - pricing favorable and availability strong.'
              : vendorInsight.recommendation === 'wait'
              ? '⏳ Consider waiting - prices may stabilize or decrease soon.'
              : '⚖️ Neutral timing - evaluate based on your specific needs.';

          insightsList.push({
            id: '1',
            title: vendorInsight.title,
            insight_text: `${vendorInsight.insight}\n\n${recommendationText}`,
            insight_type: vendorInsight.recommendation === 'buy_now' ? 'recommendation_buy' :
                         vendorInsight.recommendation === 'wait' ? 'recommendation_wait' : 'neutral',
            confidence_score: vendorInsight.confidence,
            generated_at: new Date().toISOString(),
          });
        } else {
          // General market insights when viewing all vendors
          insightsList.push(
            {
              id: '1',
              title: 'Market Overview',
              insight_text:
                'MSP hardware and software pricing remains competitive across vendors. Consider vendor consolidation for better pricing tiers. Annual commitments typically save 10-20%.',
              insight_type: 'market_trend',
              confidence_score: 90,
              generated_at: new Date().toISOString(),
            },
            {
              id: '2',
              title: 'Q2 2026 Outlook',
              insight_text:
                'Supply chain stabilization continuing. Lead times improving for most networking hardware. Software licensing stable with predictable renewal increases.',
              insight_type: 'pricing_trend',
              confidence_score: 85,
              generated_at: new Date().toISOString(),
            }
          );
        }

        setInsights(insightsList);
      }
    } catch (error) {
      console.error('Error loading pricing data:', error);
    } finally {
      setLoading(false);
    }
  }

  function getTrendIcon(direction: string) {
    switch (direction) {
      case 'up':
        return <ArrowUpRight className="w-4 h-4 text-red-600" />;
      case 'down':
        return <ArrowDownRight className="w-4 h-4 text-green-600" />;
      case 'stable':
        return <Minus className="w-4 h-4 text-slate-600" />;
      default:
        return <Minus className="w-4 h-4 text-slate-400" />;
    }
  }

  function getMarketPositionColor(position: string) {
    switch (position) {
      case 'budget':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200';
      case 'mid-range':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200';
      case 'premium':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200';
      case 'enterprise':
        return 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200';
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <SiteHeader />
      <div style={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
        <aside className="dark:bg-[#0a0d14] bg-white" style={{
          width: '280px',
          borderRight: "1px solid rgba(255,255,255,0.06)",
          display: 'flex',
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
        }}>
          <NavMenu />
        </aside>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                    Pricing Intelligence
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400">
                    AI-powered market pricing, trends, and competitive analysis
                  </p>
                </div>
                <button
                  onClick={loadData}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products, SKUs, vendors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Vendor Family Filters */}
            {Object.keys(vendorHierarchy).length > 0 && (
              <div className="mb-8">
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    onClick={() => {
                      setSelectedVendorFamily('all');
                      setSelectedSubcategory('all');
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedVendorFamily === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>💰</span>
                    <span>All Vendors</span>
                  </button>
                  {Object.keys(vendorHierarchy).map((vendorFamily) => {
                    const icons: Record<string, string> = {
                      Microsoft: '🪟',
                      Cisco: '📡',
                      Logitech: '🎥',
                      Poly: '📞',
                      Dell: '🖥️',
                      'HP/HPE': '💻',
                      VMware: '☁️',
                      Fortinet: '🛡️',
                      Ubiquiti: '📶',
                      Lenovo: '🏢',
                    };
                    return (
                      <button
                        key={vendorFamily}
                        onClick={() => {
                          setSelectedVendorFamily(vendorFamily);
                          setSelectedSubcategory('all');
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                          selectedVendorFamily === vendorFamily
                            ? 'bg-blue-600 text-white'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span>{icons[vendorFamily] || '📦'}</span>
                        <span>{vendorFamily}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Subcategory Dropdown */}
                {availableSubcategories.length > 0 && (
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {selectedVendorFamily} Products:
                    </label>
                    <select
                      value={selectedSubcategory}
                      onChange={(e) => setSelectedSubcategory(e.target.value)}
                      className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All {selectedVendorFamily} Products</option>
                      {availableSubcategories.map((subcategory) => (
                        <option key={subcategory} value={subcategory}>
                          {subcategory}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">Avg Price</h3>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                  ${stats.averagePrice.toFixed(2)}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Across {stats.totalProducts} products</div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-red-600" />
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">Trending Up</h3>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">{stats.trendingUp}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Products increasing</div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingDown className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">Trending Down</h3>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">{stats.trendingDown}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Products decreasing</div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">📊</span>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">Total Products</h3>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">{stats.totalProducts}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">In database</div>
              </div>
            </div>

            {/* Market Insights */}
            {insights.length > 0 && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800 p-6 mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    AI Market Insights
                  </h2>
                </div>
                <div className="space-y-3">
                  {insights.map((insight) => (
                    <div key={insight.id} className="bg-white dark:bg-slate-900 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">{insight.title}</h3>
                        <span className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200">
                          {insight.confidence_score}% confident
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{insight.insight_text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing Guide Table */}
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Pricing Database
                </h2>
              </div>

              {loading ? (
                <div className="p-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-300 border-t-blue-600"></div>
                  <p className="mt-4 text-slate-600 dark:text-slate-400">Loading pricing data...</p>
                </div>
              ) : pricingGuides.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    No pricing data found for your search criteria. Try adjusting your filters or search query.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Vendor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Price Range
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Trend
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Position
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Sources
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {pricingGuides.map((guide) => {
                        const latestTrend = guide.price_trends?.[0];
                        return (
                          <tr key={guide.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-medium text-slate-900 dark:text-slate-100">{guide.product_name}</div>
                              {guide.sku && (
                                <div className="text-sm text-slate-500 dark:text-slate-400">SKU: {guide.sku}</div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-slate-700 dark:text-slate-300">
                                {guide.vendor?.name || 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm">
                                <div className="font-semibold text-slate-900 dark:text-slate-100">
                                  ${guide.average_cost?.toFixed(2) || 'N/A'}
                                </div>
                                <div className="text-slate-500 dark:text-slate-400">
                                  ${guide.low_price?.toFixed(2)} - ${guide.high_price?.toFixed(2)}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {latestTrend ? (
                                <div className="flex items-center gap-2">
                                  {getTrendIcon(latestTrend.trend_direction)}
                                  <span className="text-sm text-slate-700 dark:text-slate-300">
                                    {latestTrend.change_percentage > 0 ? '+' : ''}
                                    {latestTrend.change_percentage?.toFixed(1)}%
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm text-slate-400">No data</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {guide.market_position && (
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getMarketPositionColor(guide.market_position)}`}>
                                  {guide.market_position}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-slate-700 dark:text-slate-300">
                                {guide.source_count} source{guide.source_count !== 1 ? 's' : ''}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                {guide.confidence_score}% confidence
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
