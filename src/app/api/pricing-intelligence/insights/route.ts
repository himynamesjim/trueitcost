import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { pricingIntelligence } from '@/lib/pricing-intelligence';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/pricing-intelligence/insights
 * Generate market insights for a product category using Claude
 *
 * Body:
 * - productCategoryId: string
 */
export async function POST(request: NextRequest) {
  try {
    // Get session
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('user_id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json(
        { error: 'Only administrators can generate insights' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { productCategoryId } = body;

    if (!productCategoryId) {
      return NextResponse.json(
        { error: 'productCategoryId is required' },
        { status: 400 }
      );
    }

    // Get pricing data for this category
    const { data: pricingGuides } = await supabase
      .from('pricing_guides')
      .select(`
        *,
        price_snapshots (
          price,
          captured_at,
          source
        ),
        price_trends (
          trend_direction,
          change_percentage
        )
      `)
      .eq('product_category_id', productCategoryId)
      .eq('is_active', true)
      .limit(50);

    if (!pricingGuides || pricingGuides.length === 0) {
      return NextResponse.json(
        { error: 'No pricing data found for this category' },
        { status: 404 }
      );
    }

    // Generate insights using Claude
    const insights = await pricingIntelligence.generateMarketInsights(
      productCategoryId,
      pricingGuides
    );

    return NextResponse.json({
      success: true,
      insights,
      message: `Generated ${insights.length} market insights`,
    });

  } catch (error: any) {
    console.error('Generate insights error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate insights' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/pricing-intelligence/insights
 * Get published market insights
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const categoryId = url.searchParams.get('categoryId');
    const insightType = url.searchParams.get('type');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    let query = supabase
      .from('market_insights')
      .select(`
        *,
        product_categories (name, slug)
      `)
      .eq('is_published', true)
      .order('generated_at', { ascending: false })
      .limit(limit);

    if (categoryId) {
      query = query.eq('product_category_id', categoryId);
    }

    if (insightType) {
      query = query.eq('insight_type', insightType);
    }

    const { data: insights, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      insights,
    });

  } catch (error: any) {
    console.error('Get insights error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get insights' },
      { status: 500 }
    );
  }
}
