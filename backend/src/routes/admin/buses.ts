import { Router } from 'express';
import prisma from '../../lib/prisma';
import { authMiddleware } from '../../middleware/auth';

const router = Router();
router.use(authMiddleware);

// GET /api/admin/buses
router.get('/', async (req, res, next) => {
  try {
    const buses = await prisma.bus.findMany({
      include: { _count: { select: { routes: true } } },
      orderBy: { name: 'asc' }
    });
    const data = buses.map(b => ({
      id: b.id,
      name: b.name,
      contactNo: b.contactNo,
      isActive: b.isActive,
      routeCount: b._count.routes,
      createdAt: b.createdAt.toISOString()
    }));
    res.json({ success: true, data });
  } catch (e) { next(e); }
});

// POST /api/admin/buses
router.post('/', async (req, res, next) => {
  try {
    const { name, contactNo } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, error: 'Bus name is required' });
    const bus = await prisma.bus.create({ data: { name: name.trim(), contactNo: contactNo?.trim() || null } });
    res.status(201).json({ success: true, data: bus });
  } catch (e: any) {
    if (e.code === 'P2002') return res.status(409).json({ success: false, error: 'Bus name already exists' });
    next(e);
  }
});

// PUT /api/admin/buses/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { name, contactNo, isActive } = req.body;
    const bus = await prisma.bus.update({
      where: { id: req.params.id },
      data: {
        name: name?.trim(),
        contactNo: contactNo?.trim() || null,
        isActive: typeof isActive === 'boolean' ? isActive : undefined
      }
    });
    res.json({ success: true, data: bus });
  } catch (e: any) {
    if (e.code === 'P2025') return res.status(404).json({ success: false, error: 'Bus not found' });
    next(e);
  }
});

// DELETE /api/admin/buses/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.bus.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Bus deleted' });
  } catch (e: any) {
    if (e.code === 'P2025') return res.status(404).json({ success: false, error: 'Bus not found' });
    next(e);
  }
});

// PATCH /api/admin/buses/:id/toggle
router.patch('/:id/toggle', async (req, res, next) => {
  try {
    const bus = await prisma.bus.findUnique({ where: { id: req.params.id } });
    if (!bus) return res.status(404).json({ success: false, error: 'Bus not found' });
    const updated = await prisma.bus.update({
      where: { id: req.params.id },
      data: { isActive: !bus.isActive }
    });
    res.json({ success: true, data: updated });
  } catch (e) { next(e); }
});

export default router;
