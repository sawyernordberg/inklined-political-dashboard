import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('=== Simple Test API Route ===');
    
    return NextResponse.json({
      message: 'Simple test API is working',
      timestamp: new Date().toISOString(),
      status: 'success'
    });
    
  } catch (error) {
    console.error('Simple test API error:', error);
    return NextResponse.json({ 
      error: 'Simple test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
