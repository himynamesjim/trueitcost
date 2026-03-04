import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { design_id, design_data, ai_response, title } = await request.json();

    if (!design_id) {
      return NextResponse.json({ error: 'Design ID required' }, { status: 400 });
    }

    // Update design (only if it belongs to the user)
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (design_data !== undefined) {
      updateData.design_data = design_data;
    }

    if (ai_response !== undefined) {
      updateData.ai_response = ai_response;
    }

    if (title !== undefined) {
      updateData.title = title;
    }

    const { data, error } = await supabase
      .from('saved_designs')
      .update(updateData)
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
