import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const design_type = searchParams.get('design_type');

    // Build query
    let query = supabase
      .from('saved_designs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Filter by design type if provided
    if (design_type) {
      query = query.eq('design_type', design_type);
    }

    const { data: designs, error } = await query;

    if (error) {
      console.error('Error fetching designs:', error);
      return NextResponse.json({ error: 'Failed to fetch designs' }, { status: 500 });
    }

    return NextResponse.json({ designs });

  } catch (error) {
    console.error('Error in get-designs API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { design_id } = await request.json();

    if (!design_id) {
      return NextResponse.json({ error: 'Design ID required' }, { status: 400 });
    }

    // Delete design (only if it belongs to the user)
    const { error } = await supabase
      .from('saved_designs')
      .delete()
      .eq('id', design_id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting design:', error);
      return NextResponse.json({ error: 'Failed to delete design' }, { status: 500 });
    }

    // Decrement the design counter for trial users
    try {
      const { data: decrementResult, error: decrementError } = await supabase
        .rpc('decrement_design_count', { user_uuid: user.id });

      if (decrementError) {
        console.error('Error decrementing design count:', decrementError);
        // Don't fail the delete operation if decrement fails, just log it
      } else {
        console.log('Design count decremented to:', decrementResult);
      }
    } catch (decrementErr) {
      console.error('Failed to call decrement function:', decrementErr);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in delete design API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { design_id, title } = await request.json();

    if (!design_id || !title) {
      return NextResponse.json({ error: 'Design ID and title required' }, { status: 400 });
    }

    // Update design title (only if it belongs to the user)
    const { data, error } = await supabase
      .from('saved_designs')
      .update({ title: title.trim(), updated_at: new Date().toISOString() })
      .eq('id', design_id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating design:', error);
      return NextResponse.json({ error: 'Failed to update design' }, { status: 500 });
    }

    return NextResponse.json({ success: true, design: data });

  } catch (error) {
    console.error('Error in update design API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
