import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { authMiddleware } from '../../middleware/auth';
import { parseExcelPreview, importExcelRows } from '../../services/excelParser';

const router = Router();

// Store file in memory (max 10MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/octet-stream'
    ];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(xlsx|xls)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Only .xlsx and .xls files are allowed'));
    }
  }
});

// POST /api/admin/import/preview
// Upload Excel and return a full preview with errors
router.post(
  '/preview',
  authMiddleware,
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
      }

      const preview = parseExcelPreview(req.file.buffer);
      return res.json({ success: true, data: preview });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/admin/import/confirm
// Receive preview rows (already parsed) and import them to DB
router.post(
  '/confirm',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { rows } = req.body;
      if (!rows || !Array.isArray(rows)) {
        return res.status(400).json({ success: false, error: 'rows array required' });
      }

      const result = await importExcelRows(rows);
      return res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
