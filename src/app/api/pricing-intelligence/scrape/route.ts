import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { pricingIntelligence } from '@/lib/pricing-intelligence';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/pricing-intelligence/scrape
 * Trigger a web scrape job for pricing data
 *
 * Body:
 * - targetUrl: string - URL to scrape
 * - vendorId: string (optional) - Associated vendor
 * - scrapeType: 'pricing' | 'specs' | 'availability' | 'bulk'
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
        { error: 'Only administrators can create scrape jobs' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { targetUrl, vendorId, scrapeType = 'pricing' } = body;

    if (!targetUrl) {
      return NextResponse.json(
        { error: 'targetUrl is required' },
        { status: 400 }
      );
    }

    // Create scrape job
    const jobId = await pricingIntelligence.scrapeVendorPage(
      {
        targetUrl,
        vendorId,
        scrapeType,
        screenshot: true,
      },
      user.id
    );

    return NextResponse.json({
      success: true,
      jobId,
      message: 'Scrape job created and processing',
    });

  } catch (error: any) {
    console.error('Scrape job error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create scrape job' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/pricing-intelligence/scrape/:jobId
 * Get scrape job status and results
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const jobId = url.searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: 'jobId is required' },
        { status: 400 }
      );
    }

    // Get job details
    const { data: job, error } = await supabase
      .from('web_scrape_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error || !job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        targetUrl: job.target_url,
        status: job.status,
        scrapeType: job.scrape_type,
        startedAt: job.started_at,
        completedAt: job.completed_at,
        durationSeconds: job.duration_seconds,
        extractedData: job.extracted_data,
        errorMessage: job.error_message,
      },
    });

  } catch (error: any) {
    console.error('Get scrape job error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get scrape job' },
      { status: 500 }
    );
  }
}
