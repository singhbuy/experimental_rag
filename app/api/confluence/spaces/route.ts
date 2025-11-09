import { NextResponse } from 'next/server';
import { fetchConfluenceSpaces } from '@/lib/confluence';

/**
 * GET /api/confluence/spaces
 * Get list of Confluence spaces
 */
export async function GET() {
  try {
    const spacesData = await fetchConfluenceSpaces({ limit: 100 });

    return NextResponse.json({
      success: true,
      spaces: spacesData.results,
    });
  } catch (error: any) {
    console.error('Failed to fetch Confluence spaces:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch Confluence spaces',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
