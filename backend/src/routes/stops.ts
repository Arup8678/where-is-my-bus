import { Router } from 'express';
import prisma from '../lib/prisma';
const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const q = req.query.q as string;
    const stops = await prisma.stop.findMany({
      where: q ? { OR: [{ name: { contains: q } }, { nameBn: { contains: q } }] } : undefined,
      include: { aliases: true }
    });
    res.json({ success: true, data: stops });
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const stop = await prisma.stop.findUnique({ where: { id: req.params.id }, include: { aliases: true } });
    if (!stop) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: stop });
  } catch (e) { next(e); }
});

export default router;
