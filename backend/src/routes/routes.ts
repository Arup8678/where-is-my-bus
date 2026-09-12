import { Router } from 'express';
import prisma from '../lib/prisma';
const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const routes = await prisma.route.findMany({
      include: { bus: true, _count: { select: { trips: true } } }
    });
    res.json({ success: true, data: routes });
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const route = await prisma.route.findUnique({
      where: { id: req.params.id },
      include: { trips: { include: { stops: { include: { stop: true } } } }, bus: true }
    });
    if (!route) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: route });
  } catch (e) { next(e); }
});

export default router;
