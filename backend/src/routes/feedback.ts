import { Router } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Public: Submit Feedback / Contribution
router.post('/', async (req, res, next) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    const feedback = await prisma.feedback.create({
      data: {
        name: name ? String(name).trim() : null,
        email: email ? String(email).trim() : null,
        phone: phone ? String(phone).trim() : null,
        message: String(message).trim(),
      },
    });

    res.json({ success: true, data: feedback, message: 'Thank you for your contribution!' });
  } catch (error) {
    next(error);
  }
});

// Admin: Get all feedback items
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const feedbacks = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: feedbacks });
  } catch (error) {
    next(error);
  }
});

// Admin: Mark feedback as read
router.patch('/:id/read', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const feedback = await prisma.feedback.update({
      where: { id },
      data: { isRead: true },
    });
    res.json({ success: true, data: feedback });
  } catch (error) {
    next(error);
  }
});

// Admin: Delete feedback
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.feedback.delete({ where: { id } });
    res.json({ success: true, message: 'Feedback deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
