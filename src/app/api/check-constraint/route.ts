import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Query existing profiles to see what subscription_tier values are in use
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_status')
      .limit(50);

    if (profileError) {
      return NextResponse.json({
        error: profileError.message
      }, { status: 500 });
    }

    // Get unique subscription tier values
    const uniqueTiers = [...new Set(profiles?.map(p => p.subscription_tier) || [])];
    const uniqueStatuses = [...new Set(profiles?.map(p => p.subscription_status) || [])];

    return NextResponse.json({
      uniqueTiers,
      uniqueStatuses,
      totalProfiles: profiles?.length || 0
    });
  } catch (error) {
    console.error('Error checking constraint:', error);
    return NextResponse.json({
      error: 'Failed to check constraint',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
