import { Router } from 'express';
import { SearchEngine } from '../services/searchEngine';
const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) return res.status(400).json({ success: false, error: 'Missing from/to parameters' });
    const results = await SearchEngine.search(from as string, to as string);
    res.json({ success: true, data: results });
  } catch (e) { 
    next(e); 
  }
});

export default router;
