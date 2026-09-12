import { Router } from 'express';
import prisma from '../../lib/prisma';
import { authMiddleware } from '../../middleware/auth';
const router = Router();
router.use(authMiddleware);

router.get('/', async (req, res, next) => {
  try {
    const data = await prisma.route.findMany();
    res.json({ success: true, data });
  } catch(e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const data = await prisma.route.create({ data: req.body });
    res.json({ success: true, data });
  } catch(e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const data = await prisma.route.update({ where: { id: req.params.id }, data: req.body });
    res.json({ success: true, data });
  } catch(e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.route.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch(e) { next(e); }
});
export default router;
