import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../lib/prisma';
import { authMiddleware } from '../../middleware/auth';
const router = Router();

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any });
    res.json({ success: true, data: { token, user: { id: user.id, email: user.email, name: user.name } } });
  } catch(e) { next(e); }
});

router.get('/me', authMiddleware, async (req: any, res) => {
  res.json({ success: true, data: req.user });
});

export default router;
