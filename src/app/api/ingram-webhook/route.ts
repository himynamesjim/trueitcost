import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/ingram-webhook
 * Ingram Micro webhook test endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const headers = Object.fromEntries(request.headers.entries());

    console.log('='.repeat(60));
    console.log('📨 Ingram Micro Webhook Received!');
    console.log('='.repeat(60));
    console.log('\n📋 Headers:');
    console.log(JSON.stringify(headers, null, 2));
    console.log('\n📦 Body:');
    console.log(JSON.stringify(body, null, 2));
    console.log('\n' + '='.repeat(60));

    return NextResponse.json({
      success: true,
      message: 'Webhook received successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Ingram Micro webhook endpoint is ready',
    timestamp: new Date().toISOString(),
  });
}
