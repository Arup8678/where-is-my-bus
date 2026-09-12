import { NextResponse } from 'next/server';
import prisma from '../../../../../backend/src/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';

    const stops = await prisma.stop.findMany({
      where: q ? {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { nameBn: { contains: q, mode: 'insensitive' } },
          { aliases: { some: { alias: { contains: q, mode: 'insensitive' } } } }
        ]
      } : undefined,
      include: { aliases: true },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ success: true, data: stops });
  } catch (error: any) {
    console.error('Stops API Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal error' }, { status: 500 });
  }
}
