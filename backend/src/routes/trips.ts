import { Router } from 'express';
import prisma from '../lib/prisma';
import { LocationEngine } from '../services/locationEngine';
const router = Router();

router.get('/:id', async (req, res, next) => {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: req.params.id },
      include: { stops: { include: { stop: true }, orderBy: { sequence: 'asc' } }, route: { include: { bus: true } }, delays: { where: { expiresAt: null }, take: 1, orderBy: { setAt: 'desc' } } }
    });
    if (!trip) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: trip });
  } catch (e) { next(e); }
});

router.get('/:id/location', async (req, res, next) => {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: req.params.id },
      include: { stops: { include: { stop: true }, orderBy: { sequence: 'asc' } }, route: { include: { bus: true } }, delays: { where: { expiresAt: null }, take: 1, orderBy: { setAt: 'desc' } } }
    });
    if (!trip) return res.status(404).json({ success: false, error: 'Not found' });
    const delayMinutes = trip.delays[0]?.delayMinutes || 0;
    const loc = LocationEngine.getCurrentLocation(trip as any, delayMinutes);
    res.json({ success: true, data: loc });
  } catch (e) { next(e); }
});

export default router;
