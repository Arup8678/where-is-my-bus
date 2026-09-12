import { Router } from 'express';
import prisma from '../../lib/prisma';
import { authMiddleware } from '../../middleware/auth';
import { LocationEngine } from '../../services/locationEngine';
import { BusStatus } from '../../types/shared';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req, res, next) => {
  try {
    const [totalBuses, totalRoutes, totalStops, totalTrips] = await Promise.all([
      prisma.bus.count(),
      prisma.route.count(),
      prisma.stop.count(),
      prisma.trip.count({ where: { isActive: true } })
    ]);

    // Calculate running/delayed/completed by checking all active trips
    const trips = await prisma.trip.findMany({
      where: { isActive: true },
      include: {
        stops: { include: { stop: true }, orderBy: { sequence: 'asc' } },
        route: { include: { bus: true } },
        delays: { where: { expiresAt: null }, take: 1, orderBy: { setAt: 'desc' } }
      }
    });

    let runningTrips = 0;
    let delayedTrips = 0;
    let completedTrips = 0;

    for (const trip of trips) {
      if (trip.stops.length === 0) continue;
      const delayMinutes = trip.delays[0]?.delayMinutes || 0;
      const loc = LocationEngine.getCurrentLocation(trip as any, delayMinutes);
      if (loc.status === BusStatus.RUNNING) runningTrips++;
      else if (loc.status === BusStatus.DELAYED) delayedTrips++;
      else if (loc.status === BusStatus.COMPLETED) completedTrips++;
    }

    res.json({
      success: true,
      data: {
        totalBuses,
        totalRoutes,
        totalStops,
        totalTrips,
        runningTrips,
        delayedTrips,
        completedTrips
      }
    });
  } catch (e) { next(e); }
});

export default router;
