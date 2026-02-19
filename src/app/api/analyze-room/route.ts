import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { images, prompt } = body;

    // Build content array with all images
    const content: any[] = [];
    images.forEach((img: { base64: string; mediaType: string }) => {
      content.push({
        type: "image",
        source: { type: "base64", media_type: img.mediaType, data: img.base64 }
      });
    });

    content.push({ type: "text", text: prompt });

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [{
          role: "user",
          content
        }]
      })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData?.error?.message || `API returned status ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Room analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze room' },
      { status: 500 }
    );
  }
}
