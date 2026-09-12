import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { LocationEngine } from '@/lib/locationEngine';

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

    const delayMinutes = trip.delays[0]?.delayMinutes || 0;
    const locationInfo = LocationEngine.getCurrentLocation(trip, delayMinutes);

    return NextResponse.json({ success: true, data: locationInfo });
  } catch (error: any) {
    console.error('Trip location API Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal error' }, { status: 500 });
  }
}
