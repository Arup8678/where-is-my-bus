import { NextResponse } from 'next/server';
import { SearchEngine } from '../../../../../backend/src/services/searchEngine';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (!from || !to) {
      return NextResponse.json({ success: false, error: 'Missing from or to parameter' }, { status: 400 });
    }

    const data = await SearchEngine.search(from, to);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Search API Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal error' }, { status: 500 });
  }
}
