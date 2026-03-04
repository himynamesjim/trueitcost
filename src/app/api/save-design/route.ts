import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { design_type, design_data, ai_response, title: customTitle } = await request.json();

    // Get user from Supabase
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use custom title if provided, otherwise generate AI title
    let title = customTitle || 'Untitled Design';

    if (!customTitle) {
      try {
        const titlePrompt = `Based on this IT solution design data, generate a short, descriptive title (max 6 words). Only return the title, nothing else.

Design type: ${design_type}
Design data: ${JSON.stringify(design_data).substring(0, 500)}

Examples:
- "Microsoft Teams Conference Room Setup"
- "UCaaS Solution for 50 Users"
- "Network Refresh with SD-WAN"
- "BCDR Solution with Cloud Backup"`;

        const titleResponse = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20250131',
          max_tokens: 50,
          messages: [{
            role: 'user',
            content: titlePrompt
          }]
        });

        const generatedTitle = titleResponse.content[0].type === 'text'
          ? titleResponse.content[0].text.trim().replace(/^["']|["']$/g, '')
          : 'Untitled Design';

        title = generatedTitle;
      } catch (titleError) {
        console.error('Error generating title:', titleError);
        // Fallback to design type as title
        title = `${design_type.charAt(0).toUpperCase() + design_type.slice(1)} Solution`;
      }
    }

    // Check if user can create more designs (trial limit)
    const { data: profile } = await supabase
      .from('profiles')
      .select('designs_created, subscription_status, trial_ends_at')
      .eq('id', user.id)
      .single();

    if (profile) {
      const isTrialing = profile.subscription_status === 'trialing';
      const trialActive = profile.trial_ends_at && new Date(profile.trial_ends_at) > new Date();
      const designCount = profile.designs_created || 0;

      // Check if trial user has reached limit
      if (isTrialing && trialActive && designCount >= 6) {
        return NextResponse.json({
          error: 'Design limit reached',
          message: 'You have reached your trial limit of 6 designs. Please upgrade to continue.'
        }, { status: 403 });
      }
    }

    // Save design to database
    const { data: savedDesign, error: saveError } = await supabase
      .from('saved_designs')
      .insert({
        user_id: user.id,
        design_type,
        title,
        description: `Created on ${new Date().toLocaleDateString()}`,
        design_data,
        ai_response
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving design:', saveError);
      return NextResponse.json({ error: 'Failed to save design' }, { status: 500 });
    }

    // Increment design counter
    const { error: incrementError } = await supabase.rpc('increment_design_count', {
      user_uuid: user.id
    });

    if (incrementError) {
      console.error('Error incrementing design count:', incrementError);
      // Don't fail the request, just log the error
    }

    return NextResponse.json({
      success: true,
      design: savedDesign,
      title
    });

  } catch (error) {
    console.error('Error in save-design API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
