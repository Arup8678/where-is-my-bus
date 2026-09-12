import { Router } from 'express';
import prisma from '../../lib/prisma';
import { authMiddleware } from '../../middleware/auth';
const router = Router();
router.use(authMiddleware);

router.get('/', async (req, res, next) => {
  try {
    const data = await prisma.delay.findMany({ where: { expiresAt: null } });
    res.json({ success: true, data });
  } catch(e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const data = await prisma.delay.create({ data: req.body });
    res.json({ success: true, data });
  } catch(e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.delay.update({ where: { id: req.params.id }, data: { expiresAt: new Date() } });
    res.json({ success: true });
  } catch(e) { next(e); }
});
export default router;
