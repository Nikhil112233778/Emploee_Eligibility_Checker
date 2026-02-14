import { NextResponse } from 'next/server';

// This endpoint triggers cache warming
export async function GET() {
  try {
    // Import the getEmployeeById function to trigger cache preload
    const { getEmployeeById } = await import('@/lib/sheets');

    // Make a dummy call to trigger preload
    await getEmployeeById('__WARMUP__');

    return NextResponse.json({
      status: 'Cache warmed up successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Warmup error:', error);
    return NextResponse.json(
      { error: 'Warmup failed' },
      { status: 500 }
    );
  }
}
