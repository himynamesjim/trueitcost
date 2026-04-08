import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Update user profile to all_in (highest tier) with full access
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        subscription_tier: 'all_in',
        subscription_status: 'active',
        trial_ends_at: null,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error upgrading account:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Account upgraded to premium with full access',
      user_id: user.id
    });
  } catch (error) {
    console.error('Error upgrading account:', error);
    return NextResponse.json({ error: 'Failed to upgrade account' }, { status: 500 });
  }
}
