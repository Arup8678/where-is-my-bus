import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tripId } = await params;
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        stops: { include: { stop: true }, orderBy: { sequence: 'asc' } },
        route: { include: { bus: true } },
        delays: { where: { expiresAt: null }, take: 1, orderBy: { setAt: 'desc' } }
      }
    });

    if (!trip) {
      return NextResponse.json({ success: false, error: 'Trip not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: trip });
  } catch (error: any) {
    console.error('Trip details API Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal error' }, { status: 500 });
  }
}
