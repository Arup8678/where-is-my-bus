import { Router } from 'express';
import prisma from '../../lib/prisma';
import { authMiddleware } from '../../middleware/auth';
import { LocationEngine } from '../../services/locationEngine';
import { BusStatus } from '../../types/shared';

const router = Router();
router.use(authMiddleware);

const tripInclude = {
  route: { include: { bus: true } },
  stops: { include: { stop: true }, orderBy: { sequence: 'asc' as const } },
  delays: { where: { expiresAt: null as null }, take: 1, orderBy: { setAt: 'desc' as const } }
};

// GET /api/admin/trips — all trips with current status
router.get('/', async (req, res, next) => {
  try {
    const trips = await prisma.trip.findMany({ include: tripInclude, orderBy: { createdAt: 'desc' } });
    const data = trips.map(trip => {
      const delayMinutes = trip.delays[0]?.delayMinutes || 0;
      const loc = trip.stops.length ? LocationEngine.getCurrentLocation(trip as any, delayMinutes) : null;
      return {
        id: trip.id,
        busName: trip.route.bus.name,
        routeName: trip.route.name,
        contactNo: trip.route.bus.contactNo,
        status: loc?.status || BusStatus.NOT_STARTED,
        delayMinutes,
        stopsCount: trip.stops.length,
        isActive: trip.isActive
      };
    });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/trips/live — currently running & delayed trips only
router.get('/live', async (req, res, next) => {
  try {
    const trips = await prisma.trip.findMany({
      where: { isActive: true },
      include: tripInclude,
      orderBy: { createdAt: 'desc' }
    });

    const live = trips
      .map(trip => {
        const delayMinutes = trip.delays[0]?.delayMinutes || 0;
        if (!trip.stops.length) return null;
        const loc = LocationEngine.getCurrentLocation(trip as any, delayMinutes);
        if (loc.status === BusStatus.NOT_STARTED || loc.status === BusStatus.COMPLETED) return null;
        return {
          id: trip.id,
          busName: trip.route.bus.name,
          routeName: trip.route.name,
          contactNo: trip.route.bus.contactNo,
          status: loc.status,
          delayMinutes,
          currentLocation: loc.currentLocation,
          nextStop: loc.upcomingStops[0] || null,
          passedStopsCount: loc.passedStops.length,
          totalStops: trip.stops.length,
          lastUpdated: loc.lastUpdated
        };
      })
      .filter(Boolean);

    res.json({ success: true, data: live });
  } catch (e) { next(e); }
});

// POST /api/admin/trips — create trip with stops
router.post('/', async (req, res, next) => {
  try {
    const { routeId, stops } = req.body;
    if (!routeId) return res.status(400).json({ success: false, error: 'routeId required' });

    const trip = await prisma.$transaction(async (tx) => {
      const t = await tx.trip.create({ data: { routeId } });
      if (stops?.length) {
        for (const s of stops) {
          await tx.tripStop.create({
            data: { tripId: t.id, stopId: s.stopId, sequence: s.sequence, scheduledTime: s.scheduledTime }
          });
        }
      }
      return t;
    });

    res.status(201).json({ success: true, data: trip });
  } catch (e) { next(e); }
});

// PUT /api/admin/trips/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const data = await prisma.trip.update({
      where: { id: req.params.id },
      data: { isActive: typeof isActive === 'boolean' ? isActive : undefined }
    });
    res.json({ success: true, data });
  } catch (e: any) {
    if (e.code === 'P2025') return res.status(404).json({ success: false, error: 'Trip not found' });
    next(e);
  }
});

// DELETE /api/admin/trips/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.trip.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Trip deleted' });
  } catch (e: any) {
    if (e.code === 'P2025') return res.status(404).json({ success: false, error: 'Trip not found' });
    next(e);
  }
});

export default router;
